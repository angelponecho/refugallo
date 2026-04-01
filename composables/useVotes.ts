import type { Database } from '~/types/database.types'

export const useVotes = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const toast = useToastStore()

  async function vote(themeId: number): Promise<boolean> {
    if (!user.value) {
      await navigateTo('/registro')
      return false
    }

    const { error } = await (supabase as any).rpc('vote_theme', { p_theme_id: themeId })

    if (error) {
      toast.show('Error al registrar el voto', 'error')
      return false
    }

    toast.show('¡Voto registrado correctamente!', 'success')
    return true
  }

  // Devuelve el theme_id por el que el usuario ha votado, o null si no ha votado
  async function getCurrentVote(): Promise<number | null> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) return null
    const { data } = await supabase
      .from('votes')
      .select('theme_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
    return (data as { theme_id: number } | null)?.theme_id ?? null
  }

  // Comprueba si el voto activo del usuario es por este theme concreto
  async function hasVoted(themeId: number): Promise<boolean> {
    const current = await getCurrentVote()
    return current === themeId
  }

  return { vote, getCurrentVote, hasVoted }
}
