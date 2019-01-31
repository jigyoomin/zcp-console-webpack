<template>
  <v-select
    :label="_.isUndefined(label) || label ? select[1].label : ''"
    :items="select[1].items"
    item-text="metadata.name" item-value="metadata.name"
    v-model="ns" menu-props="auto">
  </v-select>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'ns-select',
  props: ['label'],
  data () {
    return {
      pod: {}
    }
  },
  computed: {
    ...mapState(['select']),
    ...mapFields(['ns'])
  },
  watch: {
    ns: function (_new) {
      _new && this.getMenu()
    },
    $route (to, from, next) {
      // https://stackoverflow.com/a/46403063
      this.updateRouteParams()
    }
  },
  methods: {
    ...mapMutations(['changeCluster', 'chageNamespace', 'setFromQuery']),
    ...mapActions(['getNamespace', 'getMenu']),
    updateRouteParams () {
      let params = {}
      Object.assign(params, this.$route.query)
      Object.assign(params, this.$route.params)
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
