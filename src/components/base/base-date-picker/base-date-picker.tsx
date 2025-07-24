import {useState} from 'react'
import {
  Platform,
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import {AssetSvg} from 'components/asset-svg'

interface BaseDatePickerProps {
  value: Date | null | undefined
  label?: string
  setValue: (date: Date) => void
  disabled?: boolean
  placeholder?: string
  mode?: 'date' | 'time' | 'datetime'
  minimumDate?: Date
  maximumDate?: Date
  error?: string
}

const BaseDatePicker: React.FC<BaseDatePickerProps> = ({
  value,
  label,
  setValue,
  disabled = false,
  placeholder = 'Select date',
  mode = 'date',
  minimumDate,
  maximumDate,
  error
}) => {
  const [show, setShow] = useState(false)

  const onChange = (_: any, selectedDate?: Date) => {
    setShow(false)
    if (selectedDate) {
      setValue(selectedDate)
    }
  }

  // Convert value to Date if needed, or use current date as fallback
  const getDateValue = () => {
    if (!value) return new Date()
    if (value instanceof Date) return value
    // If value is a string or moment object, convert to Date
    return moment(value).toDate()
  }

  // Only format if value exists to avoid "Invalid date" issues
  const formattedValue = value ? moment(value).format('YYYY-MM-DD') : ''

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        disabled={disabled}
        style={[styles.inputField, error ? styles.errorBorder : null]}
        onPress={() => setShow(true)}
        activeOpacity={0.7}>
        <Text
          style={[styles.inputText, !formattedValue && styles.placeholderText]}>
          {formattedValue || placeholder}
        </Text>
        <AssetSvg name="date" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label || 'Select Date'}</Text>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.closeButton}>Done</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={getDateValue()}
                mode={mode}
                display="spinner"
                onChange={onChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            </View>
          </View>
        </Modal>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={getDateValue()}
          mode={mode}
          display="default"
          onChange={onChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333'
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    backgroundColor: '#fff'
  },
  inputText: {
    fontSize: 16,
    color: '#333'
  },
  placeholderText: {
    color: '#999'
  },
  errorBorder: {
    borderColor: '#ff3b30'
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600'
  }
})

export default BaseDatePicker
