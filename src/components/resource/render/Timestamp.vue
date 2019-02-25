<template>
  <v-tooltip v-if="from" right>
    <span slot="activator"> {{ val | moment('from', true) || '-' }} </span>
    <span> {{ val | moment('YYYY-MM-DD A hh:mm:ss') || '-' }} </span>
  </v-tooltip>
  <span v-else>
    {{ val | moment('YYYY-MM-DD A hh:mm:ss') || '-' }}
  </span>
</template>

<script>
export default {
  props: ['val', 'from']
}
</script>
