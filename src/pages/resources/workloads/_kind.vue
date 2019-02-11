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
      <!-- Deploy -->
      <template slot="replicas" slot-scope="{val}">
        {{ (kind === 'sts' ? val.currentReplicas : val.availableReplicas) || '0' }} / {{ val.replicas || 0 }}
      </template>

      <!-- STS -->
      <labels slot="selector" slot-scope="{val}" v-bind:labels="val.matchLabels"/>
      <template slot="volume-temp" slot-scope="{val}">
        <span v-for="vol in val" :key="vol.metadata.name">
          {{ `${vol.metadata.name} - ${sizeOf(vol.spec.resources.requests.storage.number)} (${vol.status.phase})` }}
        </span>
      </template>

      <!-- ReplicaSet-->
      <template slot="revision" slot-scope="{val}">
        {{ val.annotations['deployment.kubernetes.io/revision'] }}
      </template>

      <!-- CronJob -->
      <template slot="last-schedule" slot-scope="{val}">
        {{ val | moment('from', true) || '-' }}
      </template>
      <template slot="suspend" slot-scope="{val}">
        {{ val }}
      </template>
      <template slot="active" slot-scope="{val}">
        {{ val || '0' }}
      </template>
      <template slot="job-history" slot-scope="{val, item}">
        <a @click="moveToChildJob(item.metadata.name)">
          Success: {{ val.successfulJobsHistoryLimit }}
          Failed:  {{ val.failedJobsHistoryLimit }}
        </a>
      </template>

      <!-- Pod -->
      <template slot="age" slot-scope="{val}">
        {{ val | moment('from', true) || '-' }}
      </template>
      <template slot="restarts" slot-scope="{val}">
        {{ val ? val.reduce((s, c) => s + c.restartCount, 0) : '!!!' }}
      </template>

    </resource-table>

  </layout-content>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

const KIND_ITEMS = [
  // ** workload
  {text: 'Deployment', value: 'deploy'},
  {text: 'StatefulSets', value: 'sts'},
  {text: 'Pod', value: 'pod'},
  // {text: 'ReplicaController', value: 'sts'},
  {text: 'ReplicaSet', value: 'rs'},
  {text: 'DaemonSet', value: 'ds'},
  {text: 'CronJob', value: 'cronjob'},
  {text: 'Job', value: 'job'}
]

const HEADERS = {
  deploy: 'Name,Replicas,Age,Action'.split(','),
  sts: 'Name,Replicas,Selector,Volume-Temp,Age,Action'.split(','),
  pod: 'Name,Node,Status,Restarts,Age,Action'.split(','),
  rs: 'Name,Revision,Replicas,Age,Action'.split(','),
  cronjob: 'Name,Schedule,Suspend,Active,Last-Schedule,Job-History,Age,Action'.split(','),
  job: 'Name,Namespace,Age,Action'.split(',')
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
  watch: {
    $route () {
      this.readUrlParams()
    }
  },
  methods: {
    ...mapMutations(['setKindItem']),
    readUrlParams () {
      this.table.keyword = this.$route.query.keyword || ''
    },
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
    },
    moveToChildJob (name) {
      location.hash = `#/resources/workloads/job?ns=${this.ns}&keyword=${name}`
    }
  },
  created () {
    this.setKindItem(KIND_ITEMS)
    this.readUrlParams()

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
