'use strict'
module.exports = {
  NODE_ENV: '"production"'
}

/* START :: Customize */
// https://hyunseob.github.io/2016/07/23/underscore-extend/
const _ = require('underscore')

_.extend(process.env, module.exports)
const nuxt  = require('../nuxt.config.js')
const nuxtEnvEscaped = _.mapObject(nuxt.env, (v) => {
  if(_.isString(v))
    return `"${v}"`
  return v
})
console.log(nuxtEnvEscaped)

_.extend(module.exports, nuxtEnvEscaped)
/* END */
