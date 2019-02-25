<template>
  <v-card>
    <v-card-title class="subheading">
      <v-btn icon flat @click="$router.go(-1)">
        <v-icon>arrow_back</v-icon>
      </v-btn>

      <span class="font-weight-regular title">
        {{ yaml && yaml.kind || kind }} / {{ $route.params.name }}
      </span>

      <v-btn icon flat @click="updateData()">
        <v-icon>replay</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>
    <v-progress-linear color="blue" indeterminate v-if="loading"></v-progress-linear>

    <v-card-text v-for="(val, key) in displayYaml" :key="key" class="prop">
      <!-- String Type -->
      <template v-if="!_.isObject(val)">
        <v-layout row>
          <v-flex xs2 class="font-weight-bold text-capitalize"> {{ key }} </v-flex>

          <v-flex xs10 v-if="key.endsWith('Timestamp')">
            <timestamp v-bind="{val}"/>
          </v-flex>
          <v-flex xs10 v-else> {{ val }} </v-flex>
        </v-layout>
      </template>

      <!-- Object Type -->
      <template v-else>
        <v-flex xs2 class="font-weight-bold text-capitalize"> {{ key }} </v-flex>

        <v-layout v-for="(v, k) in val" :key="k" row>
          <v-flex class="xs2 grey--text">{{ k }}</v-flex>
          <v-flex class="xs10 font-weight-regular">
            <!-- customized cell by header.id -->
            <slot :name="k" v-if="!!$scopedSlots[k] || !!$slots[k]" v-bind="{key: k, val: v}">
            </slot>

            <!-- Well-known Field -->
            <timestamp v-else-if="k.endsWith('Timestamp')" v-bind="{val: v, from: true}"/>
            <labels v-else-if="k === 'labels'" v-bind="{key:k, val:v, labels:v}"/>

            <!-- Object Type -->
            <truncate-text v-else-if="_.isObject(v)" :value="stringify(v)"/>

            <!-- toString -->
            <truncate-text v-else :value="v"/>
          </v-flex>
        </v-layout>
      </template>

      <v-divider></v-divider>
    </v-card-text>

    <v-card-text>
      <v-alert :value="error" color="error">
        Fail to load data
      </v-alert>
    </v-card-text>

  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import stringify from 'json-stringify-pretty-compact'

export default {
  data () {
    return {
      yaml: {},
      loading: false,
      error: false
    }
  },
  computed: {
    ...mapState(['ns']),
    kind () {
      const route = this.$route
      const _ = this.$_
      return route.params.kind || _.chain(route.path.split('/')).initial().last().value()
    },
    displayYaml () {
      return this.$_.pick(this.yaml, (v, k) => ['apiVersion', 'kind'].indexOf(k) === -1)
    }
  },
  methods: {
    updateData () {
      const cs = '-'
      const url = `/api/resource/${this.kind}/${this.$route.params.name}?ns=${this.ns}&cs=${cs}&type=json`

      const call = this.$http
        .get(url)
        .then((res) => {
          // this.yaml = this.$filters.cleanup(res.data)
          if (res.data && this.$_.has(res.data, 'code') && res.data.code !== 200) {
            throw res.data.msg
          }
          this.cleanup(res.data)
          this.yaml = res.data
        })
      this.$progress(call, this)
    },
    cleanup (v, k, ctx) {
      const _ = this._
      if (_.isObject(v)) {
        _.mapObject(v, this.cleanup)
      } else if (_.isArray(v)) {

      } else if (_.isNull(v)) {
        delete ctx[k]
      }
    },
    stringify
  },
  mounted () {
    this.updateData()
  }
}
</script>

<style>
.prop > :nth-child(1) { padding-bottom: 20px; }
.prop > :nth-child(2),.row { padding-bottom: 10px; }
.prop:nth-last-child(1) > hr { display: none; }
pre { font-family: Roboto,sans-serif; }
</style>
