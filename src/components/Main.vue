<template>
  <v-content>
    <v-container fluid class="main-container">
      <v-stepper
        :vertical="true"
        class="no-transition"
      >
        <template v-for="(step, n) in steps">
          <v-stepper-step
            :key="`${n}-step`"
            :complete="true"
            :step="n+1"
            :editable="true"
            :edit-icon="''+(n+1)"
          >{{step.title}}</v-stepper-step>

          <v-stepper-content
            :key="`${n}-content`"
            :step="n+1"
          >
            <component
              :is="step.component"
              :property="dataObj"
              @error="onError($event)"
              @dataLoaded="onDataLoad($event)"
              @save="save()"
              @train="train()"
              @predict="predict()"
            ></component>
          </v-stepper-content>
        </template>
      </v-stepper>
    </v-container>
  </v-content>
</template>

<script>
import StepSelectFile from './steps/StepSelectFile';
import StepSelectColumns from './steps/StepSelectColumns';
import StepSetOptions from './steps/StepSetOptions';
import StepReviewData from './steps/StepReviewData';
import StepTrainModel from './steps/StepTrainModel';
import StepTestModel from './steps/StepTestModel';
import StepSaveModel from './steps/StepSaveModel';

export default {
  /* eslint-disable */
  name: "Main",

  components: {
    StepSelectFile,
    StepSelectColumns,
    StepSetOptions,
    StepReviewData,
    StepTrainModel,
    StepTestModel,
    StepSaveModel,
  },

  data: function() {
    return {
      dataObj: {
        columns: [],
        data: [],
        options: this.$root.nn.getDefaults(),
      },
      history: [],
      steps: [
        {
          component: "StepSelectFile",
          title: "Select your CSV file",
        },
        {
          component: "StepReviewData",
          title: "Review your data",
        },
        {
          component: "StepSelectColumns",
          title: "Select your columns",
        },
        {
          component: "StepSetOptions",
          title: "Set your training options",
        },
        {
          component: "StepTrainModel",
          title: "Train your model",
        },
        {
          component: "StepTestModel",
          title: "Test the trained model",
        },
        {
          component: "StepSaveModel",
          title: "Save the trained model",
        }
      ]
    };
  },

  methods: {
    onError(msg) {
      this.$root.addError(msg);
    },
    // Fired when file is loaded
    onDataLoad(data) {
      this.$root.reset();
      this.dataObj.columns = [];
      this.dataObj.data = [];

      if (data.length >= 2) {
        // store column info
        this.dataObj.columns = data[0]
          .filter(c => c !== '')
          .map((cell, n) => {
            return { name: cell, index: n, usage: "input" };
          });

        // default last feature to output
        this.dataObj.columns[this.dataObj.columns.length - 1].usage = "output";

        // store data
        for (let i = 1; i < data.length; i++) {
          let obj = {};
          this.dataObj.columns.forEach(column => {
            obj[column.name] = data[i][column.index] || 0;
          });
          this.dataObj.data.push(obj);
        }

        this.checkForColumnsWithOnlyOneValue();
      }
    },
    checkForColumnsWithOnlyOneValue(){
      const arr = this.dataObj.data;
      this.dataObj.columns.forEach(column => {
        if (arr.every( itm => itm[column.name] === arr[0][column.name] )) {
          this.onError(new Error(
            `All values for feature <strong>${column.name}</strong> are the same. 
            This will cause problems while training. The column has been 
            automatically set to 'ignore'.`
          ));
          column.usage = "ignore";
        }
      });
    },
    train() {
      this.$root.train(this.dataObj);
    },
    save() {
      this.$root.nn.save();
    },
  }
};
</script>

<style lang="scss">
.v-label {
  font-size: 17px !important;
  color: #000 !important;
}

.v-alert {
  font-size: 1em !important;
}

@media only screen and (min-width: 600px) {
  .v-snack__wrapper {
    max-width: none !important;
  }
}

.v-stepper i {
  font-size: 1.2em !important;
  font-style: normal !important;
}

.main-container {
  max-width: 1024px;
}
</style>
