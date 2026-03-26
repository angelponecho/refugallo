import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')
  const { name, role } = await readBody(event)

  if (!name?.trim()) {
    throw createError({ statusCode: 400, message: 'El nombre es obligatorio' })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ name: name.trim(), role })
    .eq('id', id)

  if (error) throw createError({ statusCode: 400, message: error.message })
  return { ok: true }
})
