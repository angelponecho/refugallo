import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const admin = serverSupabaseServiceRole(event) as any
  const id = getRouterParam(event, 'id')
  const { name, role } = await readBody(event)

  if (!id) throw createError({ statusCode: 400, message: 'id requerido' })
  if (!name?.trim()) throw createError({ statusCode: 400, message: 'El nombre es obligatorio' })

  const { data, error } = await admin.auth.admin.updateUserById(id, {
    user_metadata: { name: name.trim() },
    app_metadata: { role: role === 'admin' ? 'admin' : 'user' },
  })

  if (error) throw createError({ statusCode: 400, message: error.message })

  return {
    id: data.user.id as string,
    name: (data.user.user_metadata?.name ?? null) as string | null,
    email: (data.user.email ?? null) as string | null,
    role: (data.user.app_metadata?.role ?? 'user') as 'user' | 'admin',
    created_at: data.user.created_at as string,
  }
})
