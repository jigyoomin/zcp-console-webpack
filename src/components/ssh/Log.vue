<template>
  <div>
    <form>
      <v-text-field v-show="false" v-model="endpoint" label="Pod Endpoint" readonly></v-text-field>

      <v-layout row align-center justify-start>
        <v-select :items="con.items" v-model="con.selected" label="Container" menu-props="auto"></v-select>

        <v-text-field v-model="param.tail" label="Tail"></v-text-field>
        <v-checkbox v-model="param.follow" label="Follow"></v-checkbox>

        <v-spacer></v-spacer>

        <v-btn color="primary" @click="logs()">
          <v-icon left>desktop_windows</v-icon> Show
        </v-btn>
      </v-layout>
    </form>

    <div ref="console" class="console"></div>

  </div>
</template>

<script>

// import WebSocketClient from 'ws'
// import * as io from 'socket.io-client'  // https://github.com/gdi2290/angular-starter/issues/221
// import eio from 'engine.io-client'
// import { mapState, mapMutations, mapActions } from 'vuex'
import { mapState } from 'vuex'

import clipboard from 'clipboard-polyfill/build/clipboard-polyfill.promise'

import 'xterm/lib/xterm.css' // https://xtermjs.org/docs/guides/import/
import { Terminal } from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
Terminal.applyAddon(fit)

// variable not in vue
var termHeight = -1
var termCharHeight = -1

