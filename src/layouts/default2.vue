<template>
  <!-- https://github.com/vuetifyjs/nuxt/blob/master/template/layouts/default.vue -->
  <v-app class="app">
    <v-navigation-drawer fixed left clipped app
        justify-space-between class="nav"
        width="225"
        v-model="active.drawer"
        mini-variant-width="60"
        :mini-variant.sync="active.mini">

      <v-list dense class="noto-font" width="225">
        <v-subheader class="nav-label noto-font">
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

            <v-flex text-xs-right pr-1 class="nav-item-launch" v-if="!active.mini && menu.link.startsWith('http')">
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

              <v-list-tile-content>
                <v-list-tile-title v-text="menu.title" class="nav-item-title"></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <!-- sub menu item -->
            <v-list-tile no-action v-for="sub in menu.sub" :key="sub.title" :to="sub.link" class="nav-item"
            active-class="nav-active sub">
              <!-- <v-list-tile-action></v-list-tile-action> -->

              <v-list-tile-content>
                <v-list-tile-title class="nav-item-title sub">
                  -{{ sub.title }}
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
          <v-chip x-small class="noto-font">CP</v-chip>
        </v-btn>
      </v-toolbar-items>

      <v-spacer></v-spacer>

      <!-- user profile menu -->
      <v-toolbar-items>
        <v-menu offset-y bottom v-model="active.profile">
          <!-- user name -->
          <v-btn flat slot="activator" class="toolbar-profile noto-font">
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
      <v-container fluid class="content">
        <v-layout row wrap>

          <v-flex xs12 class="select-group">
            <v-layout align-center>
                <span class="ns-select-label">Namespace : &nbsp;&nbsp;</span>
                <v-flex xs2>
                  <namespace-select class="ns-select" no-label flat/>
                </v-flex>

                <v-spacer></v-spacer>

                <v-btn flat light class="nav-back" v-if="$route.params.name" @click="$router.go(-1)">
                  <v-icon>keyboard_arrow_left</v-icon>
                  <span>목록으로 돌아가기</span>
                </v-btn>
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
.app { background-color: #eaedf2 !important; }
.toolbar-band { min-width: 100%; min-height: 4px; position: absolute; top: 0; left: 0; background-color: #ea0530; }
.toolbar-side-icon { margin-left: -10px !important; margin-right: 15px !important; }

.toolbar-title { margin-left: -20px !important; margin-top: 2px !important; }
.toolbar-title::before { opacity: 0; }
.toolbar-title .logo { width: 140px; /* 131px; */ height: 27px; background: url('../assets/logo.png') no-repeat; }
>>> .toolbar-title .v-chip { height: 15px; width: 66px; flex-direction: column; font-size: 10px; font-weight: bold; color: white; background-color: #a93193; margin-top: 7px; margin-left: 0px; }
>>> .toolbar-title .v-chip * { font-family: NotoKrR !important; margin-bottom: 1px; margin-bottom: 3px; margin-left: -2px; letter-spacing: -0.1px; }
.toolbar-profile { text-transform: none; margin-right: -30px !important; font-size: 16.95px; -webkit-font-smoothing: auto; color: #444444; }
.toolbar-profile::before { opacity: 0; }
.toolbar-profile .v-icon { font-size: 20px; padding-top: 5px; margin-left: 5px; }

.nav-label { height: 50px !important; margin-bottom: 1px; background-color: #313131; -webkit-font-smoothing: auto; }
.nav-label .icon  { width: 24px; height: 24px; background: url('../assets/ico-lnbname.png') no-repeat; margin: 0 2px 2px 2px; }
.nav-label .name  { font-size: 18px; letter-spacing: -1px; color: white; padding-left: 10px; font-weight: 700; margin: 0 2px -1px -0.5px; }
.nav-label .label { font-size: 13.5px; letter-spacing: -0.1px; color: white; padding-left: 10px; font-weight: bold; }

.nav-item { color: #444444 !important; caret-color: #444444 !important; height: 43px; }
.nav-item-title { font-size: 16.95px; line-height: 25px; padding-left: 14px; -webkit-font-smoothing: auto; }
.nav-item-title.sub { font-size: 15px; font-weight: 500; padding-left: 19px; }
.nav-item-title.sub i { font-size: 10px; }
.nav-item-launch i { font-size: 20px !important; margin-right: -5px !important; margin-bottom: -2px; color: rgba(0,0,0,0.35); }
.nav-item-launch.sub { padding-right: 4px; }

.nav-back i { color: #a8a9ac !important; }
.nav-back span { border-bottom: 1px solid #a8a9ac; color: #666666 !important; }
.nav-back::before { opacity: 0; }

>>> .nav .v-list__group:before { background: inherit !important}
>>> .nav .v-list__group:after { background: inherit !important}
>>> .nav .v-list__group__header .v-list__group__header__append-icon .v-icon { color: rgba(0,0,0,0.3); font-size: 19px; font-weight: 500; padding-top: 3px; }
>>> .nav .v-list__group__header--active .v-list__group__header__append-icon .v-icon { margin-top: 4px; }
>>> .nav .v-list__group__header--active .nav-item { caret-color: #ea0530 !important; color: #ea0530 !important; }
>>> .nav .v-list__group .v-list__group__items { padding: 15px 0; background: #f9f9f9; }
>>> .nav .v-list__group .v-list__group__items .nav-item { background: #f9f9f9; height: 41px; margin-top: -7px; }
>>> .nav .v-list__group .v-list__group__items .v-list__tile--active { caret-color: #222222!important; color: #222222!important; }

.nav-resizer { position: absolute; bottom: 0; right: 0; margin-bottom: 1px; background-color: rgba(0,0,0,0) }
.nav-resizer .v-list__tile__action .v-btn { border-radius: 50px 0px 0px 50px; min-width: 30px; height: 30px; margin: 0px; color: white; position: absolute; right: 0; background-color: #999999; }
.nav-resizer .v-list__tile__action .v-btn:hover { background-color: #757575; }
.nav-resizer .v-list__tile__action .v-btn .v-icon:nth-child(1) { font-size: 18px; margin-right: -11px; margin-left: 3px; }
.nav-resizer .v-list__tile__action .v-btn .v-icon:nth-child(2) { font-size: 18px; }

.v-navigation-drawer .v-list:nth-child(1){ padding-top: 0px; }
.v-navigation-drawer--mini-variant { display: flex !important; }
.v-navigation-drawer--mini-variant .nav-label { display: flex !important; }
.v-navigation-drawer--mini-variant .v-list .v-list__tile { padding: 0 5px; }
.v-navigation-drawer--mini-variant .v-list .v-list__group__header div:nth-child(1) { max-width: 1px; }
>>> .v-navigation-drawer .v-navigation-drawer__border { display: none; }

.content { padding: 20px; }
.content .select-group { margin-top: -34px; margin-bottom: -10px; }
.content .ns-select { padding-top: 19px; padding-left: 5px; }
.content .ns-select-label { font-size: 13.95px !important; font-family: NotoKrR; font-weight: 600 !important; color: #666666; }

@font-face {
  font-family: 'NotoKrR';
  /* font-style: normal; */
  /* font-weight: 300; */
  src: local('Noto Sans Regular'), local('NotoSans-Regular'), url(../../static/NotoSans-Regular.eot);
  src: url(../../static/NotoSans-Regular.eot?#iefix) format('embedded-opentype'),
  url(../../static/NotoSans-Regular.woff2) format('woff2'),
  url(../../static/NotoSans-Regular.woff) format('woff');
}
.noto-font { font-family: NotoKrR !important; }

</style>
