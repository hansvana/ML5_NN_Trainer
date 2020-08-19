<template>
  <div>
    <v-row no-gutters v-if="hasData">
      <v-col cols="12" sm="3">
        <v-select
          :items="[noneValue, ...columnNames]"
          label="Group by"
          v-model="groupBy"
          value="(none)"
        ></v-select>
        <v-select
          :items="[noneValue, ...columnNames]"
          label="Color by"
          v-model="colorBy"
        ></v-select>
        <v-select
          :items="columnNames"
          label="X Axis"
          v-model="xAxis"
        ></v-select>
        <v-select
          :items="columnNames"
          label="Y Axis"
          v-model="yAxis"
        ></v-select>
        <v-select
          :items="columnNames"
          label="Size"
          v-model="rSize"
        ></v-select>
        <v-btn
          @click="resetForm"
        >
          Reset
        </v-btn>
      </v-col>
      <v-col cols="12" sm="9">
        <v-container>
          <v-layout justify-center class="chart-layout">
            <bubble-chart v-for="(itm, n) in uniqueGroupValues"
              :key="'chart-'+n"
              :chartData="chartData[itm]"
              :options="{ ...chartOptions, title: { display: true, text: itm } }"
              :styles="uniqueGroupValues.length > 1 ? {'width' : '50%'} : {'width' : '100%'}"
              class="chart-container"
            >
            </bubble-chart>
          </v-layout>
        </v-container>
      </v-col>
    </v-row>
    <v-alert v-else type="warning">
      Please select a valid CSV file first.
    </v-alert>
  </div>
</template>

<script>
import BubbleChart from '../utils/BubbleChart';
import * as _ from '../utils/utilFuncs';

export default {
  components: {
    BubbleChart,
  },
  data () {
    return {
      charts: [],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
        legend: { display: false },
        title: { display: true },
        scales: {
          yAxes: [{ type: 'linear' }],
          xAxes: [{ type: 'linear' }],
        },
      },
      groupBy: null,
      colorBy: null,
      xAxis: null,
      yAxis: null,
      rSize: null,
      noneValue: '(none)',
    };
  },
  props: ['property'],
  computed: {
    dataset: function () {
      return this.property.data;
    },
    columns: function () {
      return this.property.columns;
    },
    hasData: function () {
      return this.dataset.length > 0;
    },
    columnNames: function () {
      return this.columns.map(c => c.name);
    },
    sizes: function () {
      if (this.rSize) {
        const sizes = this.dataset.map(d => d[this.rSize]);
        return {
          min: _.arrayMin(sizes),
          max: _.arrayMax(sizes),
        };
      }
      return {
        min: 5,
        max: 5,
      };
    },
    uniqueGroupValues: function () {
      // If user has selected 'Group by', find all unique values in that feature
      if (this.groupBy && this.groupBy !== this.noneValue) {
        const uniqueValues = _.uniqueValues(this.dataset.map(d => d[this.groupBy]));

        if (uniqueValues.length > 4) {
          this.$root.addError(new Error('Can\'t group by features with more than 4 unique values'));
          this.resetForm();
          return ['-'];
        }

        return uniqueValues;
      }
      return ['-'];
    },
    uniqueColorValues: function () {
      // If user has selected 'Color by', find all unique values in that feature
      if (this.colorBy && this.colorBy !== this.noneValue) {
        const uniqueValues = _.uniqueValues(this.dataset.map(d => d[this.colorBy]));
        uniqueValues.sort();
        return uniqueValues;
      }
      return null;
    },
    chartData: function () {
      // Arrange the data into groups and call createDataset on those groups
      const datasets = {};

      const vals = this.groupBy ? this.uniqueGroupValues : ['-'];
      vals.forEach(group => {
        const groupData = group !== '-'
          ? this.dataset.filter(d => { return d[this.groupBy] === group; })
          : this.dataset;

        datasets[group] = {
          datasets: [],
        };
        if (this.colorBy && this.uniqueColorValues !== null)
          this.uniqueColorValues.forEach((color, n) => {
            const filteredArray =
              groupData.filter(d => {
                return d[this.colorBy] === color;
              });

            datasets[group].datasets.push(
              this.createDataset(
                filteredArray,
                n / this.uniqueColorValues.length,
                group,
              ),
            );
          });
        else
          datasets[group].datasets.push(this.createDataset(groupData, Math.random(), group));
      });

      return datasets;
    },
  },
  methods: {
    resetForm: function () {
      this.groupBy = null;
      this.colorBy = null;
      this.xAxis = null;
      this.yAxis = null;
      this.rSize = null;
    },
    createDataset (arr, index, label) {
      // generates a dataset based on input array for a chart (or color group for a chart)
      const set = arr.map((d, i) => {
        const x = parseFloat(d[this.xAxis]) || 0;
        const y = parseFloat(d[this.yAxis]) || 0;
        const r = d[this.rSize]
          ? _.scale(d[this.rSize], this.sizes.min, this.sizes.max, 3, 20)
          : this.sizes.max;
        return { x, y, r };
      });

      return {
        data: set,
        backgroundColor: `hsla(${360 * index}, 50%, 50%, 0.6)`,
        title: 'foo',
      };
    },
  },
};
</script>

<style>
.chart-container {
  position: relative;
}

.chart-layout {
  flex-wrap: wrap;
}
</style>
