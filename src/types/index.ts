export interface Course {
  id: string
  title: string
  description: string
  price: number
  image_url: string
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  order: number
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  lesson_id: string
  bunny_video_id: string
  title: string
  description: string
  duration: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  course_id: string
  stripe_subscription_id: string
  status: 'active' | 'canceled' | 'past_due'
  current_period_end: string
  created_at: string
  updated_at: string
}

// Chat-related interfaces
export interface Chat {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
  message_count?: number
  last_message?: string
}

export interface ChatMessage {
  id: string
  chat_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string | null
  file_url: string | null
  file_type: string | null
  file_name: string | null
  is_note: boolean
  created_at: string
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessage[]
}

export interface FileUpload {
  file: File
  type: 'image' | 'pdf'
  preview?: string
}

export interface ChatResponse {
  response: string
  error?: string
  chat_id?: string
  message_id?: string
} 