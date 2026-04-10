import { serverSupabaseServiceRole } from '#supabase/server'

function getUserIdFromToken(token: string): string | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const payload = JSON.parse(Buffer.from(part, 'base64').toString('utf-8'))
    return payload.sub ?? null
  } catch { return null }
}

export default defineEventHandler(async (event) => {
  const token = getRequestHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const userId = getUserIdFromToken(token)
  if (!userId) throw createError({ statusCode: 401, message: 'Token inválido' })

  const admin = serverSupabaseServiceRole(event) as any

  const { data: userData } = await admin.auth.admin.getUserById(userId)
  if (userData?.user?.app_metadata?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Acceso denegado' })
  }

  const body = await readBody(event)
  const { title, subtitle, description, text, mainImg, heroImg, thumbImg, visible, order } = body

  if (!title) throw createError({ statusCode: 400, message: 'El título es obligatorio' })

  const { data, error } = await admin
    .from('themes')
    .insert({ title, subtitle, description, text, mainImg, heroImg, thumbImg, visible: visible ?? true, order: order ?? 0 })
    .select()
    .single()

  if (error) throw createError({ statusCode: 400, message: error.message })

  return data
})
