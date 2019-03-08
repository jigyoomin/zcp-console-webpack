<template>
  <v-select
    :label="_.isUndefined(noLabel) ? select[1].label : ''"
    :class="allClass"
    :items="select[1].items"
    item-disabled="disabled"
    item-text="metadata.name" item-value="metadata.name"
    v-model="ns" menu-props="auto"
    :error="error">
  </v-select>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'

import cookies from 'js-cookie'

export default {
  name: 'ns-select',
  props: ['no-label', 'flat'],
  computed: {
    ...mapState(['select']),
    ...mapFields(['ns']),
    error () { return this.select[1].error },
    allClass () {
      const _ = this.$_
      let ret = ['flat']
      return _.map(ret, k => _.isUndefined(k) ? '' : k)
    }
  },
  watch: {
    ns: function (_new) {
      _new && this.getMenu() && this.storeSharedParams()
    },
    $route (to, from, next) {
      // https://stackoverflow.com/a/46403063
      this.updateRouteParams()
    }
  },
  methods: {
    ...mapMutations(['changeCluster', 'chageNamespace', 'setFromQuery']),
    ...mapActions(['getNamespace', 'getMenu']),
    storeSharedParams () {
      cookies.set('config', {ns: this.ns})
    },
    updateRouteParams () {
      let params = !this.ns ? (cookies.getJSON('config') || {}) : {}

      Object.assign(params, this.$route.params)
      Object.assign(params, this.$route.query)
      console.log(params)
      this.setFromQuery(params)
    }
  },
  created () {
    // IMPORTANT!! https://github.com/vuejs/vue-test-utils/issues/107
    this.updateRouteParams()
    this.getNamespace()
  }
  // nuxt-api (https://ko.nuxtjs.org/api/pages-fetch)
  // fetch: function(){}
}
</script>

<style>
.flat .v-input__slot:before { display: none; }
</style>
