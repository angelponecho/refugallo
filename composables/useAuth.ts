import type { Profile } from '~/types'
import type { Database } from '~/types/database.types'

export const useAuth = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const profile = useState<Profile | null>('profile', () => null)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function fetchProfile() {
    if (!user.value?.id) {
      profile.value = null
      return
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      profile.value = await $fetch<Profile>('/api/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
    }
    catch {
      profile.value = null
    }
  }

  async function register(email: string, password: string, name: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await fetchProfile()
  }

  async function logout() {
    await supabase.auth.signOut()
    profile.value = null
    await navigateTo('/')
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  return { user, profile, isLoggedIn, isAdmin, fetchProfile, register, login, logout, resetPassword }
}
