<template>
  <layout-content>
    <template slot="title">
      <v-layout>
        <kind-select/>
        <v-btn icon flat color="grey" @click="updateData()" class="btn-refresh">
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

      <!-- PVC -->
      <template slot="capacity" slot-scope="{val}">
        {{ val | sizeOf }}
      </template>
      <template slot="access-modes" slot-scope="{val}">
        {{ val.join(', ') }}
      </template>

    </resource-table>

  </layout-content>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

const KIND_ITEMS = [
  // ** volume
  {text: 'PersistentVolumeClaim', value: 'pvc'}
]

const HEADERS = {
  pvc: 'Name,Pvc-Status,Volume,Capacity,Access-Modes,Storage-Class,Age,Action'.split(',')
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
          this.table.loading = false
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
    this.updateData()
  }
}
</script>

<style scoped>
.btn-refresh { top: 12px; }
</style>
