<template>
  <component :is="comp"/>
  <!-- <resource-detail/> -->
</template>

<script>
const COMPONENT = {
  'workloads': 'workloads-table',
  'networks': 'networks-table',
  'volumes': 'volumes-table',
  'data': 'datas-table',
  'data-others': 'others-table'
}
export default {
  computed: {
    comp () {
      let {group} = this.$route.params
      let comp = COMPONENT[group]

      if (!comp) {
        location.href = '/error'
      }

      return comp
    }
  }
}
</script>
