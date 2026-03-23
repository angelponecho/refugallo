export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/registro')
  }

  const supabase = useSupabaseClient()
  const { data: isAdmin, error } = await supabase.rpc('is_admin')

  if (error || !isAdmin) {
    return navigateTo('/')
  }
})
