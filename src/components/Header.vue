<template>
  <v-app-bar
    class="cmd-navbar"
    height="80px"
    clipped-left
    app
  >
    <v-toolbar-title class="cmd-navbar-title">
      <img src="img/logo-icon.svg" />
      ML5.js Neural Network Trainer
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn text :disabled=true>Alpha 0.2</v-btn>
    <v-spacer></v-spacer>
    <v-btn text :disabled=true>Powered by</v-btn>
    <v-btn text>
      <a href="https://ml5js.org">ML5.js</a>
    </v-btn>
    <v-btn text>
      <a href="http://cmd.camp">CMD.CAMP</a>
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  name: 'Header',

  data: () => ({}),
};
</script>

<style lang="scss">
$avans-color: rgb(220, 0, 70);

.cmd-navbar {
  border-top: 4px solid $avans-color !important;
  background-color: #fff !important;
  padding: 5px;
  height: auto;
  line-height: initial;

  .cmd-navbar-title {
    line-height: 60px;
    font-size: 30px;
    padding: 5px;

    img {
      height: 60px;
      vertical-align: bottom;
    }
  }
}
</style>
