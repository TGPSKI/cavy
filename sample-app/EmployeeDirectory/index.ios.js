import React, { Component } from 'react';
import {AppRegistry} from 'react-native';

import { Tester, TestHookStore } from 'cavy';

import EmployeeDirectoryApp from './app/EmployeeDirectoryApp';

import GLOBAL from './app/helpers/globals.js';

if (GLOBAL.TEST_ENABLED) {
  var testHookStore = new TestHookStore();
  var testSuites = require('./specs/itSuites.js');
  var testSuitesArray = [testSuites.filterEmployeeList, testSuites.tapAndEmail];
}

class AppWrapper extends Component {
  render() {
<<<<<<< HEAD
    return (
      <Tester specs={[EmployeeListSpec]} store={testHookStore} waitTime={1000} startDelay={3000}>
        <EmployeeDirectoryApp />
      </Tester>
    );
||||||| parent of 4a0cbb7... sample-app: show new suite imports, test disable, new props
    return (
      <Tester specs={[EmployeeListSpec]} store={testHookStore} waitTime={1000}>
        <EmployeeDirectoryApp />
      </Tester>
    );
=======
    if (GLOBAL.TEST_ENABLED) {
      return (
        <Tester 
          suites={testSuitesArray} 
          store={testHookStore} 
          waitTime={1000}
          testStartDelay={1000}
          consoleLog={true} // {false}, {true}, 'verbose'
        >
          <EmployeeDirectoryApp />
        </Tester>
      );
    } else {
      return (<EmployeeDirectoryApp />);
    }
>>>>>>> 4a0cbb7... sample-app: show new suite imports, test disable, new props
  }
}

AppRegistry.registerComponent('EmployeeDirectory', () => AppWrapper);
