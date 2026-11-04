import { ensureDb } from '../../utils/db'
import { getActiveUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const currentUser = await getActiveUser(event)
  if (!currentUser || currentUser.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Bạn không có quyền quản trị.'
    })
  }

  const body = await readBody(event)
  const action = body?.action as 'set_role'
  const userId = String(body?.userId || '').trim()

  if (!userId) {
    throw createError({ statusCode: 422, statusMessage: 'Thiếu mã người dùng.' })
  }

  const db = await ensureDb()

  if (action === 'set_role') {
    const role = body?.role
    if (role !== 'user' && role !== 'admin') {
      throw createError({ statusCode: 422, statusMessage: 'Vai trò chỉ có thể là user hoặc admin.' })
    }

    if (role === 'user' && userId === currentUser.id) {
      const [adminCount] = await db.query<any[]>("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'")
      if ((adminCount[0]?.total || 0) <= 1) {
        throw createError({ statusCode: 422, statusMessage: 'Không thể hạ quyền vì bạn là quản trị viên duy nhất trong hệ thống.' })
      }
    }

    await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId])
    return { ok: true, message: `Đã cập nhật vai trò người dùng thành ${role === 'admin' ? 'Quản trị viên' : 'Thành viên'}.` }
  }

  throw createError({ statusCode: 422, statusMessage: 'Hành động không hợp lệ.' })
})

