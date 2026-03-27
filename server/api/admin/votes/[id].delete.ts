import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const admin = serverSupabaseServiceRole(event) as any
  const voteId = Number(getRouterParam(event, 'id'))

  // Obtener el voto para ajustar likes
  const { data: vote } = await admin.from('votes').select('theme_id').eq('id', voteId).single()

  if (vote?.theme_id) {
    const { data: theme } = await admin.from('themes').select('likes').eq('id', vote.theme_id).single()
    if (theme) {
      await admin.from('themes').update({ likes: Math.max((theme.likes ?? 1) - 1, 0) }).eq('id', vote.theme_id)
    }
  }

  const { error } = await admin.from('votes').delete().eq('id', voteId)
  if (error) throw createError({ statusCode: 400, message: error.message })

  return { ok: true }
})
