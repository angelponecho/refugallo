/**
 * Divide un texto largo en bloques de N líneas aproximadas.
 * No corta palabras. Respeta saltos de párrafo si están cerca del límite.
 */
export function splitTextIntoChunks(
  text: string,
  linesPerChunk = 8,
  charsPerLine = 75,
): string[] {
  if (!text?.trim()) return []

  const charsPerChunk = linesPerChunk * charsPerLine // ~600 chars por slide
  const chunks: string[] = []
  let remaining = text.trim()

  while (remaining.length > charsPerChunk) {
    let cutPoint = charsPerChunk

    // Preferir cortar en salto de párrafo si está cerca del límite
    const paragraphBreak = remaining.indexOf('\n\n', cutPoint - 150)
    if (paragraphBreak !== -1 && paragraphBreak < cutPoint + 200) {
      cutPoint = paragraphBreak
    }
    else {
      // Si no hay párrafo, buscar el último espacio antes del límite
      const lastSpace = remaining.lastIndexOf(' ', cutPoint)
      if (lastSpace > cutPoint * 0.7) {
        cutPoint = lastSpace
      }
    }

    chunks.push(remaining.slice(0, cutPoint).trim())
    remaining = remaining.slice(cutPoint).trim()
  }

  if (remaining.length > 0) {
    chunks.push(remaining)
  }

  return chunks
}
