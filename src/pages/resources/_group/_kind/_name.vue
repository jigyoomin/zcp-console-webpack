<template>
  <component :is="comp"/>
  <!-- <resource-detail/> -->
</template>

<script>
const WORKLOADS = 'pod,replicaset,deploy,sts'
export default {
  computed: {
    comp () {
      let comp = 'resource-detail'
      let {kind} = this.$route.params

      if (WORKLOADS.indexOf(kind) !== -1) {
        comp = 'workloads-detail'
      }

      return comp
    }
  }
}
</script>
