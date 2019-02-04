import Vue from 'vue'
import axios from 'axios'
import cookies from 'js-cookie'

Vue.prototype.$http = axios

axios.interceptors.response.use(
  null,
  (err) => {
    if (!err.response) {
      console.log(err)
    } else if (err.response.status === 401) {
      cookies.set('org-location', location.href)

      const url = new URL(location.href)
      url.pathname = '/login'
      url.search = url.hash = ''
      url.search = 'redirect_uri=' + url.href

      location.href = url.href
    }
  }
)
