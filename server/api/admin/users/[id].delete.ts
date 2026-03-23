import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'id requerido' })

  // Eliminar usuario de auth.users (cascade borra el profile)
  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) throw createError({ statusCode: 400, message: error.message })

  return { ok: true }
})
