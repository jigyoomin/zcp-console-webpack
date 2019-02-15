<template>
  <span>
    {{ val | moment('YYYY-MM-DD A hh:mm:ss') }}
  </span>
</template>

<script>
export default {
  props: ['val']
}
</script>
