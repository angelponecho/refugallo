import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const admin = serverSupabaseServiceRole(event) as any
  const id = getRouterParam(event, 'id')
  const { name, role, password } = await readBody(event)

  if (!id) throw createError({ statusCode: 400, message: 'id requerido' })
  if (!name?.trim()) throw createError({ statusCode: 400, message: 'El nombre es obligatorio' })
  if (password !== undefined && password !== '' && password.length < 6)
    throw createError({ statusCode: 400, message: 'La contraseña debe tener al menos 6 caracteres' })

  const update: Record<string, any> = {
    user_metadata: { name: name.trim() },
    app_metadata: { role: role === 'admin' ? 'admin' : 'user' },
  }
  if (password) update.password = password

  const { data, error } = await admin.auth.admin.updateUserById(id, update)

  if (error) throw createError({ statusCode: 400, message: error.message })

  return {
    id: data.user.id as string,
    name: (data.user.user_metadata?.name ?? null) as string | null,
    email: (data.user.email ?? null) as string | null,
    role: (data.user.app_metadata?.role ?? 'user') as 'user' | 'admin',
    created_at: data.user.created_at as string,
  }
})
