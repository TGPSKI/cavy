import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { reduxForm } from 'redux-form';
import { Tester, TestHookStore } from 'cavy';

import EmployeeDirectoryApp from 'App/EmployeeDirectoryApp';

import GLOBAL from 'Helpers/globals.js';

if (GLOBAL.TEST_ENABLED) {
  var testHookStore = new TestHookStore();
  var testSuites = require('Specs/itSuites.js');
  var testSuitesArray = [testSuites.filterEmployeeList, testSuites.tapAndEmail];
}

const { store } = () => {
  return { form: reduxForm() };
};

class AppWrapper extends Component {
  render() {
    if (GLOBAL.TEST_ENABLED) {
      return (
        <Provider store={store}>
          <Tester
            suites={testSuitesArray}
            store={testHookStore}
            waitTime={1000}
            testStartDelay={1000}
            consoleLog={true}
            reporter={true}
            reRender={true}
            reduxStore={store}
          >
            <EmployeeDirectoryApp />
          </Tester>
        </Provider>
      );
    } else {
      return (
        <Provider store={store}>
          <EmployeeDirectoryApp />
        </Provider>
      );
    }
  }
}

AppRegistry.registerComponent('EmployeeDirectory', () => AppWrapper);
