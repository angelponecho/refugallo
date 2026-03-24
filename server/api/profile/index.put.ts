import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'No autenticado' })

  const body = await readBody(event)
  const { name, photo } = body

  // El rol nunca se puede cambiar desde este endpoint — solo name y photo
  if (!name?.trim()) {
    throw createError({ statusCode: 400, message: 'El nombre es obligatorio' })
  }

  const supabase = await serverSupabaseClient(event)
  const { data, error } = await supabase
    .from('profiles')
    .update({ name: name.trim(), photo: photo ?? null })
    .eq('id', user.id)
    .select('id, name, photo, role, created_at')
    .single()

  if (error) throw createError({ statusCode: 400, message: error.message })
  return data
})
