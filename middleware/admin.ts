export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return navigateTo('/registro')
  }

  const { data: isAdmin, error } = await supabase.rpc('is_admin')

  if (error || !isAdmin) {
    return navigateTo('/admin/usuario')
  }
})
