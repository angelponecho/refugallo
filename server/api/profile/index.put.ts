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
  const { name, photo } = body

  if (!name?.trim()) {
    throw createError({ statusCode: 400, message: 'El nombre es obligatorio' })
  }

  const admin = serverSupabaseServiceRole(event) as any
  const { data, error } = await admin
    .from('profiles')
    .update({ name: name.trim(), photo: photo ?? null })
    .eq('id', userId)
    .select('id, name, photo, role, created_at')
    .single()

  if (error) throw createError({ statusCode: 400, message: error.message })
  return data
})
