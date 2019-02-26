<template>
  <!-- Resource Spec (YAML) -->
  <v-dialog v-model="show" :fullscreen="full" max-width="1000">
    <v-card>
      <v-card-title class="headline grey lighten-2" primary-title>
        {{ _.property(['metadata', 'name'])(item) }}
        <v-spacer></v-spacer>
        <v-btn color="primary" flat icon @click="full = !full">
          <v-icon>{{ !full ? 'fullscreen' : 'fullscreen_exit' }}</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-snackbar top right absolute
            v-model="snack.show"
            v-bind="snack">
          {{ snack.text }}
          <!-- <v-btn v-if="snack.color === 'error'" flat @click="snack.text = undefined">Close</v-btn> -->
        </v-snackbar>

        <codemirror v-model="code" :options="options"></codemirror>
      </v-card-text>

      <v-card-actions>
        <v-progress-linear v-if="loading" color="blue" indeterminate></v-progress-linear>
        <v-spacer></v-spacer>
        <!-- <v-select :items="format" label="Format" v-model="encoding" v-if="kind === 'secret'"></v-select> -->
        <v-btn color="blue darken-1" flat @click="replaceYaml()">Save</v-btn>
        <v-btn color="blue darken-1" flat @click="show = false">Close</v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

import 'codemirror/theme/base16-dark.css'
import 'codemirror/mode/yaml/yaml.js'
import Yaml from 'js-yaml'

const PLACE_HOLDER = '(loading...)'

export default {
  props: ['value', 'item'],
  data () {
    return {
      code: PLACE_HOLDER,
      code_error: [],
      loading: false,
      full: false,
      snack: {show: false, color: 'info', text: '', timeout: 1000},
      options: {
        // codemirror options
        tabSize: 2,
        mode: 'text/x-yaml',
        theme: 'base16-dark',
        lineNumbers: true,
        line: true
      },
      format: null,
      encoding: null
    }
  },
  computed: {
    ...mapState(['ns', 'kind']),
    show: { /* https://stackoverflow.com/a/49119008 */
      get () {
        this.value && this.loadYaml()
        return this.value
      },
      set (val) { this.$emit('input', val) }
    }
  },
  // watch: {
  //   encoding (_to, _from) {
  //     this.formatter(undefined, _from, _to)
  //   }
  // },
  methods: {
    loadYaml () {
      if (!this.item) {
        return
      }

      // clean up
      let cs = '-'
      this.loading = true
      this.code = PLACE_HOLDER
      this.code_error = []

      let call = this.$http
        .get(`/api/resource/${this.kind}/${this.item.metadata.name}?type=yaml&cs=${cs}&ns=${this.ns}`)
        .then((res) => {
          if (!res.data) {
            console.log('ERR : There is no data. Retry to request.')
            // return this.loadYaml()
          }
          this.setCodeAsYaml(res.data)
        })
      this.$progress(call, this)
    },
    replaceYaml () {
      var cs = '-'
      var url = `/api/resource/${this.kind}/${this.item.metadata.name}?type=yaml&cs=${cs}&ns=${this.ns}`

      var body = ''
      try {
        body = Yaml.load(this.code)
      } catch (e) {
        let msg = [e.name, e.message].join('\n')

        if (this.code_error.length === 0) {
          let {line} = e.mark
          let lineCount = this.$_.countBy([...msg], c => c === '\n')['true']

          msg = msg.replace(`line ${line + 1},`, `line ${line + 1 + lineCount + 1},`)
          console.log(lineCount, msg, e)
        }

        this.setCodeWithError(msg)
        return
      }

      this.loading = true
      this.$http
        .put(url, body)
        .then((res) => {
          if (res.data && !!res.data.code) {
            this.setCodeWithError(res.data.msg)
          } else {
            this.snack.color = 'info'
            this.snack.text = 'Saved'
            this.snack.show = true
            this.code_error = []

            this.setCodeAsYaml(res.data)
          }

          this.loading = false
        })
    },
    setCodeAsYaml (obj) {
      const _ = this._
      function cleanup (v, k, ctx) {
        if (_.isObject(v)) {
          _.mapObject(v, cleanup)
        } else if (_.isArray(v)) {

        } else if (_.isNull(v)) {
          delete ctx[k]
        }
      }
      cleanup(obj)

      this.$_.each(obj.data, (v, k, l) => {
        // l[k] = String.fromCharCode.apply({}, v)
        l[k] = Buffer.from(v).toString('base64')
      })
      // this.formatter(obj)
      this.code = Yaml.dump(obj)
    },
    setCodeWithError (error) {
      const len = this.code_error.join('\n').length
      this.code_error = this._.map(error.split('\n'), v => '# ' + v)
      this.code_error.push('')
      this.code = this.code_error.join('\n') + this.code.substr(len)

      this.snack.color = 'error'
      this.snack.text = 'Error'
      this.snack.show = true
    },
    formatter (obj, from, to) {
      obj = obj || Yaml.load(this.code) || {kind: ''}
      if (obj.kind.toLowerCase() !== 'secret') { return }

      this.format = ['base64', 'ascii']
      this.encoding = this.encoding || this.format[0]

      this.$_.each(obj.data, (v, k, l) => {
        if (this.$_.isArray(v)) {
          l[k] = String.fromCharCode.apply({}, v)
          this.encoding = 'base64'
        } else {
          l[k] = Buffer.from(v, from).toString(to)
        }
      })
      this.code = Yaml.dump(obj)
    }
  }
}
</script>

<style scoped>
.vue-codemirror { text-align: left!important; }
>>> .CodeMirror { height: 500px; }
</style>
