<template>
  <v-layout column>
    <v-layout row>
      <div class="text-truncate" ref="wrap" v-if="!full">{{ value }}</div>
      <v-btn flat small class="btn-flat text-none primary--text" v-if="truncated" @click="full = !full">
        {{ full ? 'Hide..' : `Show all... (${value.split('\n').length} lines)` }}
      </v-btn>
    </v-layout>

    <v-layout row v-if="full">
      <v-flex xs-12 class="pre-wrap">{{ value }}</v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
export default {
  name: 'truncate-text',
  props: ['value'],
  data () {
    return {
      mounted: false,
      truncated: false,
      full: false
    }
  },
  mounted () {
    let {wrap} = this.$refs
    this.mounted = true
    this.truncated = this.value && (wrap.offsetWidth < wrap.scrollWidth)
  }
}
</script>

<style>
.btn-flat { margin: 0px; height: auto; padding: 0px; }
.btn-flat * { justify-content: left; }

/* .pre-wrap { white-space: pre-wrap; } */
/* https://aboooks.tistory.com/187 */
.pre-wrap { white-space: pre-wrap; overflow-x: auto; border: 1px solid rgba(0,0,0,.12); padding: 5px; }
</style>
