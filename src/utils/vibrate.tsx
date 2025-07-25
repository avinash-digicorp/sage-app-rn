import {Vibration} from 'react-native'

export const vibrate = () => {
  const duration = 20
  Vibration.vibrate(duration)
}
