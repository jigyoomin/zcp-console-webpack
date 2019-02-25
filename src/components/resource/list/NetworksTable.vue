<template>
  <layout-content>
    <template slot="title">
      <v-layout>
        <kind-select/>
        <v-btn icon flat color="grey"  @click="updateData()" class="btn-refresh">
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
        <div v-for="v in val" :key="v.url">
          <a target="_blink" :href="v.url">{{v.url}}</a>
        </div>
      </template>
      <template slot="service" slot-scope="{val}">
        <div v-for="v in val" :key="v.service" v-text="v.service"></div>
      </template>
      <template slot="address" slot-scope="{val}">
        <span v-text="val[0].address"></span>
      </template>
      <template slot="secret" slot-scope="{val}">
        <div v-for="(v, i) in val" :key="i" v-text="v.secret"></div>
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
      const _ = this.$_
      const valid = _.contains(_.keys(HEADERS), this.kind)
      if (!valid || !this.kind || !this.ns) { return }

      const URL = `/api/resource/${this.kind}?type=yaml&cs=${this.cs}&ns=${this.ns}`
      const call = this.$http
        .get(URL)
        .then((res) => {
          this.table.data = res.data.items

          this.kind === 'ing' && this.buildIngressData()
        })
      this.$progress(call, this.table)
    },
    buildIngressData () {
      let _ = this.$_
      let path = [
        'status.loadBalancer.ingress.0.ip'.split('.'),
        'spec.tls'.split('.'),
        'spec.rules'.split('.')
      ]

      // generate url
      this.table.data.forEach(spec => {
        let [ip, tls, rules] = _.map(path, p => _.property(p)(spec))
        let secret = {}
        let protocol = {}

        _.reduce(tls, (none, tls) => {
          _.each(tls.hosts, host => {
            secret[host] = tls.secretName
            protocol[host] = 'https'
          })
        }, {})

        ip = ip || '<unbound>'
        spec._extract = _.map(rules, ({host, http}) => {
          return _.map(http.paths, ({path, backend}) => {
            return {
              url: `${protocol[host] || 'http'}://${host || ip}${path || ''}`,
              service: `${backend.serviceName}:${backend.servicePort}`,
              address: ip,
              secret: secret[host]
            }
          })
        }).flatten()
      })
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
    this.updateData()
  }
}
</script>

<style scoped>
.btn-refresh { top: 12px; }
</style>
