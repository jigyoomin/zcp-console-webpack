<template>
  <v-layout>
    <v-flex v-for="(affinity, type) in val" :key="type">
      <div>Type : {{ type }}</div>
      <div>Condition : {{ condition(affinity) }}</div>
      <div>
        Expression :
        <!-- <div v-for="(expr, i) in expression(affinity)" :key="i">{{ expr }}</div> -->
        {{ expression(affinity) }}
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ['val'],
  methods: {
    condition (affinity) {
      return this.$_.keys(affinity)[0]
    },
    expression (affinity) {
      const _ = this.$_
      let single = (obj) => _.pairs(obj)[0][1]
      let match = _.chain(affinity).reduce(single)
      // let match = this.$_.chain(affinity).mapObject(single).mapObject(single)
      return match.value()

      // let single = (obj) => obj[ this.$_.keys(obj)[0] ]
      // let match = this.$_.chain(affinity).reduce(single).reduce(single).reduce(single)
      // return match.value()

      // let match = this.$_.chain(affinity).values().first().values().first().pluck('matchExpressions').flatten()
      // return match.map(expr => {
      //   return `${expr.key} ${expr.operator} ${expr.values}`
      // }).value()
    }
  }
}
</script>
