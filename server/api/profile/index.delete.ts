import { serverSupabaseClient, serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'No autenticado' })

  const supabase = await serverSupabaseClient(event)

  // Obtener el voto actual del usuario (si existe) para ajustar likes
  const { data: vote } = await supabase
    .from('votes')
    .select('theme_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (vote?.theme_id) {
    // Leer likes actuales y restar 1 de forma segura
    const { data: theme } = await supabase
      .from('themes')
      .select('likes')
      .eq('id', vote.theme_id)
      .single()

    if (theme) {
      await supabase
        .from('themes')
        .update({ likes: Math.max((theme.likes ?? 1) - 1, 0) })
        .eq('id', vote.theme_id)
    }
  }

  // Eliminar la cuenta en auth.users (cascade borra profile y votes)
  const adminSupabase = serverSupabaseServiceRole(event)
  const { error } = await adminSupabase.auth.admin.deleteUser(user.id)
  if (error) throw createError({ statusCode: 400, message: error.message })

  return { ok: true }
})
