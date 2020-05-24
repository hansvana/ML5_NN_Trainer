/**
 * This class wraps around ML5.js, which itself abstracts TensorFlow.js
 */
import ml5 from '../lib/ml5.min';
import * as _ from './components/utils/utilFuncs';

// Set up defaults
const DEFAULTS = {
  task: 'classification',
  epochs: 10,
  batchSize: 12,
  learningRate: 0.2,
};

/** ////////////////////////////////////////////////
 *
 * NeuralNetwork
 *
 * TOC:
 * - Constructor
 * - Training
 * - Prediction
 * - Saving
 * - Data validation
 *
 * ////////////////////////////////////////////////
 */
export default class NeuralNetwork {
  constructor () {
    // private :
    this.nn = null;
    this.modelOptions = {};
    this.trainingOptions = {};
    this.trainingProgress = [];

    // public :
    this.hasData = false;
  }

  /*
   * ////////////////////////////////////////////////
   * Saving Data
   * ////////////////////////////////////////////////
   */

  /**
   * Initialize the model with options and data.
   */
  saveData ({ data, columns, options }) {
    return new Promise((resolve, reject) => {
      // Extract model options
      this.modelOptions = {
        inputs: columns.filter(c => c.usage === 'input').map(i => i.name),
        outputs: columns.filter(c => c.usage === 'output').map(i => i.name),
        task: options.task,
        learningRate: options.learningRate,
        // debug: true,
      };

      try {
        // Create the model
        this.nn = ml5.neuralNetwork(this.modelOptions);
        // Add data to the model
        this.addData(data, columns, options.task);
        // Normalize data
        this.nn.normalizeData();
      } catch (err) {
        return reject(err, null);
      }

      this.hasData = true;

      resolve();
    });
  }

  /**
   * Parse the dataset and add it to the model
   * @param dataset 2D array of data
   * @param columns array of features
   */
  addData (data, columns, task) {
    let input, output, value;

    // Iterate each row in the dataset
    data.forEach((line, n) => {
      input = {};
      output = {};

      // Iterate over each feature and find corresponding value in line
      columns.forEach(col => {
        value = line[col.name];

        // Perform data conversion to number if possible
        // Note: For classification tasks, the output feature should remain a string
        // https://github.com/ml5js/ml5-library/issues/973
        if (task !== 'classification' || col.usage !== 'output')
          value = isNaN(value) ? value : parseFloat(value);

        if (col.usage === 'input')
          input[col.name] = value;
        else if (col.usage === 'output')
          output[col.name] = value;
      });

      // add objects to data
      this.nn.addData(input, output);
    });
  }

  /*
   * ////////////////////////////////////////////////
   * Training
   * ////////////////////////////////////////////////
   */

  train (options, onFinished) {
    return new Promise((resolve, reject) => {
      // Extract training options
      this.trainingOptions = {
        epochs: options.epochs,
        batchSize: options.batchSize,
      };

      this.resetProgress();

      try {
        this.nn.train(
          this.trainingOptions,
          (epoch, loss) => {
            // console.log('TRAINING EPOCH', epoch, '\tLOSS', loss.loss);
            this.trainingProgress.push({ epoch, loss: loss.loss });
          },
          resolve,
        );
      } catch (err) {
        return reject(err);
      }
    });
  }

  resetProgress () {
    this.trainingProgress = [];
  }

  /*
   * ////////////////////////////////////////////////
   * Prediction
   * ////////////////////////////////////////////////
   */

  predict (inputs, callback) {
    const predictInput = {};
    Object.keys(this.getInputFeatures()).forEach(key => {
      predictInput[key] =
        inputs[key].value ||
        _.randomBetween(
          this.getInputFeatures()[key].min,
          this.getInputFeatures()[key].max,
        );
    });

    if (this.modelOptions.task === 'classification')
      this.nn.classify(predictInput, (error, result) => {
        callback(error, { predictInput, result });
      });
    else
      this.nn.predict(predictInput, (error, result) => {
        callback(error, { predictInput, result });
      });
  }

  /*
   * ////////////////////////////////////////////////
   * Data validation
   * ////////////////////////////////////////////////
   */

  /**
  * Perform all validation tasks
  */
  checkAll ({ data, columns, options }) {
    return new Promise((resolve, reject) => {
      try {
        data = this.checkData(data);
        columns = this.checkColumns(columns);
        options = this.checkOptions(options);
      } catch (err) {
        return reject(err);
      }

      resolve({ data, columns, options });
    });
  }

  /**
   * Check the dataset for validity
   * @param dataset 2D array of data
   */
  checkData (data) {
    if (!data || data.length <= 0)
      throw new Error('No data');

    return data;
  }

  /**
   * Check the columns object array
   * @param columns array of features
   */
  checkColumns (columns) {
    if (!columns)
      throw new Error('No columns object found');
    if (columns.filter(c => c.usage === 'input').length < 1)
      throw new Error('Need at least 1 input column');
    if (columns.filter(c => c.usage === 'output').length < 1)
      throw new Error('Need at least 1 output column');

    return columns;
  }

  /**
   * Check the training options for validity
   * @param options
   */
  checkOptions (options) {
    if (!options)
      throw new Error('No options object found');
    if (!options.task || !(options.task === 'classification' || options.task === 'regression'))
      throw new Error('No task set');
    if (!options.batchSize || isNaN(options.batchSize) || (options.batchSize < 1))
      throw new Error('Batch size too small or not a number');
    if (!options.epochs || isNaN(options.epochs) || (options.epochs < 1))
      throw new Error('Epochs too few or not a number');
    if (!options.learningRate || isNaN(options.learningRate) || (options.learningRate <= 0))
      throw new Error('Learning rate too small or not a number');

    return {
      ...options,
      batchSize: parseInt(options.batchSize),
      epochs: parseInt(options.epochs),
      learningRate: parseFloat(options.learningRate),
    };
  }

  /*
   * ////////////////////////////////////////////////
   * Saving
   * ////////////////////////////////////////////////
   */

  save () {
    if (this.nn)
      this.nn.save();
  }

  /*
   * ////////////////////////////////////////////////
   * Generic getters
   * ////////////////////////////////////////////////
   */

  getData () {
    if (this.nn)
      return this.nn.neuralNetworkData.data.raw;
  }

  getAllFeatures () {
    if (this.nn)
      return {
        ...this.nn.neuralNetworkData.meta.inputs,
        ...this.nn.neuralNetworkData.meta.outputs,
      };
  }

  getInputFeatures () {
    if (this.nn)
      return this.nn.neuralNetworkData.meta.inputs;
  }

  getOutputFeatures () {
    if (this.nn)
      return this.nn.neuralNetworkData.meta.outputs;
  }

  getHiddenUnits () {
    if (this.nn)
      return this.nn.options.hiddenUnits;
  }

  getTask () {
    if (this.nn)
      return this.nn.options.task;
  }

  getIsTrained () {
    if (this.nn)
      return this.nn.neuralNetwork.isTrained;
  }

  getDefaults () {
    return DEFAULTS;
  }

  getProgress () {
    return this.trainingProgress;
  }
}
