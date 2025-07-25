import {Text} from 'components'
import {View, StyleSheet} from 'react-native'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
import colors from 'theme'
import {hasLength} from 'utils/condition'

export default ({conversation = [], category}) => {
  const {categories} = useSelector((state: RootState) => state.common)
  const currentCategory = categories?.find(cat => cat.id === category)
  if (currentCategory?.category === 'Insurance Detail') return null
  if (currentCategory?.category === 'Radiology') return null

  const uniqueConversation = conversation?.filter?.((item, index, array) => {
    const lastIndex = array
      .map(obj => obj.question_title)
      .lastIndexOf(item.question_title)
    return index === lastIndex
  })
  return (
    <View
      style={styles.container}
      className="flex-1 p-4 bg-white rounded-md mt-2 mb-12 mx-3">
      {!hasLength(uniqueConversation) && (
        <Text
          style={{textAlign: 'center'}}
          className="text-gray-700 text-xl text-center w-full py-40">
          No conversation data available
        </Text>
      )}
      {uniqueConversation.map((item, index) => {
        return <ConversationItem key={index} item={item} />
      })}
    </View>
  )
}

export const ConversationItem = ({item}) => {
  if (item?.sub_category_data) {
    return (
      <View style={styles.categoryContainer}>
        {item.sub_category_data.map((subItem, subIndex) => (
          <View key={subIndex} style={styles.subItemContainer}>
            <ConversationItem item={subItem} />
          </View>
        ))}
      </View>
    )
  }
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.question_title}</Text>
      <Text style={styles.itemAnswer}>{item.extracted_answer}</Text>
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
  categoryContainer: {},
  subItemContainer: {
    marginTop: 5,
    width: '100%'
  },
  itemContainer: {
    paddingTop: 5,
    paddingBottom: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 10,
    borderRadius: 8,
    gap: 5,
    borderColor: '#ccc'
  },
  itemTitle: {
    fontSize: 16,
    color: colors.primary
  },
  itemAnswer: {
    color: '#333'
  }
})
