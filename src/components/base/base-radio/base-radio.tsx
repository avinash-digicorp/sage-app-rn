import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'

interface BaseRadioProps {
  label?: string
  value: string | number | boolean
  setValue: (value: string | number | boolean) => void
}

export const BaseRadio = ({label, value, setValue}: BaseRadioProps) => {
  // Convert value to boolean for consistent handling
  const getBooleanValue = (val: string | number | boolean): boolean => {
    if (typeof val === 'boolean') return val
    if (typeof val === 'string') {
      return val.toLowerCase() === 'yes' || val.toLowerCase() === 'true'
    }
    if (typeof val === 'number') {
      return val === 1
    }
    return false
  }

  // Convert boolean back to the original type format
  const convertToOriginalType = (
    boolVal: boolean
  ): string | number | boolean => {
    if (typeof value === 'boolean') return boolVal
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'no') {
        return boolVal ? 'yes' : 'no'
      }
      return boolVal ? 'true' : 'false'
    }
    if (typeof value === 'number') {
      return boolVal ? 1 : 0
    }
    return boolVal
  }

  const currentBoolValue = getBooleanValue(value)

  const handleYesPress = () => {
    const newValue = convertToOriginalType(true)
    setValue(newValue)
  }

  const handleNoPress = () => {
    const newValue = convertToOriginalType(false)
    setValue(newValue)
  }

  return (
    <View style={styles.container}>
      <View style={styles.horizontalContainer}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={handleYesPress}
            activeOpacity={0.7}>
            <View
              style={[
                styles.radioCircle,
                currentBoolValue && styles.radioCircleSelected
              ]}>
              {currentBoolValue && <View style={styles.radioInner} />}
            </View>
            <Text
              style={[
                styles.radioText,
                currentBoolValue && styles.radioTextSelected
              ]}>
              Yes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.radioButton}
            onPress={handleNoPress}
            activeOpacity={0.7}>
            <View
              style={[
                styles.radioCircle,
                !currentBoolValue && styles.radioCircleSelected
              ]}>
              {!currentBoolValue && <View style={styles.radioInner} />}
            </View>
            <Text
              style={[
                styles.radioText,
                !currentBoolValue && styles.radioTextSelected
              ]}>
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default BaseRadio

const styles = StyleSheet.create({
  container: {
    marginVertical: 10
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginRight: 12
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginLeft: 8
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#fff'
  },
  radioCircleSelected: {
    borderColor: '#007bff'
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff'
  },
  radioText: {
    fontSize: 14,
    color: '#333'
  },
  radioTextSelected: {
    color: '#007bff',
    fontWeight: '600'
  }
})
