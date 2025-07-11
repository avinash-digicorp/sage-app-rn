import {View} from 'react-native'
import {BaseButton, BaseImage, BaseInput, Text} from 'components'
import {useNavigation} from '@react-navigation/native'
import {routes} from 'navigation'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  setConversationId,
  setInitialParams,
  setMessages,
  setUserData
} from 'store/common/slice'
import {RootState} from 'store'

const Login = () => {
  const dispatch = useDispatch()
  const {conversationId} = useSelector((state: RootState) => state.common)
  const navigation = useNavigation()
  const [value, setValue] = useState(conversationId)
  const login = () => {
    if (value !== conversationId) {
      dispatch(setConversationId(value))
      dispatch(setUserData(null))
      dispatch(setInitialParams(null))
      dispatch(setMessages([]))
    } else {
    }
    navigation.navigate(routes.WELCOME)
  }
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <BaseImage type="Image" className="w-full h-full absolute" name="BG" />
      <Text className="font-bold text-2xl text-gray-700" text="Login" />
      <BaseInput value={value} label="Email" onChangeText={setValue} />
      <BaseButton title="Login" onPress={login} />
    </View>
  )
}

export default Login
