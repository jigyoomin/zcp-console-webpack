<template>
  <!-- https://github.com/vuetifyjs/nuxt/blob/master/template/layouts/default.vue -->
  <v-app class="app">
    <v-navigation-drawer fixed left clipped app
        justify-space-between class="white"
        width="225"
        v-model="active.drawer"
        mini-variant-width="60"
        :mini-variant.sync="active.mini">

      <v-list dense>
        <v-subheader class="nav-label">
          <span class="icon"></span>
          <span class="name" v-if="!active.mini">{{ config.application.product }}</span>
          <span class="label" v-if="!active.mini">{{ config.application.label }}</span>
        </v-subheader>
        <v-progress-linear indeterminate v-if="menus.loading"></v-progress-linear>

        <template v-for="menu in menus.items">
          <!-- single menu item -->
          <v-list-tile v-if="!menu.sub"
            :key="menu.title" :to="menu.link"
            class="nav-item">
            <v-list-tile-action v-if="menu.icon">
              <v-icon>{{ menu.icon }}</v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title v-text="menu.title" class="nav-item-title"></v-list-tile-title>
            </v-list-tile-content>

            <v-flex text-xs-right pr-1 v-if="!active.mini && menu.link.startsWith('http')">
              <v-icon small>launch</v-icon>
            </v-flex>
          </v-list-tile>

          <!-- multiple menu item -->
          <v-list-group v-if="menu.sub"
            :key="menu.title" :group="menu.url">

            <!-- activator -->
            <v-list-tile slot="activator" class="nav-item">
              <v-list-tile-action v-if="menu.icon">
                <v-icon>{{ menu.icon }}</v-icon>
              </v-list-tile-action>

              <v-list-tile-content >
                <v-list-tile-title v-text="menu.title" class="nav-item-title"></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <!-- sub menu item -->
            <v-list-tile no-action v-for="sub in menu.sub" :key="sub.title" :to="sub.link" class="nav-item"
            active-class="primary--text nav-active sub">
              <!-- <v-list-tile-action></v-list-tile-action> -->

              <v-list-tile-content>
                <v-list-tile-title class="nav-item-title sub">
                  - {{ sub.title }}
                </v-list-tile-title>
              </v-list-tile-content>

              <v-flex text-xs-right class="nav-item-launch sub" v-if="sub.link.startsWith('http')">
                <v-icon small>launch</v-icon>
              </v-flex>
            </v-list-tile>

          </v-list-group>

        </template>

        <v-alert :value="menus.error" color="error">
          Fail to load menus
        </v-alert>
      </v-list>

      <!-- menu resizer button -->
      <v-list dense class="nav-resizer">
        <v-list-tile>
          <v-list-tile-action>
            <v-btn slot="activator" icon @click="active.mini = !active.mini">
              <v-icon>keyboard_arrow_left</v-icon>
              <v-icon>keyboard_arrow_left</v-icon>
            </v-btn>
          </v-list-tile-action>

          <v-list-tile-content>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <!-- toolbar -->
    <v-toolbar app clipped-left color="white">
      <div class="toolbar-band"></div>
      <v-toolbar-side-icon class="toolbar-side-icon hidden-lg-and-up"
        @click.native="active.drawer = !active.drawer"></v-toolbar-side-icon>

      <!-- logo button -->
      <v-toolbar-items>
        <v-btn flat class="toolbar-title" to="redirect:/">
          <div class="logo"/>
          <v-chip x-small>CP</v-chip>
        </v-btn>
      </v-toolbar-items>

      <v-spacer></v-spacer>

      <!-- user profile menu -->
      <v-toolbar-items>
        <v-menu offset-y bottom v-model="active.profile">
          <!-- user name -->
          <v-btn flat slot="activator" class="toolbar-profile">
            {{ profile.firstName }}
            <v-icon>{{ active.profile ? 'expand_less' : 'expand_more' }}</v-icon>
          </v-btn>

          <!-- profile context menu item -->
          <v-list>
            <template v-for="(item, index) in toolbar">
              <v-list-tile :key="index" :to="item.link">
                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              </v-list-tile>

              <v-divider :key="toolbar.length + index" v-if="item.dvider"></v-divider>
            </template>
          </v-list>

        </v-menu>
      </v-toolbar-items>

    </v-toolbar>

    <!-- Main -->
    <v-content>
      <v-container fluid>
        <v-layout row wrap>

          <v-flex shrink class="select-group">
            <v-layout row align-center>
              <span class="subheading font-weight-medium grey--text text--darken-2">Namespace: &nbsp;&nbsp;</span>
              <namespace-select :label="false"/>
            </v-layout>
          </v-flex>

          <v-flex xs12>
            <nuxt v-title="title"/>
          </v-flex>

        </v-layout>
      </v-container>
    </v-content>

  </v-app>
