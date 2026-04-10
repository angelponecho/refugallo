import { serverSupabaseServiceRole } from '#supabase/server'

// Comprueba si un client_token ya ha votado.
// Query params: client_token (obligatorio), poll_id (opcional — si se omite, check global)
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const pollId = query.poll_id ? Number(query.poll_id) : null
  const clientToken = String(query.client_token ?? '')

  if (!clientToken) {
    throw createError({ statusCode: 400, message: 'Falta parámetro: client_token' })
  }

  const admin = serverSupabaseServiceRole(event) as any

  let q = admin
    .from('anonymous_votes')
    .select('id, poll_id')
    .eq('client_token', clientToken)

  if (pollId) q = q.eq('poll_id', pollId)

  const { data } = await q.maybeSingle()

  return {
    has_voted: !!data,
    voted_poll_id: (data?.poll_id as number) ?? null,
  }
})
