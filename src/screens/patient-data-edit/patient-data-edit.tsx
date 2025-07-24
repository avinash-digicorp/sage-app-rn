import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  StyleSheet
} from 'react-native'
import ConversationDataView from './partials/patient-summary-view'
import {BaseImage} from 'components'
import {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
import {Header} from 'components/header'
import {useRoute} from '@react-navigation/native'
import colors from 'theme'
import {hasObjectLength} from 'utils/condition'
import {Request} from 'utils/request'

export const PatientDataEdit = () => {
  const params = useRoute().params
  const {conversationId} = useSelector((state: RootState) => state.common)
  const [category, setCategory] = useState(0)
  const conversation = params?.conversation ?? {}
  const [data, setData] = useState({})

  const setValue = (pk_question_id: string, value: any) => {
    setData(prevData => ({
      ...prevData,
      [pk_question_id]: value
    }))
  }
  const fetchInitialData = () => {
    const onSuccess = res => {
      console.log('res.data?.conversation', res)

      // setConversation([...res.data?.conversation])
    }
    const categoryIds = [category]
    const data = {
      conversation_id: conversationId,
      is_edit_view: true,
      categories: [params?.category]
    }
    Request('conversation', 'POST', data, onSuccess, () => {})
  }
  useEffect(() => {
    fetchInitialData()
    const initialData = conversation ?? {}
    setData(initialData)

    return () => {}
  }, [])

  const handleSubmit = () => {
    const onSuccess = (res: any) => {
      console.log('Data submitted successfully:', res)
      // Handle success (e.g., show toast, navigate back, etc.)
    }
    const onError = (err: any) => {
      console.error('Error submitting data:', err)
      // Handle error
    }

    const submitParams = {
      conversation_id: conversationId,
      preview_data: [
        {
          pk_question_id: 3,
          edit_disabled: 0,
          pk_user_conversation_id: 10143,
          question_title: 'Last Name',
          type: 'textfield',
          extracted_answer: 'Smith',
          extracted_data: 'Smith',
          sub_category: null,
          category: 'Patient Demographic',
          question_validation: '',
          is_required: 0
        }
      ]
    }

    Request('editConversation', 'POST', submitParams, onSuccess, onError)
  }

  const props = {
    category,
    setCategory,
    conversation,
    data,
    setValue
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
          {hasObjectLength(data) && (
            <View className="w-full bottom-1 absolute">
              <BaseImage type="Image" className="w-full " name="bottom_tab" />
              <Text
                onPress={handleSubmit}
                style={{color: colors.primary}}
                className="absolute z-20 self-center text-lg bottom-3 font-semibold">
                Submit
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
