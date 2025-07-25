import {StyleSheet, View} from 'react-native'
import {BaseButton} from 'components/base'
import {AssetSvg} from 'components/asset-svg'
import {goBack} from 'navigation'

interface IProps {
  title: string
  showLines?: boolean
  showEdit?: boolean
  showBack?: boolean
  onPressEdit?: () => void
}
export const Header = (props: IProps) => {
  const {
    title,
    onPressEdit,
    showBack = false,
    showLines = true,
    showEdit = false
  } = props
  return (
    <View className="mt-14 flex-row items-center justify-between">
      {showLines && <View style={styles.line} />}
      {showEdit && !showBack && <View className="flex-1" />}
      {showBack && (
        <View className="flex-row flex-1 pl-6">
          <AssetSvg name="back" buttonViewProps={{onPress: goBack}} />
        </View>
      )}
      <BaseButton
        scale={1}
        style={{width: 'auto'}}
        buttonStyle={{height: 30}}
        title={title}
        titleStyle={{fontSize: 14, paddingHorizontal: 0}}
      />
      {showLines && <View style={styles.line} />}
      {!showEdit && showBack && <View className="flex-1" />}
      {showEdit && (
        <View className="flex-row flex-1 justify-end pr-6">
          <AssetSvg buttonViewProps={{onPress: onPressEdit}} name="edit" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#BADDF0'
  }
})
