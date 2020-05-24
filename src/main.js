import Vue from 'vue';
import NeuralNetwork from './NeuralNetwork';
import App from './components/App.vue';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: h => h(App),
  computed: {
    defaults: function () {
      return this.nn.getDefaults();
    },
  },
  data: () => ({
    errors: [],
    status: null,
    nn: new NeuralNetwork(),
    isTraining: false,
    isPredicting: false,
    fileName: 'data.csv',
  }),
  methods: {
    reset () {
      this.status = null;
      this.nn = new NeuralNetwork();
    },
    addError (err) {
      console.error(err.message);
      this.errors.push(err.message);
    },
    clearErrors () {
      this.errors = [];
    },
    async train (...args) {
      try {
        this.status = 'Checking data';
        this.isTraining = true;
        const validated = await this.nn.checkAll(...args);

        this.status = 'Saving data';
        await this.nn.saveData(validated);

        this.status = 'Training';
        await this.nn.train(validated.options);

        this.status = 'Training complete!';
        this.isTraining = false;
      } catch (err) {
        this.isTraining = false;
        this.addError(err);
      }
    },
    predict (inputs, amount) {
      if (isNaN(amount) || amount < 1)
        return;

      const results = [];

      for (let i = 0; i < amount; i++)
        this.nn.predict(inputs, function (error, result) {
          if (error)
            return this.errors.push(error.message);
          results.push(result);
        });

      return results;
    },
  },
}).$mount('#app');
