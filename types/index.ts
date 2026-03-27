export interface Theme {
  id: number
  title: string
  subtitle: string | null
  description: string | null
  text: string | null
  mainImg: string | null
  heroImg: string | null
  thumbImg: string | null
  likes: number
  visible: boolean
  order: number
  created_at: string
}

export interface Profile {
  id: string
  name: string | null
  email: string | null
  role: 'user' | 'admin'
}

export interface Vote {
  id: number
  user_id: string
  theme_id: number
  created_at: string
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}
