import { serverSupabaseServiceRole } from '#supabase/server'
import { createHash } from 'node:crypto'

// Registra un voto anónimo con múltiples capas anti-duplicado.
// Body: { poll_id, client_token, fingerprint_hash, captcha_token? }
export default defineEventHandler(async (event) => {
  const admin = serverSupabaseServiceRole(event) as any
  const body = await readBody(event)
  const { poll_id, client_token, fingerprint_hash, captcha_token } = body

  if (!poll_id || !client_token) {
    throw createError({ statusCode: 400, message: 'Faltan campos obligatorios: poll_id, client_token' })
  }

  // ── CAPTCHA (opcional — activar poniendo CAPTCHA_SECRET en .env) ──────────
  const captchaSecret = process.env.CAPTCHA_SECRET
  if (captchaSecret && captcha_token) {
    const res = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${captchaSecret}&response=${captcha_token}`,
    })
    const result = await res.json() as { success: boolean }
    if (!result.success) {
      throw createError({ statusCode: 400, message: 'CAPTCHA inválido' })
    }
  }

  // ── Hash de IP ─────────────────────────────────────────────────────────────
  const rawIp =
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestHeader(event, 'x-real-ip') ||
    event.node.req.socket?.remoteAddress ||
    'unknown'

  const ipHash = createHash('sha256').update(rawIp).digest('hex')

  // ── Bloqueo 1: mismo client_token ─────────────────────────────────────────
  const { data: byToken } = await admin
    .from('anonymous_votes')
    .select('id')
    .eq('poll_id', poll_id)
    .eq('client_token', client_token)
    .maybeSingle()

  if (byToken) {
    throw createError({ statusCode: 409, message: 'Ya has votado en esta encuesta' })
  }

  // ── Bloqueo 2: misma IP en las últimas 24h ─────────────────────────────────
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: byIp } = await admin
    .from('anonymous_votes')
    .select('id')
    .eq('poll_id', poll_id)
    .eq('ip_hash', ipHash)
    .gte('created_at', since)
    .maybeSingle()

  if (byIp) {
    throw createError({ statusCode: 409, message: 'Ya has votado en esta encuesta desde esta red' })
  }

  // ── Bloqueo 3: mismo fingerprint ──────────────────────────────────────────
  if (fingerprint_hash) {
    const { data: byFp } = await admin
      .from('anonymous_votes')
      .select('id')
      .eq('poll_id', poll_id)
      .eq('fingerprint_hash', fingerprint_hash)
      .maybeSingle()

    if (byFp) {
      throw createError({ statusCode: 409, message: 'Ya has votado en esta encuesta desde este dispositivo' })
    }
  }

  // ── Guardar voto e incrementar likes ──────────────────────────────────────
  const { error: insertError } = await admin
    .from('anonymous_votes')
    .insert({ poll_id, client_token, ip_hash: ipHash, fingerprint_hash: fingerprint_hash ?? null })

  if (insertError) {
    // UNIQUE constraint violada por carrera → ya votó
    if (insertError.code === '23505') {
      throw createError({ statusCode: 409, message: 'Ya has votado en esta encuesta' })
    }
    throw createError({ statusCode: 400, message: insertError.message })
  }

  const { data: theme } = await admin.from('themes').select('likes').eq('id', poll_id).single()
  if (theme) {
    await admin.from('themes').update({ likes: (theme.likes ?? 0) + 1 }).eq('id', poll_id)
  }

  return { ok: true }
})
