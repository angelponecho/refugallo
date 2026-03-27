import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const caller = await serverSupabaseUser(event)
  if (!caller) throw createError({ statusCode: 401, message: 'No autenticado' })

  const admin = serverSupabaseServiceRole(event) as any
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw createError({ statusCode: 400, message: error.message })

  return (data.users as any[]).map(u => ({
    id: u.id as string,
    name: (u.user_metadata?.name ?? null) as string | null,
    email: (u.email ?? null) as string | null,
    role: (u.app_metadata?.role ?? 'user') as 'user' | 'admin',
    created_at: u.created_at as string,
  }))
})
