import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Platform,
  Modal
} from 'react-native'
import {useState} from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType
} from 'react-native-image-picker'
import {BASE_URL, Request} from '../../../../apiRequest'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
import {BaseButton, BaseInput} from 'components'
import BaseDatePicker from 'components/base/base-date-picker/base-date-picker'
import colors from 'theme'

const InsuranceView = (props: any) => {
  const {categories, conversationId} = useSelector(
    (state: RootState) => state.common
  )
  const {category, insuranceData} = props
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  console.log('insuranceData', insuranceData)
  const isEditable = false
  // Form fields
  const [insurancePlanName, setInsurancePlanName] = useState('')
  const [memberId, setMemberId] = useState('')
  const [groupNumber, setGroupNumber] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)

  const currentCategory = categories?.find(cat => cat.id === category)
  if (currentCategory?.category !== 'Insurance Detail') return null

  const showImagePicker = (type: 'front' | 'back') => {
    Alert.alert('Select Image', 'Choose how you want to select the image', [
      {
        text: 'Camera',
        onPress: () => openCamera(type)
      },
      {
        text: 'Gallery',
        onPress: () => openGallery(type)
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ])
  }

  const openCamera = (type: 'front' | 'back') => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as any,
      maxWidth: 1000,
      maxHeight: 1000
    }

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled camera picker')
        return
      }

      if (response.errorMessage) {
        console.error('Camera Error: ', response.errorMessage)
        return
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri
        if (type === 'front') {
          setFrontImage(imageUri || null)
        } else {
          setBackImage(imageUri || null)
        }
      }
    })
  }

  const openGallery = (type: 'front' | 'back') => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as any,
      maxWidth: 1000,
      maxHeight: 1000
    }

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled gallery picker')
        return
      }

      if (response.errorMessage) {
        console.error('Gallery Error: ', response.errorMessage)
        return
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri
        if (type === 'front') {
          setFrontImage(imageUri || null)
        } else {
          setBackImage(imageUri || null)
        }
      }
    })
  }

  const submit = async () => {
    try {
      if (!frontImage || !backImage) {
        Alert.alert(
          'Error',
          'Please select both front and back images of your insurance'
        )
        return
      }

      if (!insurancePlanName.trim()) {
        Alert.alert('Error', 'Please enter the insurance plan name')
        return
      }

      if (!memberId.trim()) {
        Alert.alert('Error', 'Please enter the member ID')
        return
      }

      setIsSubmitting(true)

      const formData = new FormData()

      formData.append('conversation_id', conversationId)
      // formData.append('categories', '["29"]')
      formData.append('insurance_plan_name', insurancePlanName)
      formData.append('member_id', memberId)
      groupNumber && formData.append('group_number', groupNumber)
      startDate &&
        formData.append('start_date', startDate.toISOString().split('T')[0])
      endDate &&
        formData.append('end_date', endDate.toISOString().split('T')[0])

      // Add front image
      formData.append('insurance_card_1', {
        uri: frontImage,
        type: 'image/jpeg',
        name: 'insurance_front.jpg'
      } as any)

      // Add back image
      formData.append('insurance_card_2', {
        uri: backImage,
        type: 'image/jpeg',
        name: 'insurance_back.jpg'
      } as any)

      const onSuccess = (response: any) => {
        setIsSubmitting(false)
        console.log('Upload success:', response)
      }

      const onError = (error: string) => {
        setIsSubmitting(false)
        console.error('Upload error:', error)
      }

      // Call the API
      await fetch(`${BASE_URL}store-openemr`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json'
        }
      })
        .then(response => response.json())
        .then(onSuccess)
        .catch(onError)
    } catch (error) {
      console.log('Submission error:', error)
    }
  }

  const canSubmit =
    frontImage && backImage && insurancePlanName.trim() && memberId.trim()

  return (
    <View
      style={styles.container}
      className="flex-1 p-4 bg-white rounded-md mt-2 mb-12 mx-3">
      <BaseInput
        label="Insurance Plan Name"
        value={insurancePlanName}
        onChangeText={setInsurancePlanName}
      />
      <BaseInput
        label="Member ID"
        value={memberId}
        onChangeText={setMemberId}
      />
      <BaseInput
        label="Group Number (Optional)"
        value={groupNumber}
        onChangeText={setGroupNumber}
      />
      <BaseDatePicker
        label="Start Date (Optional)"
        value={startDate}
        setValue={setStartDate}
      />

      <BaseDatePicker
        label="End Date (Optional)"
        value={endDate}
        setValue={setEndDate}
      />

      <Text style={styles.label}>{'Insurance Card'}</Text>
      <View style={styles.imagePickersContainer}>
        <TouchableOpacity
          style={styles.squareImagePicker}
          onPress={() => showImagePicker('front')}>
          {frontImage ? (
            <>
              <Image
                source={{uri: frontImage}}
                style={styles.squareSelectedImage}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setFrontImage(null)}>
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.squarePlaceholderContainer}>
              <Text style={styles.squarePlaceholderText}>Front</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.squareImagePicker}
          onPress={() => showImagePicker('back')}>
          {backImage ? (
            <>
              <Image
                source={{uri: backImage}}
                style={styles.squareSelectedImage}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setBackImage(null)}>
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.squarePlaceholderContainer}>
              <Text style={styles.squarePlaceholderText}>Back</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <BaseButton
        title="Save"
        onPress={submit}
        disabled={!canSubmit}
        loading={isSubmitting}
      />
      {/* Date Pickers */}
      {Platform.OS === 'ios' ? (
        <>
          {/* iOS Modal for Start Date */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showStartDatePicker}
            onRequestClose={() => setShowStartDatePicker(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(false)}>
                    <Text style={styles.modalButton}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select Start Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(false)}>
                    <Text style={styles.modalButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(_event: any, selectedDate?: Date) => {
                    if (selectedDate) {
                      setStartDate(selectedDate)
                    }
                  }}
                />
              </View>
            </View>
          </Modal>

          {/* iOS Modal for End Date */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showEndDatePicker}
            onRequestClose={() => setShowEndDatePicker(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                    <Text style={styles.modalButton}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select End Date</Text>
                  <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                    <Text style={styles.modalButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(_event: any, selectedDate?: Date) => {
                    if (selectedDate) {
                      setEndDate(selectedDate)
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <>
          {/* Android Native Picker */}
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={(_event: any, selectedDate?: Date) => {
                setShowStartDatePicker(false)
                if (selectedDate) {
                  setStartDate(selectedDate)
                }
              }}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={(_event: any, selectedDate?: Date) => {
                setShowEndDatePicker(false)
                if (selectedDate) {
                  setEndDate(selectedDate)
                }
              }}
            />
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {fontSize: 16, marginBottom: 8, fontWeight: '500', color: '#333'},
  container: {
    width: '95%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 10
  },
  imagePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  squareImagePicker: {
    aspectRatio: 1,
    width: 176,
    height: 176,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative'
  },
  squareSelectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  squarePlaceholderContainer: {
    flex: 1,
    backgroundColor: colors.gray3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12
  },
  squarePlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center'
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  modalButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600'
  }
})

export default InsuranceView
