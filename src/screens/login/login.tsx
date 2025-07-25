import {KeyboardAvoidingView, StyleSheet, View} from 'react-native'
import {AssetSvg, BaseImage, BaseInput, ButtonView, Text} from 'components'
import {useNavigation} from '@react-navigation/native'
import {resetNavigation, routes} from 'navigation'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  setConversationId,
  setInitialParams,
  setMessages,
  setPassword as setPass,
  setUserData
} from 'store/common/slice'
import {RootState} from 'store'
import {NurseView} from 'components/common'
import {Header} from 'components/header'
import LinearGradient from 'react-native-linear-gradient'
import {hasObjectLength, hasTextLength} from 'utils/condition'

const Login = () => {
  const dispatch = useDispatch()
  const {
    conversationId,
    lastInitialParams,
    password: pass
  } = useSelector((state: RootState) => state.common)
  const navigation = useNavigation()
  const [patientId, setPatientId] = useState(conversationId ?? '')
  const [password, setPassword] = useState(pass ?? '')
  const [patientIdError, setPatientIdError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handlePatientIdChange = (value: string) => {
    setPatientId(value)
    if (patientIdError) {
      setPatientIdError('')
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (passwordError) {
      setPasswordError('')
    }
  }

  const validateForm = () => {
    let isValid = true

    // Reset errors
    setPatientIdError('')
    setPasswordError('')

    // Validate patient ID
    if (!hasTextLength(patientId) || !patientId.trim()) {
      setPatientIdError('Patient ID is required')
      isValid = false
    }

    // Validate password
    if (!hasTextLength(password) || !password.trim()) {
      setPasswordError('Password is required')
      isValid = false
    }

    return isValid
  }

  const login = () => {
    if (!validateForm()) {
      return
    }

    if (patientId !== conversationId) {
      dispatch(setConversationId(patientId))
      dispatch(setPass(password))
      dispatch(setUserData(null))
      dispatch(setInitialParams(null))
      dispatch(setMessages([]))
    } else {
      if (hasObjectLength(lastInitialParams)) {
        setInitialParams(lastInitialParams)
        resetNavigation(routes.CHAT)
        return
      }
    }
    navigation.navigate(routes.WELCOME)
  }
  return (
    <View className="flex-1 items-center bg-white">
      <BaseImage
        type="Image"
        className="h-full w-full absolute"
        style={{transform: [{scale: 1.2}]}}
        name="BG"
      />
      <KeyboardAvoidingView
        contentContainerStyle={{width: '100%', alignItems: 'center'}}
        style={{width: '100%'}}
        behavior="position">
        <Header title="Welcome to Gentle Hearts Family Clinic!" />
        <NurseView style={{marginTop: 20, marginBottom: 40}} />
        <View
          style={styles.card}
          className="w-11/12 px-4 bg-white rounded-3xl pt-8 pb-4 items-center justify-center border border-gray-200">
          <Text
            className="font-bold text-2xl text-gray-700 mb-10"
            text="Login to Get Started"
          />
          <BaseInput
            value={patientId}
            label="Patient id"
            onChangeText={handlePatientIdChange}
            errorText={patientIdError}
          />
          <BaseInput
            value={password}
            label="Password"
            secureTextEntry
            onChangeText={handlePasswordChange}
            errorText={passwordError}
          />
        </View>
      </KeyboardAvoidingView>
      <ButtonView style={styles.button} onPress={login}>
        <LinearGradient
          colors={['#1988C5', '#28DDCA']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.gradientBackground}>
          <AssetSvg name="login" size={35} color="white" />
        </LinearGradient>
      </ButtonView>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: 30,
    height: 80,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    overflow: 'hidden'
  },
  card: {
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
export default Login
