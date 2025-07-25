import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  StyleSheet
} from 'react-native'
import ConversationDataView from './partials/patient-summary-view'
import {BaseImage} from 'components'
import {useEffect, useState, useCallback} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
import {Header} from 'components/header'
import {useRoute} from '@react-navigation/native'
import colors from 'theme'
import {hasObjectLength} from 'utils/condition'
import {Request} from 'utils/request'
import {SCREEN_WIDTH} from 'utils/size'
import {vibrate} from 'utils/vibrate'
import {goBack} from 'navigation'

interface ConversationItem {
  pk_question_id: string
  question_title: string
  type: string
  extracted_answer: any
  extracted_data: any
  sub_category?: string
  category: string
  question_validation: string
  is_required: number
  edit_disabled?: number
  pk_user_conversation_id?: number
}

interface RouteParams {
  category?: string
  title?: string
}

export const PatientDataEdit = () => {
  const params = useRoute().params as RouteParams
  const {conversationId} = useSelector((state: RootState) => state.common)
  const [data, setData] = useState<ConversationItem[]>([])

  const fetchInitialData = useCallback(() => {
    const onSuccess = (res: any) => {
      const conversationData: ConversationItem[] = res.data?.conversation || []
      setData([...conversationData]) // Set data immediately when we get the response
    }
    const requestData = {
      conversation_id: conversationId,
      is_edit_view: true,
      categories: [params?.category]
    }
    Request('conversation', 'POST', requestData, onSuccess, () => {})
  }, [conversationId, params?.category])

  const changeFieldValue = (item: ConversationItem) => {
    setData(prevData => {
      if (!Array.isArray(prevData)) {
        console.warn('prevData is not an array:', prevData)
        return prevData
      }

      return prevData.map(dataItem => {
        if (dataItem.pk_question_id === item.pk_question_id) {
          return {...dataItem, ...item}
        }
        return dataItem
      })
    })
  }
  useEffect(() => {
    fetchInitialData()
    return () => {}
  }, [fetchInitialData])

  const handleSubmit = () => {
    const onSuccess = (res: any) => {
      console.log('Data submitted successfully:', res)
      vibrate()
      goBack()
    }
    const onError = (err: any) => {
      console.error('Error submitting data:', err)
      // Handle error
    }

    const submitParams = {
      conversation_id: conversationId,
      preview_data: data
    }

    Request('editConversation', 'POST', submitParams, onSuccess, onError)
  }

  const props = {
    conversation: data, // Pass data as conversation since that's what the component expects
    changeFieldValue
  }
  return (
    <View className="flex-1 items-center justify-around bg-white">
      <BaseImage
        type="Image"
        className="h-full w-full absolute"
        style={{transform: [{scale: 1.2}]}}
        name="BG"
      />
      <Header
        showLines={false}
        showBack
        title={params?.title ?? 'Patient Demographic'}
      />
      <KeyboardAvoidingView
        contentContainerStyle={styles.container}
        style={{width: '100%', flex: 1, height: '100%'}}
        behavior="padding">
        <ScrollView style={{width: '100%'}} contentContainerClassName="pb-20">
          <ConversationDataView {...props} />
        </ScrollView>
      </KeyboardAvoidingView>
      {hasObjectLength(data) && (
        <View
          style={{width: SCREEN_WIDTH, height: 160}}
          className="bottom-1 absolute">
          <BaseImage
            style={{width: SCREEN_WIDTH, height: 160}}
            resizeMode="stretch"
            type="Image"
            name="bottom_tab"
          />
          <Text
            onPress={handleSubmit}
            style={{color: colors.primary}}
            className="absolute z-20 self-center text-lg bottom-5 font-semibold">
            Submit
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flex: 1,
    width: '100%',
    alignItems: 'center'
  }
})
