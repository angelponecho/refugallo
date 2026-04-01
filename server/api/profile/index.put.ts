import { serverSupabaseServiceRole } from '#supabase/server'

function getUserIdFromToken(token: string): string | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const payload = JSON.parse(Buffer.from(part, 'base64').toString('utf-8'))
    return payload.sub ?? null
  }
  catch { return null }
}

export default defineEventHandler(async (event) => {
  const token = getRequestHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const userId = getUserIdFromToken(token)
  if (!userId) throw createError({ statusCode: 401, message: 'No autenticado' })

  const body = await readBody(event)
  const { name, email } = body

  if (!name?.trim()) {
    throw createError({ statusCode: 400, message: 'El nombre es obligatorio' })
  }

  const admin = serverSupabaseServiceRole(event) as any
  const { data, error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { name: name.trim() },
    ...(email?.trim() ? { email: email.trim() } : {}),
  })

  if (error) throw createError({ statusCode: 400, message: error.message })

  return {
    id: data.user.id as string,
    name: (data.user.user_metadata?.name ?? null) as string | null,
    email: (data.user.email ?? null) as string | null,
    role: (data.user.app_metadata?.role ?? 'user') as 'user' | 'admin',
  }
})
