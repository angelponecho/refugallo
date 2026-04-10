import { getBrowserFingerprint } from '~/utils/fingerprint'

const STORAGE_TOKEN_KEY = 'refugallo_client_token'
const STORAGE_VOTE_KEY  = 'refugallo_anon_voted_id'  // theme_id votado, o null

export const useAnonymousVote = () => {
  const toast = useToastStore()

  // ── client_token del visitante ─────────────────────────────────────────────
  async function getClientToken(): Promise<string> {
    if (typeof window === 'undefined') return ''
    let token = localStorage.getItem(STORAGE_TOKEN_KEY)
    if (token) return token
    const data = await $fetch<{ client_token: string }>('/api/votes/token', { method: 'POST' })
    token = data.client_token
    localStorage.setItem(STORAGE_TOKEN_KEY, token)
    return token
  }

  // ── theme_id por el que votó anónimamente (null si no ha votado) ───────────
  // Prioriza localStorage; si no hay, verifica en el servidor.
  async function getAnonymousVoteId(): Promise<number | null> {
    if (typeof window === 'undefined') return null

    const local = localStorage.getItem(STORAGE_VOTE_KEY)
    if (local) return Number(local)

    // Verificación con el servidor por si se borró el localStorage
    try {
      const token = localStorage.getItem(STORAGE_TOKEN_KEY)
      if (!token) return null
      const data = await $fetch<{ has_voted: boolean; voted_poll_id: number | null }>(
        '/api/votes/anonymous/check',
        { query: { client_token: token } }
      )
      if (data.has_voted && data.voted_poll_id) {
        localStorage.setItem(STORAGE_VOTE_KEY, String(data.voted_poll_id))
        return data.voted_poll_id
      }
    } catch { /* silencioso */ }

    return null
  }

  // ── Registra el voto anónimo ──────────────────────────────────────────────
  async function voteAnonymously(pollId: number, captchaToken?: string): Promise<boolean> {
    try {
      const clientToken     = await getClientToken()
      const fingerprintHash = getBrowserFingerprint()

      await $fetch('/api/votes/anonymous', {
        method: 'POST',
        body: { poll_id: pollId, client_token: clientToken, fingerprint_hash: fingerprintHash, captcha_token: captchaToken },
      })

      // Guardar voto localmente para mostrar "Tu voto" inmediatamente
      localStorage.setItem(STORAGE_VOTE_KEY, String(pollId))

      toast.show('¡Voto registrado! Regístrate para poder cambiarlo cuando quieras.', 'success')
      return true
    } catch (err: any) {
      const msg: string = err?.data?.message ?? err?.message ?? 'Error al registrar el voto'
      if (msg.includes('Ya has votado')) {
        toast.show('Ya has votado en esta encuesta', 'info')
      } else if (msg.includes('CAPTCHA')) {
        toast.show('Verifica el CAPTCHA para poder votar', 'error')
      } else {
        toast.show(msg, 'error')
      }
      return false
    }
  }

  return { getClientToken, getAnonymousVoteId, voteAnonymously }
}
