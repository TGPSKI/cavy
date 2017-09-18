# Cavy-suites

![Cavy logo](https://cloud.githubusercontent.com/assets/126989/22546798/6cf18938-e936-11e6-933f-da756b9ee7b8.png)

**Cavy-suites** is a cross-platform integration test framework for React Native, forked from Cavy (by [Pixie Labs](http://pixielabs.io)) with additions by [TGPSKI](https://github.com/tgpski). Cavy-suites adds additional functionality to Cavy, including test suites, configurable logging, test reporting, jenkins integration, and redux store support.

## Table of Contents
- [How does it work?](#how-does-it-work)
  - [Where does it fit in?](#where-does-it-fit-in)
  - [Cavy's components](#cavys-components)
- [Installation](#installation)
- [Basic usage](#basic-usage)
  - [Hook up components for testing](#hook-up-components-for-testing)
  - [Write your test cases](#write-your-test-cases)
  - [Set up your test wrapper](#set-up-your-test-wrapper)
  - [Apps that use native code](#apps-that-use-native-code)
- [Available spec helpers](#available-spec-helpers)
- [FAQs](#faqs)
- [Contributing](#contributing)

## How does it work?

Cavy (ab)uses React `ref` generating functions to give you the ability to refer
to, and simulate actions upon, deeply nested components within your
application. Unlike a tool like [enzyme](https://github.com/airbnb/enzyme)
which uses a simulated renderer, Cavy runs within your live application as it
is running on a host device (e.g. your Android or iOS simulator). 

This allows you to do far more accurate integration testing than if you run
your React app within a simulated rendering environment.

Cavy-suites introduces test suites to Cavy. The user creates low-level spec functions, like pressing a button in the nav bar, or inputting text in a form. Then the developer assembles specs into groups called suites. Each suite will run tests on a specific portion of the app, reusing as much spec code as possible, while enabling flexibility for tests.

Cavy-suites adds integration with redux, giving test specs access to `dispatch()` and `getState()` functions. Developers can create tests that compare the redux state to expected state after interacting with the app. Developers can also dispatch actions to the app reducer, allowing for integration with popular middlewares like [redux-form](https://github.com/erikras/redux-form).

### Where does it fit in?

We built Cavy because, at the time of writing, React Native had only a handful
of testing approaches available:

1. Unit testing components ([Jest](https://github.com/facebook/jest)).
2. Shallow-render testing components ([enzyme](https://github.com/airbnb/enzyme)).
3. Testing within your native environment, using native JS hooks ([Appium](http://appium.io/)).
4. Testing completely within your native environment ([XCTest](https://developer.apple.com/reference/xctest)).

Cavy fits in between shallow-render testing and testing within your native
environment.

### Cavy's components

Cavy provides 3 tools to let you run integration tests:

1. A store of 'test hooks'; key-value pairs between a string identifier and a
   component somewhere in your app component tree.
2. A set of helper functions to write spec files.
3. A `<Tester>` component you wrap around your entire app to make the test hook
   store available, and autorun your test cases on boot.

## Installation

To get started using Cavy-suites, install it using `yarn`:

    yarn add -D git://github.com/TGPSKI/cavy.git#tgpski-redux-form

or `npm`:

    npm i --save-dev git://github.com/TGPSKI/cavy.git#tgpski-redux-form

## Basic usage

Check out [the sample app](https://github.com/tgpski/cavy/tree/tgpski-redux-form/sample-app/EmployeeDirectory) for example usage. Here it is running:

![Sample app running](https://cloud.githubusercontent.com/assets/126989/22829358/193b5c0a-ef9a-11e6-994e-d4df852a6181.gif)

### Hook up components for testing

Add 'hooks' to any components you want to test by adding a `ref` and using the
`generateTestHook` function.

`generateTestHook` takes a string as its first argument - this is the identifier
to be used in tests. It takes an optional second argument in case you want to
set your own `ref` generating function.

Stateless functional components cannot be assigned a `ref` since they don't have
instances. Use the `wrap` function to wrap them inside a non-stateless component.

```javascript
import React, { Component } from 'react';
import { TextInput } from 'react-native';
import { FuncComponent } from 'somewhere';

import { hook, wrap } from 'cavy';

class Scene extends Component {
  render() {
    const WrappedComponent = wrap(FuncComponent);
    return (
      <View>
        <TextInput
          ref={this.props.generateTestHook('Scene.TextInput')}
          onChangeText={...}
        />
        <WrappedComponent
          ref={this.props.generateTestHook('Scene.Component')}
          onPress={...}
        />
      </View>      
    );
  }
}

const TestableScene = hook(Scene);
export default TestableScene;
```

### Write your test specs

Using your component identifiers, write your spec functions. We suggest saving
these in a `cavy` folder in your app's top level directory - i.e. `./cavy/itSpecs.js`.

```javascript
export function navigateToEmployeeList(spec) {
  spec.describe('Navigate from details to employee list', function() {
    spec.it('PASS', async function() {
      await spec.exists('NavBar.LeftButton');
      await spec.press('NavBar.LeftButton');
      await spec.pause(500);
    });
  }); 
}

export function inputSearchBar(spec, text) {
  let description = `Input ${text} to search bar`;
  spec.describe(description, function() {
    spec.it('PASS', async function() {
      await spec.exists('SearchBar.TextInput');
      await spec.fillIn('SearchBar.TextInput', text);
      await spec.pause(1000);
    });
  });
}

export function inputSearchBarClear(spec) {
  spec.describe('Input text to search bar clear', function() {
    spec.it('PASS', async function() {
      await spec.fillIn('SearchBar.TextInput', ' ');
      await spec.pause(1000);
    });
  });
}
```

[See below](#available-spec-helpers) for a list of currently available spec
helper functions.

### Write your test suites

Now, assemble your test suites with reusable  We suggest saving
these in a spec folder, naming them something like `./cavy/itSuites.js`.

```javascript
import * as itSpec from './itSpecs.js';

// TEST VARIABLES //

const TEST_EMPLOYEE = 'AnupGupta';
const SEARCH = 'Anup';
const TEST_EMPLOYEE2 = 'AmyTaylor';
const SEARCH2 = 'Amy';

// TEST SUITES //

export const filterEmployeeList = (spec) => {
  spec.suite('Verify Anup and search Amy', () => {
    itSpec.presenceEmployeeListItem(spec, TEST_EMPLOYEE);
    itSpec.presenceEmployeeListItem(spec, TEST_EMPLOYEE2);
    itSpec.inputSearchBar(spec, SEARCH2);
    itSpec.notPresenceEmployeeListItem(spec, TEST_EMPLOYEE);
    itSpec.presenceEmployeeListItem(spec, TEST_EMPLOYEE2);
    itSpec.inputSearchBar(spec, ' ');
  });
};
```

[See below](#available-spec-helpers) for a list of currently available spec
helper functions.

### Set up your test wrapper

Import `Tester`, `TestHookStore` and your specs in your top-level JS file
(typically this is your `index.{ios,android}.js` files), and instantiate a new
`TestHookStore`.

Wrap your app in a Tester component, passing in the `TestHookStore` and an array
containing your imported spec functions.

Optional props:

`waitTime`          - Integer, the time in milliseconds that your tests should
                      wait to find specified 'hooked' components.
                      Set to `2000` (2 seconds) by default.

`startDelay`        - Integer, the time in milliseconds before test execution
                      begins. Set to `0` by default.

`clearAsyncStorage` - Boolean, set this to `true` to clear AsyncStorage between
                      each test e.g. to remove a logged in user.
                      Set to `false` by default.

`consoleLog`        - Optional/tristate: determine level of console feedback
                      false: no console.log statements
                      true: some console.log statements
                      'verbose': detailed console.log statements
`reporter `         - Optional, boolean: generates XUNIT test report and sends
                     results to a local server running on a Jenkins host.
                      


```javascript
import React, { Component } from 'react';
import { Tester, TestHookStore } from 'cavy';
import { Provider } from 'react-redux';

import App from 'App/app';

import GLOBAL from 'Helpers/Globals';
import { setupStore } from 'Store/setup';

const store = setupStore();

if (GLOBAL.TEST_ENABLED) {
  var testHookStore = new TestHookStore();
  var TestSuites = require('specs/itSuites.js');
  console.ignoredYellowBox = [''];

  var testSuitesArray = [TestSuites.filterEmployeeList, TestSuites.tapAndEmail];

  var testHookStore = new TestHookStore();
}

export default class AppWrapper extends Component {
  render() {
    if (GLOBAL.TEST_ENABLED) {
      return (
        <Provider store={store}>
          <Tester
            suites={testSuitesArray}
            store={testHookStore}
            waitTime={4000}
            consoleLog={true}
            reporter={true}
            reRender={true}
            reduxStore={store}
          >
            <App />
          </Tester>
        </Provider>
      );
    } else {
      return (
        <Provider store={store}>
          <App />
        </Provider>
      );
    }
  }
}

```

**Congratulations! You are now all set up to start testing your app with Cavy.**

Your tests will run automatically when you run your app.

#### Apps that use native code

If you're not using [Create React Native App][crna], you'll need to register
your `AppWrapper` as the main entry point with `AppRegistry` instead of your
current `App` component:

```javascript
AppRegistry.registerComponent('AppWrapper', () => AppWrapper);
```

## Available spec helpers

`fillIn(identifier, str)` - fills in the identified 'TextInput'-compatible
component with the provided string (str). Your component must respond to the
property `onChangeText`.

`press(identifier)` - presses the identified component. Your component must
respond to the property `onPress`.

`pause(integer)` - pauses the running test for the length of time, specified in
milliseconds (integer). This is useful if you need to allow time for a response
to be received before progressing.

`exists(identifier)` - returns `true` if the component can be identified (i.e.
is currently on screen).

`notExists(identifier)` - as above, but checks for the absence of the
component.

`findComponent(identifier)` - returns the identified component. This function
should be used if your testable component does not respond to either
`onChangeText` or `onPress`, for example:

```javascript
picker = await spec.findComponent('Scene.modalPicker');
picker.open();
```

`dispatchToStore` 	- Function, exposes redux store dispatch method to test
						  specs and suites.

`getCurrentStore`	- Function, returns state of current redux store. 

## FAQs

#### How does Cavy compare to Appium? What is the benefit?

Cavy is a comparable tool to Appium. The key difference is that Appium uses
native hooks to access components (accessibility IDs), wheras Cavy uses React
Native refs. This means that Cavy sits directly within your React Native
environment (working identically with both Android and iOS builds), making it
easy to integrate into your application very quickly, without much
overhead.

#### What does this allow me to do that Jest does not?

Jest is a useful tool for unit testing individual React Native components,
whereas Cavy is an integration testing tool allowing you to run end-to-end user
interface tests.

#### How about supporting stateless components?

We'd love for Cavy to be better compatible with stateless functional components
and would be more than happy to see its reliance on refs replaced with something
better suited to the task...
What that looks like specifically, we're not 100% sure yet. We're very happy to
discuss possible alternatives!

## Contributing
Before contributing, please read the [code of conduct](CODE_OF_CONDUCT.md).
- Check out the latest master to make sure the feature hasn't been implemented
  or the bug hasn't been fixed yet.
- Check out the issue tracker to make sure someone already hasn't requested it
  and/or contributed it.
- Fork the project.
- Start a feature/bugfix branch.
- Commit and push until you are happy with your contribution.
- Please try not to mess with the package.json, version, or history. If you
  want to have your own version, or is otherwise necessary, that is fine, but
  please isolate to its own commit so we can cherry-pick around it.

[crna]: https://github.com/react-community/create-react-native-app
