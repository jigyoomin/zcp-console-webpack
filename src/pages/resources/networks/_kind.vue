<template>
  <layout-content>
    <template slot="title">
      <v-layout>
        <kind-select/>
        <v-btn icon flat color="grey"  @click="updateData()">
          <v-icon>replay</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field v-model="table.keyword" @keyup.esc="table.keyword = undefined"
          hide-details clearable
          append-icon="search" label="Search"></v-text-field>
      </v-layout>
    </template>

    <resource-table v-bind="table">
      <template slot="age" slot-scope="{val}">
        {{ val | moment('from', true) || '-' }}
      </template>
      <template slot="restarts" slot-scope="{val}">
        {{ val ? val.reduce((s, c) => s + c.restartCount, 0) : '!!!' }}
      </template>

      <!-- Service -->
      <labels slot="selector" slot-scope="{val}" v-bind:labels="val"/>
      <template slot="service-endpoint" slot-scope="{item}">
        {{ item.spec.type === 'LoadBalancer' ? item.status.loadBalancer.ingress[0].ip : item.spec.clusterIP }}
      </template>

      <!-- Ingress -->
      <template slot="url" slot-scope="{val}">
        <a v-for="v in val" :key="v.url" target="_blink" :href="v.url">
          {{ v.url}}
        </a>
      </template>
      <template slot="service" slot-scope="{val}">
        <span v-for="v in val" :key="v.service" v-text="v.service"></span>
      </template>
      <template slot="address" slot-scope="{val}">
        <span v-text="val[0].address"></span>
      </template>
      <template slot="secret" slot-scope="{val}">
        <span v-for="v in val" :key="v.secret" v-text="v.secret"></span>
      </template>

    </resource-table>

  </layout-content>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

const KIND_ITEMS = [
  // ** network
  {text: 'Service', value: 'svc'},
  {text: 'Ingress', value: 'ing'},
  {text: 'NetworkPolicy', value: 'netpol'}
]

const HEADERS = {
  svc: 'Name,Selector,ClusterIP,Service-Endpoint,Age,Action'.split(','),
  ing: 'Name,Url,Service,Address,Secret,Age,Action'.split(','),
  netpol: 'Name,Namespace,Age,Action'.split(',')
}

export default {
  data () {
    return {
      cs: '',
      table: {
        keyword: '',
        loading: false,
        data: [],
        headers: HEADERS
      }
    }
  },
  computed: {
    ...mapState(['select', 'ns', 'kind'])
  },
  methods: {
    ...mapMutations(['setKindItem']),
    updateData () {
      if (!this.kind || !this.ns) {
        return
      }

      const URL = `/api/resource/${this.kind}?type=yaml&cs=${this.cs}&ns=${this.ns}`
      this.table.loading = true

      this.$http
        .get(URL)
        .then((res) => {
          this.table.data = res.data.items

          if (this.kind === 'ing') {
            let _ = this.$_

            let to = {
              ip: 'status.loadBalancer.ingress.0.ip'.split('.'),
              tls: 'spec.tls'.split('.'),
              rules: 'spec.rules'.split('.')
            }
            // generate url
            res.data.items.forEach(ing => {
              let _ing = _(ing)
              let ip = _ing.propertyOf()(to.ip) || '<unbound>'
              let tls = _ing.propertyOf()(to.tls) || []
              tls = _(tls).map(v => v && v.hosts).flatten()
              let secret = _ing.propertyOf()(to.tls) || []
              secret = _(secret).map(v => v && v.secretName)
              let _routes = _ing.propertyOf()(to.rules)

              ing._extract = _routes.map(({host, http}) => {
                let protocol = _(tls).contains(host) ? 'https' : 'http'
                return _(http.paths).map(({path, backend}) => {
                  return {
                    url: `${protocol}://${host || ip}${path || ''}`,
                    service: `${backend.serviceName}:${backend.servicePort}`,
                    address: ip,
                    secret: secret
                  }
                })
              }).flatten()
              console.log(ip, tls, secret, ing._extract)
            })
          }

          this.table.loading = false
        })
    },
    sizeOf (bytes) {
      // https://stackoverflow.com/a/28120564
      // https://github.com/kubernetes/community/blob/master/contributors/design-proposals/scheduling/resources.md#resource-quantities
      if (bytes === 0) { return '0.0 Bi' }
      if (!bytes) { return '-' }
      var e = Math.floor(Math.log(bytes) / Math.log(1024))
      var s = (bytes / Math.pow(1024, e)).toFixed(1)
      return `${s} ${' KMGTP'.charAt(e)}i`
    }
  },
  created () {
    this.setKindItem(KIND_ITEMS)

    /**
     * https://vuex.vuejs.org/kr/api/#watch
     */
    this.$store.watch(() => this.ns, this.updateData)
    this.$store.watch(() => this.kind, this.updateData)
  },
  mounted () {
    if (this.table.data.length === 0) {
      this.updateData()
    }
  }
}
</script>
