import _ from 'underscore'

export default {
  data () {
    return {
      pageable: { page: 1, rowsPerPage: 5, query: '', active: false }
    }
  },
  methods: {
    $onPagination (_new) {
      if (!this.pageable.active) {
        this.pageable.query = ''
        return
      }

      let page = Math.max(_new.page, 1) - 1
      let queryPrev = this.pageable.query
      let query = `page=${page}&size=${_new.rowsPerPage}`
      if (_new.sortBy) {
        query += `&sort=${_new.sortBy},${_new.descending ? 'desc' : 'asc'}`
      }

      Object.assign(this.pageable, _new, {query})

      if (!_new.force && queryPrev === this.pageable.query) {
        console.log('same paginations.', _new, this.pageable)
        return
      }

      console.log('pagination is changed.', _new, this.pageable)
      this.$root.$emit('pageable', this.pageable)
    }
  },
  created () {
    this.$root.$on('update:pagination', this.$onPagination)
  }
}

// https://github.com/vuejs/vuex/blob/caa663d69608fc36d1a88746df28961437d38786/src/helpers.js#L131
export const asPageable = function (meta) {
  const res = {}
  const { name, target, $active } = meta

  res[name || `$${target}`] = function () {
    const active = _.isFunction($active) ? $active.call(this, this) : true
    this.pageable.active = active

    const src = this[target]
    src.onserver = active

    return src
  }
  res['$pageable'] = function () {
    return this.pageable
  }

  return res
}
