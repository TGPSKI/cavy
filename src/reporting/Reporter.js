export const XUnitReport = testResults => {
  let testCaseToXML = (suiteName, testName, testCase) => {
    var passed = testCase.expected == testCase.actual;
    var xml = '    <testcase classname="' + suiteName + '" name="' + testName + '"';

    if (passed) {
      xml += '/>\n';
    } else {
      xml +=
        '>\n      <failure message="Expected ' +
        testCase.expected +
        ' but got ' +
        testCase.actual +
        '">' +
        testCase.error +
        '</failure>\n';
      xml += '    </testcase>\n';
    }

    return xml;
  };

  let testSuiteToXML = (suiteName, suite) => {
    var numTests = Object.keys(suite).length;
    var xml = '  <testsuite tests="' + numTests.toString() + '">\n';
    for (var testName in suite) {
      xml += testCaseToXML(suiteName, testName, suite[testName]);
    }
    xml += '  </testsuite>\n';
    return xml;
  };

  let jsonToXUnit = results => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n';
    let suiteNames = Object.keys(results);
    suiteNames &&
      suiteNames.forEach(suite => {
        xml += testSuiteToXML(suite, results[suite]);
      });
    xml += '</testsuites>\n';
    return xml;
  };

  const report = jsonToXUnit(testResults);
  return report;
};

export const postTestResults = (testResultXML, params = {}) => {
  let configuredParams = Object.assign(
    {},
    {
      url: 'http://localhost:3003/jenkins',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      testDeviceIdentifier: 'default'
    },
    params
  );

  const headers = new Headers({
    ...configuredParams.headers
  });

  const requestParams = {
    method: configuredParams.method,
    headers: headers || undefined,
    body: JSON.stringify({
      testResult: testResultXML,
      testDeviceIdentifier: configuredParams.testDeviceIdentifier
    })
  };

  return fetch(configuredParams.url, requestParams)
    .then(response => response.text())
    .then(responseData => {
      console.log('responseData', responseData);
    })
    .catch(failure => {
      console.warn(failure);
    });
};
