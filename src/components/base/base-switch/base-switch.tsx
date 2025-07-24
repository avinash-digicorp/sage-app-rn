import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native'
import {useRef, useEffect} from 'react'

interface BaseSwitchProps {
  label?: string
  value: string | number | boolean
  setValue: (value: string | number | boolean) => void
}

export const BaseSwitch = ({label, value, setValue}: BaseSwitchProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current

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

  // Animate switch position when value changes
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: currentBoolValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start()
  }, [currentBoolValue, animatedValue])

  const handleToggle = () => {
    const newBoolValue = !currentBoolValue
    const newValue = convertToOriginalType(newBoolValue)
    setValue(newValue)
  }

  const getDisplayValue = (): string => {
    if (typeof value === 'boolean') return value ? 'True' : 'False'
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'no') {
        return currentBoolValue ? 'Yes' : 'No'
      }
      return currentBoolValue ? 'True' : 'False'
    }
    if (typeof value === 'number') {
      return currentBoolValue ? '1' : '0'
    }
    return currentBoolValue ? 'True' : 'False'
  }

  const switchTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22]
  })

  const switchBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ccc', '#007bff']
  })

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={styles.switchRow}
          onPress={handleToggle}
          activeOpacity={0.8}>
          <Animated.View
            style={[
              styles.switchTrack,
              {backgroundColor: switchBackgroundColor}
            ]}>
            <Animated.View
              style={[
                styles.switchThumb,
                {transform: [{translateX: switchTranslateX}]}
              ]}
            />
          </Animated.View>
          <Text
            style={[
              styles.switchText,
              currentBoolValue && styles.switchTextSelected
            ]}>
            {getDisplayValue()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default BaseSwitch

const styles = StyleSheet.create({
  container: {
    marginVertical: 10
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500'
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    marginRight: 12
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  switchText: {
    fontSize: 16,
    color: '#333'
  },
  switchTextSelected: {
    color: '#007bff',
    fontWeight: '600'
  }
})
