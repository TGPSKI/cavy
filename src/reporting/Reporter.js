const XUnitReport = testResults => {
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
    let xml = '  <testsuite tests="' + numTests.toString() + '">\n';
    let tests = Object.keys(suite);

    tests.forEach(test => {
      xml += testCaseToXML(suiteName, test, suite[test]);
    });

    for (var testName in suite) {
    }
    xml += '  </testsuite>\n';
    return xml;
  };

  let jsonToXUnit = results => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n';
    let { suites } = results.tests;
    let suiteNames = Object.keys(suites);
    suiteNames &&
      suiteNames.forEach(suite => {
        xml += testSuiteToXML(suite, suites[suite]);
      });
    xml += '</testsuites>\n';
    return xml;
  };

  let xunit = jsonToXunit(testResults);
};

export const reporter = XUnitReport;

export const postTestResults = (testResultJSON, params) => {
  const headers = new Headers({
    ...params.headers
  });

  const body = {
    testResult: testResultJSON
  };

  const requestParams = {
    method: params.method,
    headers: headers || undefined,
    body: JSON.stringify(body)
  };

  return fetch(params.url, requestParams)
    .then(response => response.text())
    .then(responseData => {
      console.log('responseData', responseData);
    })
    .catch(failure => {
      console.warn(failure);
    });
};
