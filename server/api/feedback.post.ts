import { ensureDb } from '../utils/db'
import { getActiveUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const content = String(body?.content || '').trim()

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 422, statusMessage: 'Vui lòng cung cấp địa chỉ email hợp lệ.' })
  }
  if (!content || content.length < 5) {
    throw createError({ statusCode: 422, statusMessage: 'Ý kiến đóng góp cần tối thiểu 5 ký tự.' })
  }
  if (content.length > 3000) {
    throw createError({ statusCode: 422, statusMessage: 'Nội dung ý kiến không vượt quá 3000 ký tự.' })
  }

  const db = await ensureDb()
  const currentUser = await getActiveUser(event)
  const id = `fb_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

  await db.execute(
    'INSERT INTO feedbacks (id, user_id, email, content, status) VALUES (?, ?, ?, ?, "pending")',
    [id, currentUser?.id || null, email, content]
  )

  if (currentUser) {
    try {
      const actId = `act_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
      await db.execute(
        'INSERT INTO activity_logs (id, user_id, text) VALUES (?, ?, ?)',
        [actId, currentUser.id, `${currentUser.name} đã gửi một ý kiến đóng góp cho hệ thống.`]
      )
    } catch (_) {}
  }

  return {
    ok: true,
    id,
    message: 'Cảm ơn bạn đã đóng góp ý kiến! Chúng mình đã ghi nhận.'
  }
})

