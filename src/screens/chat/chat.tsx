import {Alert, FlatList, StyleSheet, View} from 'react-native'
import {AssetSvg, BaseImage, ButtonView, Text} from 'components'
import Tts from 'react-native-tts'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'store'
import {
  setInitialParams,
  updateMessages,
  setUserData,
  setMessages,
  setLastInitialParams
} from 'store/common/slice'
import {Request} from 'utils/request'
import Voice from '@react-native-voice/voice'
import {getInitials} from 'utils/helper'
import colors from 'theme'
import {Header} from 'components/header'
import {SCREEN_HEIGHT, SCREEN_WIDTH} from 'utils/size'
import {resetNavigation, routes} from 'navigation'
import {vibrate} from 'utils/vibrate'
import {hasObjectLength} from 'utils/condition'

// Define message type for better type checking
interface Message {
  role: string
  message: string
}

const Chat = () => {
  const scrollRef = useRef<FlatList<Message>>(null)
  const submitAnswerRef = useRef<((answer: string) => void) | null>(null)
  const retryCountRef = useRef<number>(0) // Track consecutive retries

  const dispatch = useDispatch()
  const {messages, lastInitialParams, userData, conversationId, initialParams} =
    useSelector((state: RootState) => state.common)
  const initials = getInitials(conversationId)
  const [_isSpeaking, setIsSpeaking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isAsking, setIsAsking] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')

  const scrollToLastMessage = useCallback(() => {
    if (scrollRef.current && messages.length > 0) {
      setTimeout(() => {
        try {
          scrollRef.current?.scrollToIndex({
            index: messages.length - 1,
            animated: true,
            viewPosition: 0.8
          })
        } catch (error) {
          setTimeout(() => {
            scrollRef.current?.scrollToEnd({animated: true})
          }, 50)
        }
      }, 150)
    }
  }, [messages.length])

  const startSpeech = async () => {
    if (_isSpeaking) return
    if (isListening) return
    await Voice.start('en-US')
    console.log('Voice Started')
  }
  const speechToText = async src => {
    try {
      if (isListening) {
        await Voice.destroy()
        setIsListening(false)
      } else {
        // Reset retry counter when manually starting speech recognition
        retryCountRef.current = 0
        setRecognizedText('')
        if (!_isSpeaking) {
          setIsListening(true)
          await startSpeech()
        }
      }
    } catch (error) {
      console.error('Voice start error:', error)
      Alert.alert('Error', 'Failed to start speech recognition')
      setIsListening(false)
    }
  }
  useEffect(() => {
    Tts.setDefaultLanguage('en-US')
    Tts.setDefaultPitch(1.0)
    Tts.addEventListener('tts-finish', () => {
      setIsSpeaking(false)
      if (isAsking) {
        setIsAsking(false)
      }
      if (initialParams?.next_question_id === 0) {
        setTimeout(() => {
          resetNavigation(routes.PATIENT_SUMMARY)
          vibrate()
        }, 3000)
        return
      }
      speechToText(3)
    })
    return () => {
      Tts.removeAllListeners('tts-finish')
    }
  }, [])

  useEffect(() => {
    Voice.onSpeechEnd = () => {
      setIsListening(false)
    }
    Voice.onSpeechRecognized = event => {
      console.log('Speech recognized:', event)
    }
    Voice.onSpeechResults = event => {
      if (event.value && event.value.length > 0) {
        retryCountRef.current = 0
        setRecognizedText(event.value[0])
        if (submitAnswerRef.current) {
          submitAnswerRef.current(event.value[0])
        }
      }
    }
    Voice.onSpeechError = error => {
      console.log('Speech recognition error:', error.error?.code)
      setIsListening(false)
      if (error.error?.code == '11' || error.error?.code == '7') {
        retryCountRef.current += 1

        if (retryCountRef.current <= 5) {
          setRecognizedText(`Retry attempt ${retryCountRef.current} of 5...`)

          speechToText(8)
        } else {
          // Reset counter and show message that we've stopped retrying
          retryCountRef.current = 0
          setRecognizedText(
            'Too many recognition errors. Please try again manually.'
          )
        }
      }
    }
    return () => {
      Voice.destroy().then(Voice.removeAllListeners)
    }
  }, [])

  useEffect(() => {
    if (hasObjectLength(lastInitialParams)) {
      setIsAsking(true)
      setIsSpeaking(true)
      Tts.speak(lastInitialParams?.question)
      return
    }
    if (messages[0]) {
      setIsAsking(true)
      setIsSpeaking(true)
      Tts.speak(messages[0].message)
    }
  }, [])
  function getPrompt(prompt: string, question: string, answer: string): string {
    return prompt.replace('{question}', question).replace('{answer}', answer)
  }
  const submitAnswer = useCallback(
    (answer: string) => {
      if (submitting) return
      if (!initialParams) return
      const prompt = getPrompt(
        initialParams.question_prompt || '',
        initialParams.question || '',
        answer
      )
      const params = {
        ...initialParams,
        user_data: userData,
        conversation_id: conversationId,
        response: answer,
        prompt,
        is_third_try: 0
      }
      dispatch(updateMessages({role: 'user', message: answer}))
      scrollToLastMessage()
      const onSuccess = (res: any) => {
        Voice.destroy()
        setIsListening(false)
        if (res.data.valid_answer) {
          dispatch(setInitialParams(res.data?.next_question_data))
          dispatch(setUserData(res.data?.user_data))
          const newQuestion = res.data?.next_question_data?.question
          if (res.data?.next_question_data?.section_conclusion_data) {
            setTimeout(() => {
              dispatch(setMessages([{role: 'system', message: newQuestion}]))
            }, 2000)
            resetNavigation(routes.WELCOME, {
              message: res.data?.next_question_data?.section_conclusion_data
            })
            return
          }
          dispatch(updateMessages({role: 'system', message: newQuestion}))
          scrollToLastMessage()

          setIsAsking(true)
          setIsSpeaking(true)
          Tts.speak(newQuestion)
        } else {
          dispatch(setUserData(res?.data?.user_data))
          dispatch(
            updateMessages({role: 'system', message: res.data?.explanation})
          )
          scrollToLastMessage()
          setIsAsking(true)
          setIsSpeaking(true)
          Tts.speak(res.data?.explanation)
        }
      }
      Request('call-openai', 'POST', params, onSuccess, e => {
        console.log('Error:', e)
        setSubmitting(false)
      })
    },
    [
      initialParams,
      userData,
      conversationId,
      dispatch,
      scrollToLastMessage,
      submitting
    ]
  )

  useEffect(() => {
    submitAnswerRef.current = submitAnswer
  }, [submitAnswer])

  const save = () => {
    dispatch(setLastInitialParams(initialParams))
  }
  const discard = () => {
    resetNavigation(routes.WELCOME)
  }
  return (
    <View style={styles.mainView} className="items-center bg-white">
      <BaseImage
        type="Image"
        className="h-full w-full absolute"
        style={{transform: [{scale: 1.2}]}}
        name="BG"
      />
      <Header title={initialParams.category ?? 'Patient Demographic'} />
      <View style={styles.main}>
        <FlatList
          ref={scrollRef}
          data={messages}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyExtractor={(_, index) => `message-${index}`}
          getItemLayout={(data, index) => ({
            length: 80,
            offset: 80 * index,
            index
          })}
          onContentSizeChange={() => {
            scrollToLastMessage()
          }}
          onScrollToIndexFailed={info => {
            setTimeout(() => {
              scrollRef.current?.scrollToEnd({animated: true})
            }, 100)
          }}
          renderItem={({item}) => {
            const isSystem = item?.role === 'system'
            return (
              <View style={styles.messageRow}>
                {isSystem ? (
                  <View style={styles.leftMessage}>
                    <BaseImage name="nurse" style={styles.avatar} />
                    <View style={styles.leftBubble}>
                      <Text style={styles.messageText}>{item.message}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.rightMessage}>
                    <View style={styles.rightBubble}>
                      <Text style={styles.rightMessageText}>
                        {item.message}
                      </Text>
                    </View>
                    <View style={styles.userAvatar}>
                      <Text text={initials} style={styles.initialsText} />
                    </View>
                  </View>
                )}
              </View>
            )
          }}
        />
      </View>
      <View style={styles.bottom}>
        <Text
          text={
            !isListening
              ? recognizedText
                ? recognizedText
                : ' '
              : 'Listening...'
          }
          className="z-50 self-center font-bold text-gray-600 text-lg absolute bottom-32"
        />
      </View>
      <View
        style={{width: SCREEN_WIDTH, height: 140}}
        className="bottom-1 absolute">
        <BaseImage
          style={{width: SCREEN_WIDTH, height: 140}}
          resizeMode="stretch"
          type="Image"
          name="bottom_tab"
        />
        <View className="w-9/12 self-center flex-row justify-between items-center absolute z-20 bottom-10 px-4">
          <AssetSvg name="save" buttonViewProps={{onPress: save}} />
          <AssetSvg name="cross" buttonViewProps={{onPress: discard}} />
        </View>
      </View>
      <ButtonView
        onPress={() => speechToText(2)}
        className="z-50 rounded-full mb-2 overflow-hidden absolute bottom-44 self-center">
        <BaseImage name={'wave_animated'} style={{width: 80, height: 80}} />
      </ButtonView>
    </View>
  )
}

const styles = StyleSheet.create({
  main: {height: SCREEN_HEIGHT * 0.7},
  bottom: {height: SCREEN_HEIGHT * 0.3},
  mainView: {height: SCREEN_HEIGHT},
  list: {
    height: SCREEN_HEIGHT * 0.7,
    width: '100%',
    paddingHorizontal: 0
  },
  listContent: {
    paddingBottom: 60
  },
  messageRow: {
    width: '100%',
    marginBottom: 16
  },
  leftMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  rightMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end'
  },
  avatar: {
    width: 40,
    height: 40,
    marginRight: 8
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  leftBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    maxWidth: '80%'
  },
  rightBubble: {
    backgroundColor: '#C1E4F8',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderTopRightRadius: 4,
    maxWidth: '75%'
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20
  },
  rightMessageText: {
    fontSize: 16,
    color: colors.gray9,
    lineHeight: 20
  },
  initialsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666'
  }
})

export default Chat
