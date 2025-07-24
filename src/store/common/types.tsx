export interface IInitialCommonStateProps {
  conversationId?: string
  password?: string
  initialParams: InitialParams | null
  userData: any // Assuming userData is of type any, adjust as needed
  categories?: CategoryId[] // Optional categories array
  messages: MessageType[]
}

type CategoryId = {
  id: string
  category: string
}
export interface MessageType {
  role: 'user' | 'system'
  message: string
}
interface InitialParams {
  question_prompt?: string
  question?: string
  categories?: CategoryId[] // Assuming categories is an array of strings
  user_data?: any
  [key: string]: any
}
