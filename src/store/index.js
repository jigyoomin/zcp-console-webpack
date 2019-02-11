import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { getField, updateField } from 'vuex-map-fields' // https://github.com/maoberlehner/vuex-map-fields

Vue.use(Vuex)

const state = {
  menus: {
    loading: false,
    items: []
  },
  toolbar: [
    {title: '나의 정보', link: '/my/profile'},
    {title: '비밀번호 변경', link: '/my/pwd'},
    {title: 'CLI Command', link: '/my/cli', dvider: true},
    {title: '로그아웃', link: '/logout'}
  ],
  select: [
    {label: 'Cluster', items: [], selected: 'cloudzcp-pou-dev'},
    {label: 'Namespace', items: [], selected: 'zcp-system'},
    {label: 'Kind', items: [], selected: ''}
  ],
  ns: '',
  kind: '',
  profile: {},
  config: {
    layout: process.env.layout,
    router: {
      mode: process.env.routerMode
    },
    application: {
      product: 'ZCP',
      label: ''
    }
  }
}

const mutations = {
  changeCluster (state, cluster) {
    state.select[0].selected = cluster
  },
  changeNamespace (state, namespace) {
    state.select[1].selected = namespace
  },
  setNamespaceItem (state, items) {
    state.select[1].items = items
    if (!state.ns) { state.ns = items[0].metadata.name }
  },
  setKindItem (state, items) {
    state.select[2].items = items
    if (!state.kind) { state.kind = items[0].value }
  },
  setProfile (state, profile) {
    state.profile = profile
  },
  setMenus (state, menus) {
    state.menus = menus
  },
  setFromQuery (state, query) {
    if (query.ns) {
      state.ns = query.ns
    }
    if (query.kind) {
      state.kind = query.kind
    }
  },
  mergeConfig (state, _new) {
    Object.assign(state.config, _new)
  },
  updateField
}

const actions = {
  getNamespace (store) {
    axios
      .get(`/api/namespaces/list?type=yaml&cs=-&ns=-`)
      .then((res) => {
        store.commit('setNamespaceItem', res.data.items)
      })
  },
  getProfile (store) {
    axios
      .get('/api/profile')
      .then((res) => {
        store.commit('setProfile', res.data)
      })
  },
  getMenu (store) {
    store.commit('setMenus', {loading: true})

    axios
      .get(`/api/menu?namespace=${state.ns}`)
      .then((res) => {
        const mapper = (item) => {
          item.title = item.name
          item.link = item.url.replace(/\/index.html#/, '')
        }
        res.data.forEach(item => {
          mapper(item)
          item.sub && item.sub.forEach(mapper)
        })
        store.commit('setMenus', {loading: false, items: res.data})
      })
  },
  getConfig (store) {
    axios
      .get('/api/config')
      .then((res) => {
        store.commit('mergeConfig', res.data)
      })
  }
}

const getters = { getField }

const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})

Vue.prototype.$store = store

export default store
