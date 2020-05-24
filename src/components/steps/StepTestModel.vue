<template>
  <div>
    <v-container v-if="!isTrained">
      <v-alert :text="true" color="red" icon="mdi-alert-box-outline" >
        Please train your model first.
      </v-alert>
    </v-container>
    <v-container v-else>
      <v-row>
        <v-col cols="12">
          <p>
            Run predictions to test the training.
            Any text field you leave empty will be filled with a random value.<br>
            Note: predictions may not be displayed correctly if you have selected
            more than one output feature.</p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" sm="4">
            <v-text-field
              v-for="(column,i) in columns"
              :key="i"
              :label="column.name"
              v-model="column.value"
            >
            </v-text-field>
          <p>Amount of predictions to run:
            <v-text-field
              v-model="predictionCount"
              type="number"
            >
            </v-text-field>
          </p>
          <v-btn tile dark color="blue" @click="predict">
            <v-icon left>mdi-check-circle</v-icon>Predict
          </v-btn>
        </v-col>
        <v-col cols="12" sm="8">
          <template v-if="predictions.length > 0">
            <v-simple-table dense>
              <thead>
                <tr>
                  <template v-if="task === 'classification'">
                    <td class="blue lighten-4">Prediction</td>
                    <td class="blue lighten-4">Confidence</td>
                  </template>
                  <template v-else>
                    <td class="blue lighten-4"><pre>{{predictions[0].result[0].label}}</pre></td>
                  </template>
                  <td
                    class="blue lighten-4"
                    v-for="input in Object.keys(predictions[0].predictInput)"
                    :key="'pre-input-' + input"
                  >
                    <pre>{{input}}</pre>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(prediction, n) in predictions"
                  :key="'pred' + n"
                >
                  <template v-if="task === 'classification'">
                    <td><pre>{{prediction.result[0].label}}</pre></td>
                    <td><pre>{{humanReadable(prediction.result[0].confidence)}}</pre></td>
                  </template>
                  <template v-else>
                    <td><pre>{{humanReadable(prediction.result[0].value)}}</pre></td>
                  </template>
                  <template
                    v-for="input in prediction.predictInput"                  >
                    <td :key="'predI' + n + input"><pre>{{humanReadable(input)}}</pre></td>
                  </template>
                </tr>
              </tbody>
            </v-simple-table>
          </template>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import * as utils from '../utils/utilFuncs';

export default {
  components: {
  },
  data () {
    return {
      columns: {},
      predictionCount: 1,
      predictions: [],
      isPredicting: false,
    };
  },
  props: ['property'],
  computed: {
    inputColumns: function () {
      return this.$root.nn.getInputFeatures() || [];
    },
    isTrained: function () {
      return this.$root.nn.getIsTrained();
    },
    task: function () {
      return this.$root.nn.getTask();
    },
  },
  watch: {
    inputColumns: {
      deep: true,
      handler (val) {
        const obj = {};
        Object.keys(this.inputColumns).forEach(key => {
          obj[key] = {
            name: key,
            value: '',
          };
        });
        this.columns = obj;
      },
    },
  },
  methods: {
    ...utils,
    predict: function () {
      this.predictions = this.$root.predict(this.columns, this.predictionCount);
    },
  },
};
</script>

<style>
</style>
