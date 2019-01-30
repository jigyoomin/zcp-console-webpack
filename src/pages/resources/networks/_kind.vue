<template>
  <layout-content>
    <template slot="title">
      <v-layout>
        <kind-select/>
        <v-spacer></v-spacer>
        <v-text-field v-model="table.keyword" @keyup.esc="table.keyword = undefined"
          hide-details clearable
          append-icon="search" label="Search"></v-text-field>
      </v-layout>
    </template>

    <resource-table v-bind="table">
      <template slot="age" slot-scope="{val}">
        {{ val.millis | moment('from', true) || '-' }}
      </template>
      <template slot="restarts" slot-scope="{val}">
        {{ val ? val.reduce((s, c) => s + c.restartCount, 0) : '!!!' }}
      </template>

      <!-- Service -->
      <labels slot="selector" slot-scope="{val}" v-bind:labels="val"/>
      <template slot="service-endpoint" slot-scope="{item}">
        {{ item.spec.type === 'LoadBalancer' ? item.status.loadBalancer.ingress[0].ip : item.spec.clusterIP }}
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
  ing: 'Name,Selector,ClusterIP,Service-Endpoint,Age,Action'.split(','),
  netpol: 'Name,Namespace,Age,Action'.split(',')
}

export default {
  data () {
    return {
      cs: '',
      table: {
        keywoard: '',
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

      const URL = `/api/${this.kind}/list?type=yaml&cs=${this.cs}&ns=${this.ns}`
      this.table.loading = true

      this.$http
        .get(URL)
        .then((res) => {
          this.table.data = res.data.items
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
