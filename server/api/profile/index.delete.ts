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

  const admin = serverSupabaseServiceRole(event)
  const db = admin as any
  const { data: vote } = await db.from('votes').select('theme_id').eq('user_id', userId).maybeSingle() as { data: { theme_id: number } | null }

  if (vote?.theme_id) {
    const { data: theme } = await db.from('themes').select('likes').eq('id', vote.theme_id).single() as { data: { likes: number } | null }

    if (theme) {
      await db.from('themes').update({ likes: Math.max((theme.likes ?? 1) - 1, 0) }).eq('id', vote.theme_id)
    }
  }

  // Eliminar la cuenta en auth.users (cascade borra profile y votes)
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw createError({ statusCode: 400, message: error.message })

  return { ok: true }
})
