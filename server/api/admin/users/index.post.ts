import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const body = await readBody(event)
  const { email, password, name, role } = body

  if (!email || !password || !name) {
    throw createError({ statusCode: 400, message: 'email, password y name son obligatorios' })
  }

  // Crear usuario en auth.users
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (error) throw createError({ statusCode: 400, message: error.message })

  // Actualizar rol si es admin (el trigger crea el profile con role='user' por defecto)
  if (role === 'admin') {
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id)
  }

  return { id: data.user.id }
})
