import { randomUUID } from 'node:crypto'

// Genera un client_token único para un visitante anónimo.
// El cliente lo guarda en localStorage y lo envía al votar.
export default defineEventHandler(async (_event) => {
  const token = randomUUID()
  return { client_token: token }
})
