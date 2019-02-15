<template>
  <!-- Resource Spec (YAML) -->
  <v-dialog v-model="show" :fullscreen="full" max-width="1000">
    <v-card>
      <v-card-title class="log-dialog headline grey lighten-2" primary-title>
        {{ _.property(['metadata', 'name'])(item) }}
        <v-spacer></v-spacer>
        <v-btn color="primary" flat icon @click="full = !full">
          <v-icon>{{ !full ? 'fullscreen' : 'fullscreen_exit' }}</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <log :info="meta"/>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="show = false">Close</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: ['value', 'item'],
  data () {
    return {
      full: false,
      meta: {
        show: true,
        // cs: undefined,
        // ns: undefined,
        // selected: {},
        api: {
          ws: '/api/logs',
          http: '/api/log'
        },
        pod: '-',
        con: {items: ['alpine']}
      }
    }
  },
  computed: {
    ...mapState(['ns', 'kind']),
    show: { /* https://stackoverflow.com/a/49119008 */
      get () {
        this.value ? this.updateInfo() : this.cleanup()
        return this.value
      },
      set (val) { this.$emit('input', val) }
    }
  },
  methods: {
    updateInfo () {
      this.meta.show = true
      this.meta.reset = true
      // this.info.selected = {}

      // this.meta.api = '/api/logs'
      this.meta.pod = this.item.metadata.name
      this.meta.con.items = this._.map(this.item.spec.containers, container => container.name)
    },
    cleanup () {
      this.full = false
      this.meta.show = false
    }
  }
}
</script>

<style>
.log-dialog { padding: 8px; font-size: 20px!important; }
</style>
