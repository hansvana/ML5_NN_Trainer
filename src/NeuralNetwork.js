/**
 * This class wraps around ML5.js, which itself abstracts TensorFlow.js
 */
import ml5 from 'ml5';
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
        // Automatically set the datatype (string / number) for each column
        columns = this.detectColumnsDatatype(data, columns);
        // Add data to the model
        this.addData(data, columns, options.task);
        // Normalize data
        this.nn.normalizeData();
        console.log(this.nn.data);
        console.log('done normalizing');
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
        if (
          (col.datatype === 'number' || col.datatype === 'boolean') &&
          !(task === 'classification' && col.usage === 'output')
        )
          value = isNaN(value) ? value : parseFloat(value);
        // Because of a bug with ml5.js, we convert binary output features in classification
        // to 'true' and 'false'
        // https://github.com/ml5js/ml5-library/issues/973
        if (
          col.datatype === 'boolean' &&
          task === 'classification' &&
          col.usage === 'output'
        )
          value = value === '1' ? 'true' : 'false';

        if (col.usage === 'input')
          input[col.name] = value;
        else if (col.usage === 'output')
          output[col.name] = value;
      });

      // add objects to data
      this.nn.addData(input, output);
    });
  }

  /**
   * Iterates through all data, if all values are either 0 or 1 it assumes a datatype of "boolean"
   * otherwise if isNaN is true on any value it assumes that feature has
   * a datatype of "string", else "number"
   * @param dataset 2D array of data
   * @param columns array of features
   * @returns columns with property dataset set to "boolean", "string" or "number"
   */
  detectColumnsDatatype (data, columns) {
    columns.forEach(column => {
      if (data.every(row => row[column.name] === '1' || row[column.name] === '0'))
        column.datatype = 'boolean';
      else if (data.some(row => isNaN(row[column.name])))
        column.datatype = 'string';
      else
        column.datatype = 'number';
    });
    return columns;
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

    // Build a testing set from user input and/or random values
    // Iterate through each input feature
    Object.keys(this.getInputFeatures()).forEach(key => {
      if (this.getInputFeatures()[key].dtype === 'string') {
        // Handle strings
        const legend = Object.keys(this.getInputFeatures()[key].legend);
        predictInput[key] =
          inputs[key].value ||
          legend[Math.floor(Math.random() * legend.length)]; // random value from the legend
      } else if (this.getInputFeatures()[key].dtype === 'number') {
        // Handle binary
        // binary is not stored as a dtype, so we have to do some deeper checks
        // So we check in min is 0, max is 1, and no values are something other than 0 or 1
        if (
          this.getInputFeatures()[key].min === 0 &&
          this.getInputFeatures()[key].max === 1 &&
          !(this.getData().some(d => {
            return d.xs[key] !== 0 && d.xs[key] !== 1;
          }))
        )
          predictInput[key] = Math.floor(Math.random() * 2); // random 0 or 1
        else
        // Handle numbers
          predictInput[key] =
            parseFloat(inputs[key].value) ||
            _.randomBetween(
              this.getInputFeatures()[key].min,
              this.getInputFeatures()[key].max,
            ); // random value between min and max
      } else {
        callback(new Error(`
          don't know how to handle ${this.getInputFeatures()[key].dtype} ${key}`,
        ));
      }
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
