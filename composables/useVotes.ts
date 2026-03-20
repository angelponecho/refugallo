export const useVotes = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const toast = useToastStore()

  async function vote(themeId: number): Promise<boolean> {
    if (!user.value) {
      await navigateTo('/registro')
      return false
    }

    const { error } = await supabase.rpc('vote_theme', { p_theme_id: themeId })

    if (error) {
      if (error.code === '23505' || error.message?.includes('unique')) {
        toast.show('Ya has votado por este tema', 'info')
      }
      else {
        toast.show('Error al registrar el voto', 'error')
      }
      return false
    }

    toast.show('¡Voto registrado correctamente!', 'success')
    return true
  }

  async function hasVoted(themeId: number): Promise<boolean> {
    if (!user.value) return false
    const { data } = await supabase
      .from('votes')
      .select('id')
      .eq('theme_id', themeId)
      .eq('user_id', user.value.id)
      .maybeSingle()
    return !!data
  }

  return { vote, hasVoted }
}
