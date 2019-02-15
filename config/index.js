'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')
const {URL} = require('url')

// const proxyTarget = 'https://console.cloudzcp.io'
const proxyTarget = 'http://localhost:8181'
const proxyDns = { 'console.cloudzcp.io': '169.56.77.198' }
const proxyHeader = {}

let proxy = new URL(proxyTarget)
if (proxyDns[proxy.host]) {
  let host = proxy.host
  proxyHeader.host = host
  proxy.hostname = proxyDns[host]
}

module.exports = {
  dev: {
    /**
     * Ref
     * - https://webpack.js.org/configuration/dev-server/#devserver-before
     * - https://github.com/webpack/webpack-dev-server/blob/master/lib/Server.js#L327
     * - https://github.com/chimurai/http-proxy-middleware#http-proxy-events
     * 
     * - http://expressjs.com/en/4x/api.html#req
     * - https://nodejs.org/ko/docs/guides/anatomy-of-an-http-transaction/
     */

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: [
      {
        context: ['/api', '/iam', '/login', '/logout'],
        target: proxy.href,
        ws: true,
        onProxyReq: function(proxyReq, req, res, options){
          Object.assign(proxyReq.headers || {}, proxyHeader)
        },
        onProxyRes (proxyRes, req, res, options) {
          // https://nodejs.org/ko/docs/guides/anatomy-of-an-http-transaction/
          // https://github.com/nodejitsu/node-http-proxy/blob/master/lib/http-proxy/passes/web-outgoing.js#L50
          var loc = proxyRes.headers['location']
          if (loc) {
            var pu = new URL(proxyTarget)
            var u = new URL(loc)

            if (pu.host === u.host) {
              u.protocol = 'http'
              u.host = req.headers['host']
              proxyRes.headers.location = u.href // vue-router.mode === 'hash'

              console.log(loc, '-> ', u.href)
            }
          }

          let sc = proxyRes.headers['set-cookie'] || []
          proxyRes.headers['set-cookie'] = sc.map(cookie => {
            return cookie.replace(/Secure; ?/, '')
          });
        }
      },
      { '/**': proxy.href }
    ],

    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: true,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: false,

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
