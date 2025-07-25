import {BaseInput, BasePicker, BaseRadio, BaseSwitch} from 'components'
import BaseDatePicker from 'components/base/base-date-picker/base-date-picker'
import moment = require('moment')
import {View, Text, StyleSheet} from 'react-native'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
import colors from 'theme'

interface ConversationItem {
  pk_question_id: string
  question_title: string
  type: string
  extracted_answer: any
  extracted_data: any
  sub_category?: string
  category: string
  question_validation: string
  is_required: number
  edit_disabled?: number
  pk_user_conversation_id?: number
  sub_category_data?: any[]
}

interface Props {
  conversation: ConversationItem[]
  changeFieldValue: (item: ConversationItem) => void
}

export default ({conversation = [], changeFieldValue}: Props) => {
  const {metadataList} = useSelector((state: RootState) => state.common)

  if (!conversation.length) return
  const uniqueConversation = conversation.filter((item, index, array) => {
    const firstIndex = array
      .map(obj => obj.question_title)
      .indexOf(item.question_title)
    return index === firstIndex
  })
  return (
    <View
      style={styles.container}
      className="flex-1 p-4 bg-white rounded-md mt-2 mb-12 mx-3">
      {uniqueConversation.map((item, index) => {
        const setValue = v => {
          changeFieldValue({
            ...item,
            extracted_data: v,
            extracted_data: v
          })
        }
        if (item.type === 'switch_type') {
          return (
            <BaseSwitch
              setValue={setValue}
              label={item.question_title}
              value={item?.extracted_data}
              key={index}
            />
          )
        }
        if (item.type === 'radio') {
          return (
            <BaseRadio
              setValue={setValue}
              label={item.question_title}
              value={item?.extracted_data}
              key={index}
            />
          )
        }
        if (item.type === 'textfield') {
          return (
            <BaseInput
              onChangeText={setValue}
              label={item.question_title}
              value={item?.extracted_data}
              key={index}
            />
          )
        }
        if (item.type === 'textarea') {
          return (
            <BaseInput
              multiline
              onChangeText={setValue}
              style={{height: 100}}
              label={item.question_title}
              value={item?.extracted_data}
              key={index}
            />
          )
        }
        if (item.type === 'date') {
          const isValidDate =
            item?.extracted_data && moment(item.extracted_data).isValid()
          const dateValue = isValidDate
            ? moment(item.extracted_data).toDate()
            : null
          return (
            <BaseDatePicker
              setValue={setValue}
              label={item.question_title}
              value={dateValue}
              key={index}
            />
          )
        }
        if (item.type === 'dropdown') {
          const metaData = metadataList?.find(
            meta => meta.mapping_id === item.pk_question_id
          )
          const items = metaData?.mapping_data ?? []
          return (
            <BasePicker
              setValue={setValue}
              label={item.question_title}
              value={item?.extracted_data}
              key={index}
              items={items?.map(i => ({name: i, value: i}))}
            />
          )
        }
        return <ConversationItem key={index} item={item} />
      })}
    </View>
  )
}

export const ConversationItem = ({item}) => {
  if (item?.sub_category_data) {
    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{item.sub_category}</Text>
        {item.sub_category_data.map((subItem, subIndex) => (
          <View key={subIndex} style={styles.subItemContainer}>
            <Text style={styles.subItemTitle}>{subItem.question_title}</Text>
            <Text style={styles.subItemAnswer}>- {subItem.extracted_data}</Text>
          </View>
        ))}
      </View>
    )
  }
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.question_title}</Text>
      <Text style={styles.itemAnswer}>{item.extracted_data}</Text>
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
  categoryContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc'
  },
  categoryTitle: {
    fontWeight: 'bold'
  },
  subItemContainer: {
    marginLeft: 15
  },
  subItemTitle: {
    fontWeight: '600',
    color: colors.primary
  },
  subItemAnswer: {
    color: '#333'
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc'
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.primary
  },
  itemAnswer: {
    color: '#333',
    marginTop: 4
  }
})
