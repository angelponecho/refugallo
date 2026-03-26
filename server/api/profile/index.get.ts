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

  const admin = serverSupabaseServiceRole(event) as any
  const { data, error } = await admin
    .from('profiles')
    .select('id, name, email, photo, role, created_at')
    .eq('id', userId)
    .single()

  if (error) throw createError({ statusCode: 400, message: error.message })
  return data
})
