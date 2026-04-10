// Genera un fingerprint suave del navegador.
// No es una garantía de identidad única — es una capa de fricción adicional
// para detectar duplicados casuales en la votación anónima.
export function getBrowserFingerprint(): string {
  if (typeof window === 'undefined') return ''

  const parts = [
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    `${screen.width}x${screen.height}`,
    navigator.platform,
  ]

  const raw = parts.join('|')

  // Hash ligero (djb2) — sin crypto en el cliente para máxima compatibilidad
  let hash = 5381
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i)
    hash = hash >>> 0 // mantener como uint32
  }
  return hash.toString(16)
}
