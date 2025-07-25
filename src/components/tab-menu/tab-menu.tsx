import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Animated, {
  CurvedTransition,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated'
import colors from 'theme'

export const TabMenu = ({tabs, setValue, value}: any) => {
  return (
    <View>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{padding: 10}}>
        {tabs.map((tab, index) => {
          const isSelected = value === tab.id
          const onPress = () => {
            setValue(tab.id)
          }
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={[styles.tab]}
              onPress={onPress}>
              <Text
                style={[styles.tabText, isSelected && {color: colors.primary}]}>
                {tab.title}
              </Text>
              {isSelected && (
                <Animated.View
                  layout={CurvedTransition}
                  entering={ZoomIn}
                  exiting={ZoomOut}
                  style={styles.line}
                  className={'absolute bottom-0 left-0 right-0'}
                />
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  line: {
    height: 2,
    marginHorizontal: '5%',
    alignSelf: 'center',
    backgroundColor: colors.primary
  },
  tab: {
    paddingVertical: 15,
    paddingHorizontal: 20
  },
  tabText: {
    color: '#333',
    fontWeight: 'bold'
  }
})