</template>

<script>
// https://github.com/vuejs/vuex/blob/dev/examples/shopping-cart/components/ProductList.vue

import { mapState, mapActions } from 'vuex'

export default {
  data () {
    return {
      active: {
        drawer: true,
        mini: false,
        profile: false
      }
    }
  },
  created () {
    this.getProfile()
    this.getConfig()
  },
  computed: {
    ...mapState(['menus', 'toolbar', 'profile', 'config']),
    title () { return this.config.title }
  },
  methods: mapActions(['getProfile', 'getConfig'])
}
</script>

<style scoped>
.toolbar-band { min-width: 100%; min-height: 4px; position: absolute; top: 0; left: 0; background-color: #ea0530; }

.toolbar-side-icon { margin-left: -10px !important; margin-right: 15px !important; }

.toolbar-title { margin-left: -24px !important; }
.toolbar-title::before { opacity: 0; }
.toolbar-title .v-chip { height: 15px; width: 65px; font-size: 10px; color: white; background-color: #a93193; flex-direction: column; }
.toolbar-title div.logo { width: 140px; /* 131px; */ height: 27px; background: url('../assets/logo.png') no-repeat; }

.toolbar-profile { text-transform: none; margin-right: -24px !important; }
.toolbar-profile::before { opacity: 0; }

.nav-label { height: 49px !important; background-color: #313131; }
.nav-label .icon  { width: 24px; height: 24px; background: url('../assets/ico-lnbname.png') no-repeat; }
.nav-label .name  { font-size: 1.4rem; letter-spacing: -1px; color: white; padding-left: 10px; font-weight: bold; font-family: "NotoKrR"; /* TODO: from fontface */ }
.nav-label .label { font-size: 0.9rem; letter-spacing: -0.1px; color: white; padding-left: 10px; font-weight: bold; font-family: "NotoKrR"; /* TODO: from fontface */ }

.nav-resizer { position: absolute; bottom: 0; right: 0; background-color: rgba(0,0,0,0) }
.nav-resizer .v-list__tile__action .v-btn { border-radius: 50px 0px 0px 50px; min-width: 45px; margin: 0px; color: white; position: absolute; right: 0; background-color: #999999; }
.nav-resizer .v-list__tile__action .v-btn:hover { background-color: #757575; }
.nav-resizer .v-list__tile__action .v-btn .v-icon:nth-child(1) { margin-right: -4px; }
.nav-resizer .v-list__tile__action .v-btn .v-icon:nth-child(2) { margin-left: -10px; }

.select-group { margin-top: -25px; }

.app { background-color: #eaedf2 !important; }

.nav-item { color: #444444 !important; caret-color: #444444 !important; }
.nav-item-title { font-size: 1.25em; font-weight: 500; padding-left: 10px; }
.nav-item-title.sub { font-size: 1.1em; font-weight: 500; padding-left: 15px; }
.nav-item-launch.sub { padding-right: 4px; }

/* .v-list__group__header--active .nav-item { caret-color: #ea0530 !important; color: #ea0530 !important; }
.v-list__tile--active .v-list__tile__content { caret-color: #444444 !important; color: #444444 !important; } */

.v-list__group__header--active .nav-item { caret-color: #ea0530 !important; color: #ea0530 !important; }
.nav-active.sub * { caret-color: #444444!important; color: #444444!important; }

/* */
/* .v-navigation-drawer { width: 225px !important; }
.v-navigation-drawer--mini-variant { width: 60px !important; } */

.v-navigation-drawer .v-list:nth-child(1){ padding-top: 0px; }
.v-navigation-drawer--mini-variant { display: flex !important; }
.v-navigation-drawer--mini-variant .nav-label { display: flex !important; }
.v-navigation-drawer--mini-variant .v-list .v-list__tile { padding: 0 5px; }
.v-navigation-drawer--mini-variant .v-list .v-list__group__header div:nth-child(1) { max-width: 1px; }
</style>
