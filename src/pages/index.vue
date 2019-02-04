<template>
  <layout-content>
    INDEX
  </layout-content>
</template>

<script>
import cookies from 'js-cookie'

export default {
  created () {
    let loc = cookies.get('org-location')
    cookies.remove('org-location')

    if (loc) {
      location.href = loc
    }
  }
}
</script>
