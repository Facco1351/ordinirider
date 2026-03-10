import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'riderdash_session'
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-prod')

// Crea e firma un JWT con i dati del rider
export async function createSession(rider) {
  const token = await new SignJWT({
    id:          rider.id,
    username:    rider.username,
    nome:        rider.nome,
    cognome:     rider.cognome,
    abbonamento: rider.abbonamento,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return token
}

// Verifica e decodifica il JWT
export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

// Legge la sessione dai cookie (usato nelle Server Components e API)
export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

// Opzioni del cookie
export const SESSION_COOKIE = {
  name:     COOKIE_NAME,
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge:   60 * 60 * 24 * 7, // 7 giorni
  path:     '/',
}
