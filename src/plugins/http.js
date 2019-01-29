import Vue from 'vue'
import axios from 'axios'

Vue.prototype.$http = axios

axios.interceptors.response.use(
  null,
  (err) => {
    if (err.response.status === 401) {
      location.href = '/login#/z'
    }
  }
)
