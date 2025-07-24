import {useEffect, useRef, useState} from 'react'
import {
  TextInput,
  StyleSheet,
  View,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  TextInputProps
} from 'react-native'
import {fonts} from 'utils/fonts'
import Text from '../text/text'
import colors from 'theme'

interface Props extends TextInputProps {
  label: string
  value: string
  errorText?: string | null
}

export const BaseInput = (props: Props) => {
  const {label, errorText, value, ...restOfProps} = props
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<TextInput>(null)
  const focusAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused || !!value ? 1 : 0,
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true
    }).start()
  }, [focusAnim, isFocused, value])

  let color = isFocused ? colors.primary : colors.grayLight9
  if (errorText) {
    color = colors.danger
  }

  return (
    <View className="w-full mt-2 mb-4" style={props.style}>
      <TextInput
        placeholderTextColor={colors.gray5}
        ref={inputRef}
        {...restOfProps}
        style={[
          styles.input,
          {borderColor: color},
          isFocused && {color: colors.primary},
          props.style
        ]}
        value={value}
        onBlur={event => {
          setIsFocused(false)
          props?.onBlur?.(event)
        }}
        onFocus={event => {
          setIsFocused(true)
          props?.onFocus?.(event)
        }}
      />
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <Animated.View
          style={[
            styles.labelContainer,
            (isFocused || value) && {backgroundColor: colors.white},
            {
              transform: [
                {
                  scale: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.75]
                  })
                },
                {
                  translateY: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, -12]
                  })
                },
                {
                  translateX: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0]
                  })
                }
              ]
            }
          ]}>
          <Text style={[styles.label, {color}]}>
            {label}
            {errorText ? '*' : ''}
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>
      {!!errorText && <Text style={styles.error}>{errorText}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.gray8,
    fontFamily: fonts.medium,
    fontSize: 16
  },
  labelContainer: {
    position: 'absolute',
    paddingHorizontal: 8,
    backgroundColor: 'transparent'
  },
  label: {
    fontFamily: 'Avenir-Heavy',
    fontSize: 16
  },
  error: {
    marginTop: 4,
    marginLeft: 12,
    fontSize: 12,
    color: colors.danger,
    fontFamily: 'Avenir-Medium'
  }
})
