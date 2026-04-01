import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const admin = serverSupabaseServiceRole(event) as any

  // Votos con tema incluido
  const { data: votes, error } = await admin
    .from('votes')
    .select('id, user_id, theme_id, created_at, themes(id, title)')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 400, message: error.message })

  // Mapa user_id → { name, email }
  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const userMap = new Map<string, { name: string | null; email: string | null }>()
  for (const u of (usersData?.users ?? [])) {
    userMap.set(u.id, { name: u.user_metadata?.name ?? null, email: u.email ?? null })
  }

  return (votes as any[]).map(v => ({
    id: v.id as number,
    user_id: v.user_id as string,
    user_name: userMap.get(v.user_id)?.name ?? userMap.get(v.user_id)?.email ?? 'Desconocido',
    theme_id: v.theme_id as number,
    theme_title: v.themes?.title ?? 'Desconocido',
    created_at: v.created_at as string,
  }))
})
