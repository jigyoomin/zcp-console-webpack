<template>
  <layout-content>
    <template slot="title">
      <v-layout>
        <kind-select/>
        <v-btn icon flat color="grey" @click="updateData" class="btn-refresh">
          <v-icon>replay</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field v-model="$table.keyword" @keyup.esc="$table.keyword = undefined"
          hide-details clearable
          append-icon="search" label="Search"></v-text-field>
      </v-layout>
    </template>

    <resource-table v-bind="$table" @pageable="updateData">
      <template slot="age" slot-scope="{val}">
        {{ val | moment('from', true) || '-' }}
      </template>

    </resource-table>

  </layout-content>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import Pageable, { asPageable } from '@/mixins/pageable'

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
        keyword: null,
        loading: false,
        data: [],
        headers: HEADERS,
        totalItems: null
      }
    }
  },
  computed: {
    ...mapState(['select', 'ns', 'kind']),
    ...asPageable({ target: 'table', $active () { return this.kind === 'ev' } })
  },
  mixins: [Pageable],
  methods: {
    ...mapMutations(['setKindItem']),
    updateData () {
      if (!this.kind || !this.ns) {
        return
      }

      const URL = `/api/resource/${this.kind}?type=yaml&cs=${this.cs}&ns=${this.ns}&keyword=${this.$table.keyword}&${this.$pageable.query}`
      const call = this.$http
        .get(URL)
        .then((res) => {
          this.table.data = res.data.items || []
          this.table.totalItems = res.data.total
        })
      this.$progress(call, this.table)
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

<style scoped>
.btn-refresh { top: 12px; }
</style>
