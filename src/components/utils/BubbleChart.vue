<script>
import { Bubble, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

export default {
  extends: Bubble,
  mixins: [reactiveProp],
  props: {
    chartData: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      default: null,
    },
  },
  mounted () {
    this.renderChart(this.chartData, this.options);
  },
  watch: {
    options: function () {
      this.renderChart(this.chartData, this.options);
    },
  },
};
</script>
