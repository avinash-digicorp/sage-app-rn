import {SafeAreaProvider} from 'react-native-safe-area-context'
import {LogBox, StatusBar} from 'react-native'
import {ApplicationNavigator} from 'navigation'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {Provider} from 'react-redux'
import {persistor, store} from './store'
import {PersistGate} from 'redux-persist/integration/react'
import './theme/global.css'

/**
 * Sage Medical AI
 * Main app
 * @format
 * @flow
 */
if (__DEV__) {
  import('../ReactotronConfig').then(() => console.log('Reactotron Configured'))
}
console.warn = () => {}
LogBox.ignoreLogs(['Warning: ...'])
LogBox.ignoreAllLogs()

// configureExceptionHandler()

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <StatusBar
              translucent={true}
              hidden={false}
              showHideTransition={'fade'}
              barStyle="dark-content"
              backgroundColor={'transparent'}
            />
            <ApplicationNavigator />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
