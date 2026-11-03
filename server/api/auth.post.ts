import { ensureDb } from '../utils/db'
import { hashPassword, pickFrame, setCurrentUserCookie, clearCurrentUserCookie } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const mode = body?.mode as 'login' | 'register' | 'logout'
  const db = await ensureDb()

  if (mode === 'logout') {
    clearCurrentUserCookie(event)
    return { ok: true }
  }

  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')
  const name = String(body?.name || '').trim()

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 422, statusMessage: 'Email không hợp lệ.' })
  }
  if (!password || password.length < 4) {
    throw createError({ statusCode: 422, statusMessage: 'Mật khẩu cần tối thiểu 4 ký tự.' })
  }

  if (mode === 'register') {
    if (!name) {
      throw createError({ statusCode: 422, statusMessage: 'Vui lòng nhập tên hiển thị.' })
    }
    const [existing] = await db.query<any[]>('SELECT id, password_hash FROM users WHERE LOWER(email) = ? LIMIT 1', [email])
    if (existing.length > 0 && existing[0].password_hash) {
      throw createError({ statusCode: 409, statusMessage: 'Email này đã được đăng ký. Vui lòng chọn Đăng nhập.' })
    }

    const pwHash = hashPassword(password)
    let userId: string
    if (existing.length > 0) {
      // User was previously invited by email into a group before registering
      userId = existing[0].id
      await db.execute('UPDATE users SET name = ?, password_hash = ? WHERE id = ?', [name, pwHash, userId])
    } else {
      userId = `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
      const frame = pickFrame(email)
      await db.execute(
        'INSERT INTO users (id, name, email, password_hash, frame, gender, avatar, currency, timezone) VALUES (?, ?, ?, ?, ?, "male", "boy-cool", "VND", "Asia/Ho_Chi_Minh")',
        [userId, name, email, pwHash, frame]
      )
    }

    setCurrentUserCookie(event, userId)
    const [rows] = await db.query<any[]>('SELECT id, name, email, frame, gender, avatar, currency, timezone FROM users WHERE id = ?', [userId])
    return { ok: true, user: rows[0] }
  }

  // mode === 'login'
  const [rows] = await db.query<any[]>(
    'SELECT id, name, email, password_hash, frame, gender, avatar, currency, timezone FROM users WHERE LOWER(email) = ? LIMIT 1',
    [email]
  )
  if (!rows.length) {
    throw createError({ statusCode: 401, statusMessage: 'Chưa có tài khoản với email này. Hãy chuyển sang tab Đăng ký.' })
  }

  const user = rows[0]
  const pwHash = hashPassword(password)
  if (user.password_hash && user.password_hash !== pwHash) {
    throw createError({ statusCode: 401, statusMessage: 'Mật khẩu không chính xác.' })
  }
  if (!user.password_hash) {
    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [pwHash, user.id])
  }

  setCurrentUserCookie(event, user.id)
  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      frame: user.frame,
      gender: user.gender || 'male',
      avatar: user.avatar || 'boy-cool',
      currency: user.currency,
      timezone: user.timezone
    }
  }
})