export default {
  name: 'log-kube',
  props: ['info'],
  watch: {
    info: {
      handler (_new, _old) { this.bindProps(_new) },
      deep: true
    }
  },
  computed: mapState(['ns']),
  data () {
    return {
      endpoint: '',
      cs: undefined,
      // ns: undefined,
      pod: undefined,
      con: {},
      param: {
        tail: 10
      },
      ws: undefined,
      terminal: {
        term: null,
        terminalSocket: null
      },
      snackbar: {
        show: false,
        text: 'copied',
        timeout: 800 // ms
      }
    }
  },
  methods: {
    bindProps (_new) {
      console.log('change meta')
      this.api = _new.api
      this.cs = _new.cs
      // this.ns = _new.ns
      this.pod = _new.pod
      this.con.items = _new.con.items
      this.con.selected = _new.con.items[0]
      this.endpoint = `/api/v1/namespaces/${this.ns}/pods/${this.pod}`
      this.full = _new.full

      if (!_new.show || _new.reset) {
        this.terminal.term.reset()
        this.disconnect()
      } else if (this.terminal.term) {
        this.$nextTick(this.resize)
      }
    },
    disconnect () {
      this.ws && this.ws.close()
    },
    logs () {
      var term = this.terminal.term

      // https://github.com/xtermjs/xterm.js/issues/943#issuecomment-327367759
      term.reset()
      this.disconnect()

      let params = {
        cs: this.cs,
        ns: this.ns,
        kind: 'pod',
        name: this.pod,
        con: this.con.selected
      }
      Object.assign(params, this.param)

      if (this.param.follow) {
        // https://github.com/websockets/wscat/blob/master/bin/wscat#L248
        let server = location.protocol.replace('http', 'ws') + '//' + location.host
        let api = this.api.ws || '/api/logs'
        let url = `${server}${api}`
        let query = this.$_.map(params, (v, k) => { return `${k}=${v}` }).join('&')

        const ws = new WebSocket(`${url}?${query}`)
        this.ws = ws

        ws.onopen = () => {
          console.log('open')
        }
        ws.onclose = (ev) => {
          console.log('close :: ', ev.code)
          this.ws = undefined
        }
        ws.onerror = (err) => {
          console.log('error :: ', err)
        }
        ws.onmessage = (res) => {
          // this.terminal.term.write(msg.data)

          var term = this.terminal.term
          var len = this.terminal.cols || 80

          console.log(res.data)

          var rows = res.data.split('\n')
          for (var i = 0; i < rows.length; i++) {
            term.write(rows[i])
            term.write('\r\n')
            len = Math.max(len, rows[i].length)
          }

          if (this.terminal.cols !== len) {
            this.terminal.cols = len
            term.resize(this.terminal.cols, term._core.options.rows)
          }
        }
      } else {
        let api = this.api.http || '/api/logs'

        this.$http
          .get(api, {params})
          .then((res) => {
            var term = this.terminal.term
            var len = this.terminal.cols || 80

            var rows = res.data.split('\n')
            for (var i = 0; i < rows.length; i++) {
              len = Math.max(len, rows[i].length)
              rows[i] = rows[i] + '\r\n'
            }
            term.write(rows.join(''))

            len = Math.min(160, len)
            if (this.terminal.cols !== len) {
              this.terminal.cols = len
              term.resize(this.terminal.cols, term._core.options.rows)
            }
          })
      }
    },
    resize () {
      var wrapper = this.$refs.console // document.getElementsByClassName('console')[0]
      if (!wrapper) {
        return
      }

      var term = this.terminal.term
      var parentElementStyle = window.getComputedStyle(term.element.parentElement)
      var attr = {
        parent: {
          width: Math.max(0, parseInt(parentElementStyle.getPropertyValue('width'))),
          height: parseInt(parentElementStyle.getPropertyValue('height'))
        }
      }
      console.log('term.', attr)

      var x = this.full ? window.innerWidth : 1000
      var y = this.full ? window.innerHeight : window.innerHeight * 0.9
      var ratio2 = this.full ? 0.7 : 0.55
      var ratio1 = y / x
      var height1 = x * ratio1
      // var height1 = attr.parent.width * ratio1
      var height2 = y * ratio2
      var height = Math.min(height1, height2)
      console.log(this.full, `x=${x}, y=${y}`, `ratio=[${ratio1}, ${ratio2}]`, `parent=[width=${attr.parent.width}, hgieht=${attr.parent.height}]`, height)

      if (termHeight !== height) {
        termHeight = height

        if (wrapper) {
          wrapper.style['min-height'] = height + 'px'
          wrapper.style['max-height'] = height + 'px'
        }
        term.fit()
      }

      /*
       * Detect change of font size.
       * Tracking height of the single charactor span.
       * And re-measure before to calcuate new fit size.
       */
      var m = wrapper.getElementsByClassName('xterm-char-measure-element')[0]
      if (!m) {
        console.log('!!! mesaure not mounted.')
        return
      }

      var _old = termCharHeight
      var _new = m.getBoundingClientRect().height
      if (_old === _new) {
        return
      }

      console.log('term :: size of character is changed. [old=', _old, ', new=', _new, ']')

      term = this.terminal.term
      if (!term) {
        console.log('term :: terminal is not mounted. skip to re-measure.')
        return
      }

      // See also
      // - xterm/lib/addons/fit/fit.js
      //     proposeGeometry()
      //       term._core.renderer.dimensions.actualCellWidth
      // - xterm/lib/render/render.js
      //     Renderer.prototype._updateDimensions()
      //       charMeasure.width -> scaledCharWidth -> scaledCellHeight -> scaledCanvasHeight
      // - xterm/lib/ui/CharMeasure.js
      //     CharMeasure.prototype.measure()
      //       this._measureElement.getBoundingClientRect()
      //       _measureElement.classList.add('xterm-char-measure-element')
      console.log('term :: do resize terminal.')
      term._core.charMeasure.measure(term._core.options)
      term.fit()

      termCharHeight = _new

      // term.write(`COLUMNS=${term._core.options.cols};LINES=${term._core.options.rows};export COLUMNS LINES;\n`)
      return true
    },
    copy () {
      this.snackbar.show = true
      console.log(this.snackbar.show)
    }
  },
  mounted () {
    // https://github.com/xtermjs/xterm.js/issues/573
    // https://stackoverflow.com/a/43686560
    let terminalContainer = this.$refs.console
    let term = new Terminal({
      cursorBlink: true,
      // cols: this.terminal.cols,
      // rows: this.terminal.rows
      // rows: 24,
      // cols: 80,
      screenKeys: true
    })

    term.open(terminalContainer)
    term.fit()

    term.on('data', (data) => {
      this.ws && this.ws.send(data)
    })
    term.on('key', (k, e) => {
      // var printable = (
      //   !e.altKey && !e.altGraphKey &&
      //   !e.ctrlKey && !e.metaKey &&
      //   e.keyCode < 128
      // )

      // if (printable) {
      //   this.ws && this.ws.send(k)
      // }
    })

    // Selection of Xterm
    // - https://github.com/xtermjs/xterm.js/blob/master/src/SelectionManager.ts#L637
    term.on('selection', () => {
      // Control clipboard
      //  in xterm
      //  - https://github.com/xtermjs/xterm.js/issues/185
      //  - https://github.com/xtermjs/xterm.js/issues/292
      //  npm lib
      //  - https://github.com/lgarron/clipboard-polyfill
      //  - https://github.com/zenorocha/clipboard.js
      //  - https://github.com/Inndy/vue-clipboard2
      clipboard.writeText(term.getSelection())
      console.log(term.getSelection())
      this.copy()
    })

    // Right Click Paste
    // - https://github.com/xtermjs/xterm.js/blob/master/src/Terminal.ts#L558
    // - https://github.com/xtermjs/xterm.js/blob/master/src/handlers/Clipboard.ts#L118

    this.terminal.term = term
    this.bindProps(this.info)
    this.$nextTick(this.resize)
  },
  updated () {
    this.$nextTick(this.resize)
  },
  beforeDestroy () {
    this.disconnect()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.console { overflow-x: auto; }
</style>
