import {createSlice} from '@reduxjs/toolkit'
import {IInitialCommonStateProps} from './types'

const initialState: IInitialCommonStateProps = {
  conversationId: 'CON1751881500.379857',
  password: '',
  initialParams: null,
  userData: null,
  categories: [],
  messages: []
}

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setConversationId: (state, action) => {
      state.conversationId = action.payload
    },
    setPassword: (state, action) => {
      state.password = action.payload
    },
    setCategories: (state, action) => {
      state.categories = action.payload
    },
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setInitialParams: (state, action) => {
      state.initialParams = action.payload
    },
    updateInitialParams: (state, action) => {
      state.initialParams = {
        ...state.initialParams,
        ...action.payload
      }
    },
    setMessages: (state, action) => {
      state.messages = action.payload
    },
    updateMessages: (state, action) => {
      state.messages = [...state.messages, action.payload]
    }
  }
})

export const {
  setCategories,
  setUserData,
  setInitialParams,
  updateInitialParams,
  setConversationId,
  setMessages,
  setPassword,
  updateMessages
} = commonSlice.actions

export default commonSlice.reducer
