import { ensureDb } from '../../utils/db'
import { getActiveUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const currentUser = await getActiveUser(event)
  if (!currentUser || currentUser.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Bạn không có quyền truy cập trang quản trị.'
    })
  }

  const db = await ensureDb()
  const [feedbacks] = await db.query<any[]>(`
    SELECT 
      f.id,
      f.user_id AS userId,
      f.email,
      f.content,
      f.status,
      f.created_at AS createdAt,
      u.name AS userName,
      u.avatar AS userAvatar,
      u.frame AS userFrame
    FROM feedbacks f
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `)

  return {
    ok: true,
    feedbacks
  }
})

