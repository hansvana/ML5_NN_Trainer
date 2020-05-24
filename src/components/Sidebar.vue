<template>
  <v-navigation-drawer
    :floating=true
    :clipped=true
    app
  >
  <v-list>
    <v-list-item-content>
    STEPS
    </v-list-item-content>
  </v-list>

  </v-navigation-drawer>
</template>

<script>
export default {
  name: "Sidebar",

  data: () => ({
  })
};
</script>

<style lang="scss">
.v-navigation-drawer {
  background: none !important;
}
</style>
