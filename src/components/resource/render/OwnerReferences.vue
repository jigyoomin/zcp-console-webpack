<template>
  <router-link :to="`/resource/${val[0].kind.toLowerCase()}/${val[0].name}?cs=-&ns=${ns}`">
    {{ val[0].name }} ({{ val[0].kind }})
  </router-link>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: ['val'],
  computed: mapState(['ns'])
}
</script>
