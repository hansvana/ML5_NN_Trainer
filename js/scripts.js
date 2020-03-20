// Step 1a: Read file input
var fileUploadBtn = document.querySelector("#fileuploadbtn");
var fileContents;

fileUploadBtn.addEventListener("change", () => {
  //console.log(fileUploadBtn.files[0]);

  var file = fileUploadBtn.files[0];
  if (file) {
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
      //console.log(evt.target.result);
      fileContents = evt.target.result;
      findColumns();
    };
    reader.onerror = function (evt) {
      console.error("error reading file");
    };
  }
});

// Step 2: Show column names
var columnList = document.querySelector("#columnlist");
var lines = [],
  columns = [];

function findColumns() {
  lines = fileContents.split("\n");
  columns = lines[0].trim().split(",");
  columnList.innerHTML = "";
  columns.forEach(function (column) {
    columnList.innerHTML += `
        <tr>
            <td class="uk-table-shrink">
                <select class="uk-select uk-form-width-medium" data-title="${column}">
                    <option value="input">🟩 Use as input</option>
                    <option value="output">🟦 Use as output</option>
                    <option value="ignore">🟥 Ignore</option>
                </select>
            </td>
            <td>${column}</td>
        </tr>
    `;
  });
}

// Step 3: Get training options
var trainBtn = document.querySelector("#trainBtn");
trainBtn.addEventListener("click", main);
var options, trainingOptions;

function main() {
  setupTraining();
  createModel();
  loadData();

  console.log("TRAINING");
  neuralNetwork.train(trainingOptions, whileTraining, doneTraining);
}

function setupTraining() {
  options = {
    inputs: [],
    outputs: [],
    task: document.querySelector("input[name='traintype']").value
  };

  var selects = document.querySelectorAll("#columnlist select");

  for (var i = 0; i < selects.length; i++) {
    if (selects[i].value == "input")
      options.inputs.push(selects[i].dataset.title);
    else if (selects[i].value == "output")
      options.outputs.push(selects[i].dataset.title);
  }

  trainingOptions = {
    epochs: parseInt(document.querySelector("#epochs").value),
    batchSize: parseInt(document.querySelector("#batchsize").value)
  };

  console.log(options);
  console.log(trainingOptions);
}

// Step 4: Train the model
var neuralNetwork;
var data = [];
var finalLoss;

function createModel() {
  console.log("CREATING NEURAL NETWORK");
  neuralNetwork = ml5.neuralNetwork(options);
}

function loadData() {
  console.log("ADDING DATA");
  console.log(lines.length);
  var line, input, output;
  for (var i = 1; i < lines.length; i++) {
    line = lines[i].trim().split(",");
    if (line.length !== columns.length) continue; // TODO: report on skipped line
    (input = {}), (output = {});
    for (var j = 0; j < columns.length; j++) {
      if (options.inputs.includes(columns[j])) input[columns[j]] = line[j];
      else if (options.outputs.includes(columns[j]))
        output[columns[j]] = line[j];
    }
    //console.log(input, output);
    neuralNetwork.addData(input, output);
  }

  console.log("NORMALIZING DATA");
  neuralNetwork.normalizeData();
}

// Step 4b: Show the training graph
var trainResults = [];

var graph = new lineGraph("#graphcanvas")
  .setMargins({ x: 50, y: 50 })
  .setData(trainResults)
  .setXAxis({ label: "epoch", range: [1, lineGraph.getMaxVal(trainResults, "x")] })
  .setYAxis({ label: "loss", range: [0, lineGraph.getMaxVal(trainResults, "y")] })
  .setLineStyle({ width: 5, color: "#BADA55" })
  .setHeader(``)
  .draw();

function whileTraining(epoch, loss) {
  console.log(epoch, loss.loss);
  graph.addData({ x: epoch + 1, y: loss.loss });

  graph.setXAxis({ range: [1, lineGraph.getMaxVal(graph.dataset, "x")] })
    .setYAxis({ range: [0, lineGraph.getMaxVal(graph.dataset, "y")] })
    .setHeader(`epoch: ${epoch} - loss ${loss.loss}`)
    .draw();
}

// Step 5: Test the trained model
var testInputList = document.querySelector("#testinputlist");
var testOutputList = document.querySelector("#testoutputlist");

function doneTraining() {
  testInputList.innerHTML = "";
  options.inputs.forEach(function (column) {
    testInputList.innerHTML += `
            <tr>
                <td class="uk-table-shrink">${column}</td>
                <td>
                <input
                  class="uk-input uk-form-width-small"
                  name="${column}"
                  type="text"
                  value="0"
                />
                </td>
            </tr>
        `;
  });
  testInputList.innerHTML += `
            <tr>
                <td colspan="2"><a class="uk-button uk-button-primary" id="trainBtn" onclick="predict()">
                Predict
              </a></td>
            </tr>
        `;
}

function predict() {
  var inputs = {},
    value;
  options.inputs.forEach(function (column) {
    value = document.querySelector(`#testinputlist input[name='${column}']`)
      .value;
    if (!isNaN(value)) value = Number(value);
    inputs[column] = value;
  });

  if (options.task === "classification") {
    neuralNetwork.classify(inputs, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }

      // Step 7: Display the classification
      showPrediction(results);
    });
  }
}

function showPrediction(results) {
  testOutputList.innerHTML = "";
  results.forEach(function (result) {
    testOutputList.innerHTML += `
            <tr>
                <td class="uk-table-shrink">${result.label}</td>
                <td>${result.confidence}</td>
            </tr>
        `;
  });
}

// Step 6: Save the trained model
document.querySelector("#saveBtn").addEventListener("click", () => {
  neuralNetwork.save(finishedSaving);
});

function finishedSaving() {
  console.log("Done!");
}
