import {ScrollView, View} from 'react-native'
import ConversationDataView from './partials/patient-summary-view'
import InsuranceView from './partials/insurance-view'
import RadiologyView from './partials/radiology-view'
import {BaseImage} from 'components'
import {useEffect, useState} from 'react'
import {Request} from 'utils/request'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'store'
import {setCategories} from 'store/common/slice'
import {Categories} from './partials/categories'
import {Header} from 'components/header'
import {useNavigation} from '@react-navigation/native'
import {routes} from 'navigation'

export const PatientSummary = () => {
  const {conversationId, categories} = useSelector(
    (state: RootState) => state.common
  )
  const dispatch = useDispatch()
  const navigate = useNavigation()
  const [category, setCategory] = useState(0)
  const [xrayImages, setXrayImages] = useState(null)
  const [assetPath, setAssetPath] = useState('')
  const [insuranceData, setInsuranceData] = useState(null)
  const [conversation, setConversation] = useState([])
  const fetchCategories = () => {
    const onSuccess = res => {
      if (res.data?.categoryList) {
        dispatch(setCategories(res.data?.categoryList || []))
        setCategory(res.data?.categoryList[0]?.id)
      }
    }
    Request('metadata', 'GET', {}, onSuccess, () => {})
  }
  useEffect(() => {
    if (!conversationId) return
    fetchConversation(category)
    return () => {}
  }, [category])
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchConversation = (id: any) => {
    if (!id) return
    const onSuccess = res => {
      setConversation([...res.data?.conversation])
      if (res.data?.xrayImages) {
        setXrayImages(res.data?.xrayImages)
      }
      if (res.data?.insuranceData) {
        setInsuranceData(res.data?.insuranceData)
      }
      if (res.data?.S3_SAGE_URL) {
        setAssetPath(res.data?.S3_SAGE_URL)
      }
    }
    const categoryIds = [id]
    if (id === 29) {
      categoryIds.push(1)
    }
    const params = {conversation_id: conversationId, categories: categoryIds}
    Request('conversation', 'POST', params, onSuccess, () => {})
  }
  const props = {
    category,
    setCategory,
    conversation
  }
  const currentCategory = categories?.find(cat => cat.id === category)
  const onPressEdit = () => {
    navigate.navigate(routes.PATIENT_DATA_EDIT, {
      title: currentCategory?.category ?? 'Patient Demographic',
      conversation
    })
  }
  const showEdit =
    currentCategory?.category !== 'Insurance Detail' &&
    currentCategory?.category !== 'Radiology'
  return (
    <View className="flex-1 items-center justify-around bg-white">
      <BaseImage
        type="Image"
        className="h-full w-full absolute"
        style={{transform: [{scale: 1.2}]}}
        name="BG"
      />
      <Header
        onPressEdit={onPressEdit}
        title={'Patient Summary'}
        showLines={false}
        showEdit={showEdit}
      />
      <Categories {...props} />
      <ScrollView className="mt-20 w-full">
        <ConversationDataView {...props} />
        <RadiologyView
          {...props}
          assetPath={assetPath}
          xrayImages={xrayImages}
        />
        <InsuranceView
          {...props}
          assetPath={assetPath}
          insuranceData={insuranceData}
        />
      </ScrollView>
    </View>
  )
}
