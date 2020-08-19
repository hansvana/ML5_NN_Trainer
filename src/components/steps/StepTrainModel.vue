<template>
  <div>
    <v-row no-gutters>
      <v-col cols="12" sm="4">
        <p>A graph will show the training progress.</p>
        <p>Note: The loss might not always be displayed correctly. If the loss goes down very/too
          quickly and stays fixed on a number,
          that might be sign of very little correlation in the data, even if
          the reported loss is a very low number.<br>
          However, loss that keeps going down slowly and continually,
          is usually a sign of good data and a reliable training.</p>
        <v-btn tile dark color="blue" :loading="$root.isTraining" @click="$emit('train')">
          <v-icon left>mdi-check-circle</v-icon>Train
        </v-btn>
      </v-col>
      <v-col cols="12" sm="8">
        <v-layout justify-center v-if="progress.length > 0">
          <strong>
            Current loss: {{ this.progress[this.progress.length - 1].loss.toFixed(3) }}
          </strong>
        </v-layout>
        <div class="small" v-if="progress.length > 0">
          <line-chart
            :chartData="chartData"
            :options="chartOptions"
            :styles="{height: '250px', position: 'relative'}">
          </line-chart>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import LineChart from '../utils/LineChart';

export default {
  components: {
    LineChart,
  },
  data () {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        scales: {
          yAxes: [{ display: true, ticks: { beginAtZero: true } }],
          xAxes: [{ display: true }],
        },
      },
    };
  },
  mounted () {
  },
  props: ['property'],
  computed: {
    progress: function () {
      return this.$root.nn.getProgress();
    },
    chartData: function () {
      return {
        labels: this.progress.map(p => p.epoch + 1),
        datasets: [
          {
            label: 'Loss',
            backgroundColor: '#DC0046',
            pointBackgroundColor: '#1976D2',
            pointBorderColor: '#FFF',
            data: this.progress.map(p => p.loss.toFixed(3)),
          },
        ],
      };
    },
  },
  methods: {
  },
};
</script>

<style>
.small {
  max-width: 600px;
  height: 300px;
  margin: 30px auto;
  position: relative;
}
</style>
