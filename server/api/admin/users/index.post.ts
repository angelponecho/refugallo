import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const admin = serverSupabaseServiceRole(event) as any
  const body = await readBody(event)
  const { email, password, name, role } = body

  if (!email || !password || !name) {
    throw createError({ statusCode: 400, message: 'email, password y name son obligatorios' })
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
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
