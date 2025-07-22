import {View, Text as RNText} from 'react-native'
import {BaseImage, ButtonView, Header, Text} from 'components'
import {useNavigation} from '@react-navigation/native'
import {routes} from 'navigation'
import {NurseView} from 'components/common'
import Tts from 'react-native-tts'
import {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'store'
import {setInitialParams, setMessages, setUserData} from 'store/common/slice'
import {Request} from 'utils/request'
interface Message {
  role: 'user' | 'system'
  message: string
}
const Welcome = () => {
  const dispatch = useDispatch()
  const {conversationId} = useSelector((state: RootState) => state.common)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    Tts.setDefaultLanguage('en-US')
    Tts.setDefaultPitch(1.0)
    Tts.addEventListener('tts-start', () => setIsSpeaking(true))
    Tts.addEventListener('tts-finish', () => setIsSpeaking(false))
    Tts.addEventListener('tts-cancel', () => setIsSpeaking(false))
    return () => {
      Tts.removeAllListeners('tts-start')
      Tts.removeAllListeners('tts-finish')
      Tts.removeAllListeners('tts-cancel')
    }
  }, [])
  useEffect(() => {
    fetchQuestionList()
    return () => {}
  }, [])

  const fetchQuestionList = () => {
    const onSuccess = res => {
      dispatch(setInitialParams(res.data?.question))
      dispatch(setUserData(res.data?.user_data))
      if (res.data?.question_intro) {
        Tts.speak(res.data?.question_intro)
        setMessage(res.data?.question_intro)
      }
      if (res.data?.question?.question) {
        setTimeout(() => {
          dispatch(
            setMessages([
              {role: 'system', message: res.data?.question?.question}
            ])
          )
        }, 2000)
      }
    }
    Request('questions', 'GET', {}, onSuccess, () => {})
  }

  const navigation = useNavigation()
  const start = () => {
    Tts.stop()
    navigation.navigate(routes.CHAT)
  }

  // Function to render text with blue brackets
  const renderMessageWithBlueText = (text: string) => {
    if (!text) return null

    const parts = text.split(/(\[.*?\])/)

    return (
      <RNText className="text-center text-gray-700 font-bold text-xl">
        {parts.map((part, index) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            // Remove brackets and make text blue
            const textWithoutBrackets = part.slice(1, -1)
            return (
              <RNText key={index} style={{color: '#3B82F6'}}>
                {textWithoutBrackets}
              </RNText>
            )
          }
          return part
        })}
      </RNText>
    )
  }
  return (
    <View className="flex-1 items-center bg-white">
      <BaseImage type="Image" className="h-full w-full absolute" style={{transform:[{scale:1.2}]}} name="BG" />
      <Header title="Meet Sage! Your Personal AI MA"  />
      <NurseView />
      <View className="w-full max-h-80 items-center py-8 px-8">
        {renderMessageWithBlueText(message)}
      </View>
      <ButtonView onPress={start} className="rounded-full mt-12 overflow-hidden">
        <BaseImage name="wave_animated" style={{width: 80, height: 80}} />
        <Text
          text="Start"
          className="absolute text-white self-center font-bold text-xl top-8"
        />
      </ButtonView>
    </View>
  )
}

export default Welcome
