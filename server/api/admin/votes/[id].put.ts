import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const admin = serverSupabaseServiceRole(event) as any
  const voteId = Number(getRouterParam(event, 'id'))
  const { theme_id: newThemeId } = await readBody(event)

  if (!newThemeId) throw createError({ statusCode: 400, message: 'theme_id requerido' })

  // Obtener voto actual
  const { data: current, error: fetchErr } = await admin
    .from('votes').select('theme_id').eq('id', voteId).single()
  if (fetchErr || !current) throw createError({ statusCode: 404, message: 'Voto no encontrado' })

  const oldThemeId = current.theme_id

  if (oldThemeId !== newThemeId) {
    // Decrementar likes del theme anterior
    const { data: oldTheme } = await admin.from('themes').select('likes').eq('id', oldThemeId).single()
    if (oldTheme) {
      await admin.from('themes').update({ likes: Math.max((oldTheme.likes ?? 1) - 1, 0) }).eq('id', oldThemeId)
    }

    // Incrementar likes del nuevo theme
    const { data: newTheme } = await admin.from('themes').select('likes').eq('id', newThemeId).single()
    if (newTheme) {
      await admin.from('themes').update({ likes: (newTheme.likes ?? 0) + 1 }).eq('id', newThemeId)
    }
  }

  const { error } = await admin.from('votes').update({ theme_id: newThemeId }).eq('id', voteId)
  if (error) throw createError({ statusCode: 400, message: error.message })

  return { ok: true }
})
