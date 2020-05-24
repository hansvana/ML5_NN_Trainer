<template>
  <div>
    <v-container v-if="!isTrained">
      <v-alert :text="true" color="red" icon="mdi-alert-box-outline" >
        Please train your model first.
      </v-alert>
    </v-container>
    <v-container v-else>
      <p>Once you're happy with the results, you can save the data</p>
      <p>
        Three files will be downloaded,
        <!-- eslint-disable-next-line -->
        <a href="https://github.com/ml5js/ml5-examples/tree/development/p5js/NeuralNetwork/NeuralNetwork_load_model">click here</a>
        for an example on how to use these files or watch
        <a href="https://youtu.be/wUrg9Hjkhg0?t=416">this video</a> for more info.
      </p>
      <v-btn tile dark color="blue" :loading="$root.isTraining" @click="$emit('save')">
        <v-icon left>mdi-download</v-icon>Download
      </v-btn>
    </v-container>
  </div>
</template>

<script>

export default {
  computed: {
    isTrained: function () {
      return this.$root.nn.getIsTrained();
    },
  },
};
</script>

<style>
</style>
