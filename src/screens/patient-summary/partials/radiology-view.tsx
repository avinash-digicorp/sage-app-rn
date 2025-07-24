import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  FlatList
} from 'react-native'
import {useEffect, useState} from 'react'
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType
} from 'react-native-image-picker'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
import {BaseButton} from 'components'
import {BASE_URL} from 'config'
import {hasLength} from 'utils/condition'
import {Request} from 'utils/request'

interface RadioImage {
  id: string
  uri: string
  name: string
}

const RadiologyView = (props: any) => {
  const {categories, conversationId} = useSelector(
    (state: RootState) => state.common
  )
  const {category, assetPath} = props
  const [images, setImages] = useState<RadioImage[]>([])
  const [updatingImages, setUpdatingImages] = useState(false)
  const [xrays, setXrays] = useState<string[]>(props.xrayImages?.images || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => {
    setXrays(props?.xrayImages?.images)
    return () => {}
  }, [props.xrayImages?.images])

  const currentCategory = categories?.find(cat => cat.id === category)
  if (currentCategory?.category !== 'Radiology') return null
  const mainList = [
    ...(hasLength(images) ? images.map(img => ({...img, type: 'local'})) : []),
    ...(hasLength(xrays)
      ? xrays.map(item => ({
          uri: `${assetPath}/${item}`,
          type: 'image',
          id: item
        }))
      : []),
    {type: 'add-button'}
  ]

  const showImagePicker = () => {
    if (images.length >= 10) {
      Alert.alert('Limit Reached', 'You can only add up to 10 Radiology images')
      return
    }

    Alert.alert('Add Radiology Image', 'Choose how you want to add the image', [
      {text: 'Camera', onPress: openCamera},
      {text: 'Gallery', onPress: openGallery},
      {text: 'Cancel', style: 'cancel'}
    ])
  }

  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as any,
      maxWidth: 1000,
      maxHeight: 1000
    }

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) return

      if (response.errorMessage) {
        Alert.alert('Camera Error', response.errorMessage)
        return
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0]
        const newImage: RadioImage = {
          id: Date.now().toString(),
          uri: asset.uri || '',
          name: asset.fileName || `radiology_${Date.now()}.jpg`
        }
        setImages(prev => [...prev, newImage])
      }
    })
  }

  const openGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as any,
      maxWidth: 1000,
      maxHeight: 1000
    }

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) return

      if (response.errorMessage) {
        Alert.alert('Gallery Error', response.errorMessage)
        return
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0]
        const newImage: RadioImage = {
          id: Date.now().toString(),
          ...asset,
          path: asset.uri,
          name: asset.fileName || `radiology_${Date.now()}.jpg`
        }
        setImages(prev => [...prev, newImage])
      }
    })
  }

  const removeImage = item => {
    if (item.type === 'image') {
      setXrays(prev => prev.filter(img => img !== item.id))
    } else {
      setImages(prev => prev.filter(img => img.id !== item.id))
    }
  }

  const createFormData = (images, body = {}) => {
    const data = new FormData()

    images.forEach(image => {
      data.append('xray_images', {
        uri: image.uri,
        type: 'image/jpeg',
        name: image.name
      } as any)
    })

    Object.keys(body).forEach(key => {
      data.append(key, body[key])
    })

    return data
  }

  const submitImages = async () => {
    try {
      if (props.xrayImages?.images !== xrays) {
        setUpdatingImages(true)
        Request(
          `conversation/${conversationId}/images`,
          'PUT',
          {images: xrays},
          () => setUpdatingImages(false),
          () => setUpdatingImages(false)
        )
      }
      if (hasLength(images)) {
        setIsSubmitting(true)
        await fetch(`${BASE_URL}upload-xray`, {
          method: 'POST',
          body: createFormData(images, {conversation_id: conversationId}),
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json'
          }
        })
          .then(response => response.json())
          .then(res => setIsSubmitting(false))
          .catch(err => setIsSubmitting(false))
      }
    } catch (error) {
      console.error('❌ Upload failed:', error)
      throw error
    }
  }

  const canSubmit = images.length > 0 && images.length <= 10 && !isSubmitting

  const renderImageItem = ({item}: {item: RadioImage}) => (
    <View style={styles.imageItem}>
      <Image source={{uri: item.uri}} style={styles.imagePreview} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeImage(item)}>
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  )

  const renderAddButton = () => (
    <TouchableOpacity
      style={styles.addButton}
      onPress={showImagePicker}
      disabled={images.length >= 10}>
      <Text style={styles.addButtonText}>+</Text>
      <Text style={styles.addButtonSubtext}>Add Image</Text>
    </TouchableOpacity>
  )

  return (
    <View
      style={styles.container}
      className="flex-1 p-4 bg-white rounded-md mt-2 mb-12 mx-3">
      <Text style={styles.title}>Radiology Images</Text>
      <Text style={styles.subtitle}>
        Add Radiology images (minimum 1, maximum 10)
      </Text>
      <Text style={styles.counter}>{images.length}/10 images added</Text>

      <View style={styles.imageGrid}>
        <FlatList
          data={mainList}
          renderItem={({item}) => {
            if (item?.type === 'add-button') {
              return images.length < 10 ? renderAddButton() : null
            }
            return renderImageItem({item: item as RadioImage})
          }}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <BaseButton
        title="Save"
        loading={isSubmitting || updatingImages}
        onPress={submitImages}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '95%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
    lineHeight: 22
  },
  counter: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#888',
    fontWeight: '500'
  },
  imageGrid: {
    flex: 1,
    marginBottom: 20
  },
  gridContainer: {
    paddingBottom: 20
  },
  imageItem: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84
  },
  imagePreview: {
    width: '100%',
    height: 120,
    resizeMode: 'cover'
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  removeButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold'
  },
  addButton: {
    flex: 1,
    margin: 8,
    height: 120,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    fontSize: 32,
    color: '#007AFF',
    marginBottom: 4
  },
  addButtonSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  submitButtonTextDisabled: {
    color: '#999'
  }
})

export default RadiologyView
