import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'No autenticado' })

  const supabase = await serverSupabaseClient(event)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, photo, role, created_at')
    .eq('id', user.id)
    .single()

  if (error) throw createError({ statusCode: 400, message: error.message })
  return data
})
