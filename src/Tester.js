import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import { AsyncStorage } from 'react-native';

import TestHookStore from './TestHookStore';
import TestScope from './TestScope';

import { View } from 'react-native';

// Public: Wrap your entire app in Tester to run tests against that app,
// interacting with registered components in your test cases via the Cavy
// helpers (defined in TestScope).
//
// This component wraps your app inside a <View> to facilitate
// re-rendering with a new key after each test case.
//
// store             - An instance of TestHookStore.
// suites            - An array of test suites.
// waitTime          - An integer representing the time in milliseconds that
//                     the testing framework should wait for the function
//                     findComponent() to return the 'hooked' component.
// clearAsyncStorage - A boolean to determine whether to clear AsyncStorage
//                     between each test. Defaults to `false`.
// testStartDelay    - Optional pause before test execution begins (ms)
// consoleLog        - Optional/tristate: determine level of console feedback
//                         false: no console.log statements
//                         true: some console.log statements
//                         'verbose': detailed console.log statements
// reporter          - Optional, boolean: generates XUNIT test report and sends
//                     results to a local server running on a Jenkins host.
// reporterParams    - Optional, object: defines reporter post URL, formatting, and provides
//                     unique device info for on-device unit testing
// reduxStore        - Optional, object: pass through a handle to the app
//                     redux store, exposing dispatchToStore and getCurrentStore
//                     to each test spec
// Example
//
//   import { Tester, TestHookStore } from 'cavy';
//   import GLOBAL from './app/helpers/globals.js';
//
//   if (GLOBAL.TEST_ENABLED) {
//     var testHookStore = new TestHookStore();
//     var testSuites = require('./specs/itSuites.js');
//     var testSuitesArray = [TestSuites.myFeatureSpec, TestSuites.myOtherFeatureSpec]
//   }
//
//   export default class AppWrapper extends React.Component {
//     // ....
//     render() {
//       if (GLOBAL.TEST_ENABLED) {
//         return (
//           <Provider store={store}>
//             <Tester
//               suites={testSuitesArray}
//               store={testHookStore}
//               waitTime={2000}
//               testStartDelay={1000}
//               consoleLog={true} // {false}, {true}, 'verbose'
//               reporter={true}
//               reduxStore={store}
//             >
//               <App />
//             </Tester>
//           </Provider>
//         );
//       } else {
//         return (<App />);
//       }
//     }
export default class Tester extends Component {
  getChildContext() {
    return {
      testHooks: this.testHookStore
    };
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      key: Math.random()
    };
    this.testHookStore = props.store;
  }

  componentDidMount() {
    this.runTests();
  }

  async runTests() {
    const {
      suites,
      waitTime,
      testStartDelay,
      consoleLog,
      reporter,
      reporterParams,
      reduxStore
    } = this.props;

    let testOptions = {
      waitTime: waitTime,
      testStartDelay: testStartDelay,
      consoleLog: consoleLog,
      reporter: reporter,
      reporterParams: reporterParams,
      reduxStore: reduxStore
    };

    scope = new TestScope(this, testOptions);

    for (var i = 0; i < suites.length; i++) {
      await suites[i](scope);
    }
    scope.run();
  }

  reRender() {
    this.setState({ key: Math.random() });
  }

  async clearAsync() {
    if (this.props.clearAsyncStorage) {
      try {
        await AsyncStorage.clear();
      } catch (e) {
        console.warn('[Cavy] failed to clear AsyncStorage:', e);
      }
    }
  }

  render() {
    return (
      <View key={this.state.key} style={{ flex: 1 }}>
        {Children.only(this.props.children)}
      </View>
    );
  }
}

Tester.propTypes = {
  store: PropTypes.instanceOf(TestHookStore),
  suites: PropTypes.arrayOf(PropTypes.func),
  waitTime: PropTypes.number,
  clearAsyncStorage: PropTypes.bool,
  testStartDelay: PropTypes.number,
  consoleLog: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  reporter: PropTypes.bool,
  reporterParams: PropTypes.object,
  reduxStore: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
};

Tester.childContextTypes = {
  testHooks: PropTypes.instanceOf(TestHookStore)
};

Tester.defaultProps = {
  waitTime: 2000,
  clearAsyncStorage: false,
  testStartDelay: false,
  consoleLog: true,
  reporter: false,
  reporterParams: null,
  reduxStore: false
};
