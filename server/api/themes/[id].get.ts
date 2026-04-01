import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const admin = serverSupabaseServiceRole(event) as any
  const id = Number(getRouterParam(event, 'id'))

  if (!id) throw createError({ statusCode: 400, message: 'ID inválido' })

  const { data, error } = await admin
    .from('themes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) throw createError({ statusCode: 404, message: 'Theme no encontrado' })

  return data
})
