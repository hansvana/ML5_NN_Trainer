<template>
  <div>
    <p>
      Set the options to train your model.
      If needed you can make tweaks here then train again.
    </p>
    <h4>Training type</h4>
    <v-radio-group :column="false" v-model="options.task">
      <v-radio label="classification" value="classification" />
      <v-radio label="regression" value="regression" />
    </v-radio-group>
    <h4>Training settings</h4>
    <br>
    <v-text-field label="Epochs" type="number" v-model="options.epochs">
    </v-text-field>
    <v-text-field label="Batch size" type="number" v-model="options.batchSize">
    </v-text-field>
    <v-text-field label="Learning rate" type="number" v-model="options.learningRate">
    </v-text-field>
  </div>
</template>

<script>
export default {
  name: 'StepSetOptions',
  props: ['property'],
  computed: {
    options: function () {
      return this.property.options;
    },
  },
  components: {},
  data: () => ({}),
  methods: {},
};
</script>

<style lang="scss">
</style>
