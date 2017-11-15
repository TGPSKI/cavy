// PLEASE NOTE:
// The reporting server shown here should live in the react native project.
// Start the server with a package.json script:

// "reporter": "node ./specs/server/app.js",
// On your CI server, run: `npm run reporter` before launching your simulator or running cavy tests on a device.

var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

function writeReport(report, outputDir, deviceIdentifier = 'default') {
  mkdirp(outputDir, err => {
    if (err) {
      return console.log('Error creating path ' + outputDir + '. Reason: ' + err);
    }
  });

  let today = new Date();

  let strDate = 'm-d-Y'
    .replace('Y', today.getFullYear())
    .replace('m', today.getMonth() + 1)
    .replace('d', today.getDate());

  var filename;
  if (deviceIdentifier === 'default') {
    filename = `results_${strDate}.xml`;
  } else {
    filename = `results_${deviceIdentifier}_${strDate}.xml`;
  }

  var outputFilePath = path.join(outputDir, filename);

  var err_handler = err => {
    if (err) {
      return console.log('Error writing test results to file: ' + err);
    } else {
      console.log('Test results written to ' + outputFilePath);
    }
  };

  fs.writeFile(outputFilePath, report, err_handler);
}

module.exports = {
  index: (req, res) => {
    console.log(req.body);
    var outputDir = './specs/server/output/';
    writeReport(req.body.testResult, outputDir, req.body.testDeviceIdentifier);
    return res.send('Results recorded.');
  }
};
