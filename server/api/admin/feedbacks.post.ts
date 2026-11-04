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
  const action = body?.action as 'update_status' | 'delete'
  const id = String(body?.id || '').trim()

  if (!id) {
    throw createError({ statusCode: 422, statusMessage: 'Thiếu mã ý kiến đóng góp.' })
  }

  const db = await ensureDb()

  if (action === 'delete') {
    await db.execute('DELETE FROM feedbacks WHERE id = ?', [id])
    return { ok: true, message: 'Đã xóa ý kiến đóng góp.' }
  }

  if (action === 'update_status') {
    const status = body?.status
    if (!['pending', 'read', 'resolved'].includes(status)) {
      throw createError({ statusCode: 422, statusMessage: 'Trạng thái không hợp lệ.' })
    }
    await db.execute('UPDATE feedbacks SET status = ? WHERE id = ?', [status, id])
    return { ok: true, message: 'Đã cập nhật trạng thái ý kiến.' }
  }

  throw createError({ statusCode: 422, statusMessage: 'Hành động không hợp lệ.' })
})

