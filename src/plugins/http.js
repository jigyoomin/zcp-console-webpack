import Vue from 'vue'
import axios from 'axios'

Vue.prototype.$http = axios

axios.interceptors.response.use(
  null,
  (err) => {
    if (err.response.status === 401) {
      const url = new URL(location.href)
      url.pathname = '/login'
      url.search = url.hash = ''

      url.search = 'redirect_uri=' + url.href

      location.href = url.href
    }
  }
)
