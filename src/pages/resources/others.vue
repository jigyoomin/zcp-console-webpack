<template>
  <layout-content>
    <template slot="title">
      <v-layout>
        <kind-select/>
        <v-btn icon flat color="grey" @click="updateData()">
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

    </resource-table>

  </layout-content>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

const KIND_ITEMS = [
  // ** cluster
  {text: 'Nodes', value: 'no'},
  {text: 'Namespaces', value: 'ns'},
  {text: 'PersistentVolume', value: 'pv'},
  // ** inspection
  {text: 'Events', value: 'ev'},
  // ** auth
  {text: 'ServiceAccount', value: 'sa'},
  {text: 'Role', value: 'roles'},
  {text: 'RoleBindings', value: 'rolebindings'},
  {text: 'ClusterRole', value: 'clusterroles'},
  {text: 'ClusterRoleBinding', value: 'clusterrolebindings'},
  // ** volume
  {text: 'StorageClass', value: 'sc'}
]

const HEADERS = {
  no: 'Name,Namespace,Age,Action'.split(','),
  ns: 'Name,Namespace,Age,Action'.split(','),
  pv: 'Name,Namespace,Age,Action'.split(','),
  ev: 'Name,Namespace,Age,Action'.split(','),
  sa: 'Name,Namespace,Age,Action'.split(','),
  clusterrolebindings: 'Name,Namespace,Age,Action'.split(','),
  clusterroles: 'Name,Namespace,Age,Action'.split(','),
  roles: 'Name,Namespace,Age,Action'.split(','),
  rolebindings: 'Name,Namespace,Age,Action'.split(','),
  sc: 'Name,Namespace,Age,Action'.split(',')
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
