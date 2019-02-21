/**
 * https://ko.nuxtjs.org/guide/plugins/
 * https://kr.vuejs.org/v2/guide/plugins.html
 */

function progress (promise, target) {
  target.loading = true

  promise.catch((err) => {
    console.log(err)
    target.error = true
  }).then(() => {
    target.loading = false
  })
}

function install (Vue, options) {
  // 1. 전역 메소드 또는 속성 추가
  // Vue.myGlobalMethod = function () {
  //   // 필요한 로직 ...
  // }

  // 2. 전역 에셋 추가
  Vue.directive('title', {
    inserted: (el, binding) => { document.title = binding.value },
    update: (el, binding) => { document.title = binding.value }
  })

  // 3. 컴포넌트 옵션 주입
  // Vue.mixin({
  //   created: function () {
  //   // 필요한 로직 ...
  //   }
  // })

  // 4. 인스턴스 메소드 추가
  Vue.prototype.$progress = progress

  // 5. 필터 추가
  // https://kr.vuejs.org/v2/guide/filters.html
  Vue.filter('sizeOf', function (bytes) {
    // https://stackoverflow.com/a/28120564
    // https://github.com/kubernetes/community/blob/master/contributors/design-proposals/scheduling/resources.md#resource-quantities
    if (bytes === 0) { return '0.0 Bi' }
    if (!bytes) { return '-' }
    var e = Math.floor(Math.log(bytes) / Math.log(1024))
    var s = (bytes / Math.pow(1024, e)).toFixed(1)
    return `${s} ${' KMGTP'.charAt(e)}i`
  })
}

export default {
  install,
  progress
}
