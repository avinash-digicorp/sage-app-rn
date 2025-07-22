import {DefaultTheme, NavigationContainer} from '@react-navigation/native'
import {navigationRef} from './navigation-action'
import {CommonNavigator} from './navigators'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import colors from 'theme'
import {routes} from './navigation-routes'

const Stack = createNativeStackNavigator()
const MainApp = () => {
  return (
    <Stack.Navigator
      initialRouteName={routes.LOGIN}
      screenOptions={{headerShown: false}}>
      {CommonNavigator}
    </Stack.Navigator>
  )
}
export const ApplicationNavigator = () => {
  const theme = {
    ...DefaultTheme,
    colors: {...DefaultTheme.colors, background: colors.white}
  }

  return (
    <NavigationContainer theme={theme} ref={navigationRef}>
      <MainApp />
    </NavigationContainer>
  )
}
