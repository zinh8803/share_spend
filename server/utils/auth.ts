import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import { ensureDb } from './db'

const COOKIE_NAME = 'sharespend_uid'
const FRAMES = ['#C9B6FF', '#A8D8FF', '#FFD6E2', '#FFF1A8', '#CDEFD9', '#FFDDBF']

export function hashPassword(raw: string): string {
  return crypto.createHash('sha256').update(`sharespend:${raw}`).digest('hex')
}

export function getCurrentUserId(event: H3Event): string | null {
  const cookieVal = getCookie(event, COOKIE_NAME)
  if (cookieVal) return cookieVal
  const headerVal = getHeader(event, 'x-user-id')
  if (headerVal) return headerVal
  return null
}

export function setCurrentUserCookie(event: H3Event, userId: string) {
  setCookie(event, COOKIE_NAME, userId, {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax'
  })
}

export function clearCurrentUserCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function pickFrame(seed: string): string {
  let sum = 0
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i)
  return FRAMES[sum % FRAMES.length]
}

export async function getActiveUser(event: H3Event) {
  const uid = getCurrentUserId(event)
  if (!uid) return null
  const db = await ensureDb()
  const [rows] = await db.query<any[]>(
    'SELECT id, name, email, role, frame, gender, avatar, currency, timezone FROM users WHERE id = ? LIMIT 1',
    [uid]
  )
  return rows[0] || null
}

