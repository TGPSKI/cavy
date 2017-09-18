var fetch = require('node-fetch');
var fs = require('fs');
var jsonfile = require('jsonfile');
var mkdirp = require('mkdirp');
var path = require('path');

function handleFailure(failure) {
  console.log(failure);
}

const webhookConfig = outputFileName => {
  return {
    url: 'http://localhost:3003/jenkins/webhook',
    body: { outputFileName: outputFileName }
  };
};

function postTestCompleteWebhook(params) {
  fetch(params.url, {
    method: 'PUT',
    body: JSON.stringify(params.body),
    headers: { 'Content-Type': 'application/json' }
  })
    .catch(err => handleFailure(err))
    .then(function(res) {
      return res.text();
    })
    .then(function(text) {
      console.log(text);
    });
}

function writeReport(
  report,
  outputDir,
  type = 'xml',
  webhookCallback = false,
  jsonFileOptions = { spaces: 2 }
) {
  mkdirp(outputDir, err => {
    if (err) {
      return console.log('Error creating path ' + outputDir + '. Reason: ' + err);
    }
  });

  var filename = 'results.' + type;
  var outputFilePath = path.join(outputDir, filename);

  var err_handler = err => {
    if (err) {
      return console.log('Error writing test results to file: ' + err);
    } else {
      console.log('Test results written to ' + outputFilePath);

      if (webhookCallback) {
        webhookCallback(outputFilePath);
      }
    }
  };

  if (type == 'json') {
    jsonfile.writeFile(outputFilePath, report, jsonFileOptions, err_handler);
  } else {
    fs.writeFile(outputFilePath, report, err_handler);
  }
}

module.exports = {
  index: (req, res) => {
    var results = Object.assign({}, req.body.testResult);
    console.log(results);
    var xunit = jsonToXUnit(results);
    var outputDir = './specs/server/output/';
    writeReport(xunit, outputDir, 'xml');
    return res.send('Results recorded.');
  },
  webhook: (req, res) => {
    // USED FOR TESTING WEBHOOK FUNCTIONALITY ONLY
    return res.send('Webhook endpoint hit: ' + req.body.outputFileName);
  }
};
