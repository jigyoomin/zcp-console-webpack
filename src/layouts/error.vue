<template>
  <v-app>

    <v-toolbar app clipped-left color="white">
      <div class="toolbar-band"></div>

      <!-- logo button -->
      <v-toolbar-items>
        <v-btn flat class="toolbar-title" to="/" exact-active-class="">
          <div class="logo"/>
          <v-chip x-small>CP</v-chip>
        </v-btn>
      </v-toolbar-items>

      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <v-container fluid>
        <v-layout column wrap align-center>
          <v-flex class="status font-weight-bold" v-if="error.statusCode === 404">
            페이지 에러
          </v-flex>
          <!-- <h1 v-else>An error occurred</h1> -->

            <v-layout column wrap align-space-between class="message">
              <v-flex class="font-weight-medinum text-xs-center" v-if="error.statusCode === 404">
                페이지 정보를 찾을 수 없습니다.
              </v-flex>

              <v-layout column align-center>
                <v-btn depressed round large
                    class="red custom font-weight-bold white--text" to="/">
                  <!-- <nuxt-link to="/">메인</nux3-link> -->
                  메인
                </v-btn>
              </v-layout>
            </v-layout>

        </v-layout>
      </v-container>
    </v-content>

  </v-app>
</template>

<script>
export default {
  props: ['error'],
  layout: '' // you can set a custom layout for the error page
}
</script>

<style>
/* START default2 */
.toolbar-band { min-width: 100%; min-height: 4px; position: absolute; top: 0; left: 0; background-color: #ea0530; }

.toolbar-title { text-transform: none; color: transparent; }
.toolbar-title .v-chip { height: 15px; width: 65px; font-size: 10px; color: white; background-color: #a93193; }
.toolbar-title .v-chip .v-chip__content { width: 100%; height: 100%; flex-direction: column; justify-content: center; }
.toolbar-title div.logo { width: 140px; /* 131px; */ height: 27px; background: url('../assets/logo.png') no-repeat; }

.v-toolbar__content { padding: 0px; height: 64px !important; }
/* END default2 */

.status { padding: 60px 0; font-size: 2.6rem; color: #222222; }

.message { width: 90%; max-width: 900px; border-top: 1px solid #aaaaaa; border-bottom: 1px solid #aaaaaa; }
.message > *:nth-child(1) { padding: 90px 0; font-size: 2.0rem; color:#444444; font-weight: 500; background: #f5f5f5; }
.message > *:nth-child(2) { padding: 30px 0; }
.message .v-btn { width: 180px; height: 50px; }

/* */
.red.custom { background-color: #ea0530 !important; border-color: #ea0530 !important;  }

</style>
