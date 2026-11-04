import { ensureDb, withTransaction } from '../utils/db'
import { getActiveUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getActiveUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Vui lòng đăng nhập để thực hiện thao tác.' })
  }

  const body = await readBody(event)
  const action = body?.action
  const p = body?.payload || {}

  switch (action) {
    case 'saveTransaction': {
      const amount = Math.round(Number(p.amount))
      if (!Number.isFinite(amount) || amount <= 0) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Số tiền giao dịch phải lớn hơn 0đ.'
        })
      }
      if (amount > 100_000_000_000) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Số tiền giao dịch không được vượt quá 100 tỷ đồng (100.000.000.000đ) / lần thêm.'
        })
      }
      const db = await ensureDb()
      await db.execute(
        `INSERT INTO transactions (id, user_id, type, amount, category_id, description, transaction_date, payment_method, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           type = VALUES(type),
           amount = VALUES(amount),
           category_id = VALUES(category_id),
           description = VALUES(description),
           transaction_date = VALUES(transaction_date),
           payment_method = VALUES(payment_method),
           note = VALUES(note)`,
        [p.id, user.id, p.type, amount, p.categoryId, p.description, p.date, p.method, p.note || '']
      )
      return { ok: true }
    }

    case 'deleteTransaction': {
      const db = await ensureDb()
      await db.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', [p.id, user.id])
      return { ok: true }
    }

    case 'saveCategory': {
      const db = await ensureDb()
      const targetGroupId = p.groupId ? String(p.groupId).trim() : null
      await db.execute(
        `INSERT INTO categories (id, user_id, group_id, name, kind, sticker, hint, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           kind = VALUES(kind),
           sticker = VALUES(sticker),
           hint = VALUES(hint),
           group_id = VALUES(group_id)`,
        [p.id, user.id, targetGroupId, p.name, p.kind, p.sticker, p.hint || '']
      )
      return { ok: true }
    }

    case 'deleteCategory': {
      return await withTransaction(async (conn) => {
        await conn.execute('UPDATE transactions SET category_id = ? WHERE category_id = ?', [p.fallback, p.id])
        await conn.execute('UPDATE expenses SET category_id = ? WHERE category_id = ?', [p.fallback, p.id])
        await conn.execute(
          'DELETE FROM categories WHERE id = ? AND is_default = 0 AND (user_id = ? OR group_id IN (SELECT group_id FROM group_members WHERE user_id = ?))',
          [p.id, user.id, user.id]
        )
        return { ok: true }
      })
    }

    case 'createGroup': {
      return await withTransaction(async (conn) => {
        await conn.execute(
          'INSERT INTO `groups` (id, name, description, group_type, status, created_by, invite_code, frame, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.id, p.name, p.description || '', p.type || 'friends', 'active', user.id, p.inviteCode, p.frame || '#C9B6FF', p.createdAt]
        )
        await conn.execute(
          'INSERT INTO invitations (group_id, invite_code, created_by) VALUES (?, ?, ?)',
          [p.id, p.inviteCode, user.id]
        )
        await conn.execute(
          'INSERT INTO group_members (group_id, user_id, role, status, joined_at) VALUES (?, ?, ?, ?, ?)',
          [p.id, user.id, 'owner', 'active', p.createdAt]
        )
        return { ok: true }
      })
    }

    case 'upsertMember': {
      return await withTransaction(async (conn) => {
        let targetUserId = p.userId
        if (p.user) {
          const email = String(p.user.email || '').trim().toLowerCase()
          const [existing] = await conn.query<any[]>('SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1', [email])
          if (existing.length > 0) {
            targetUserId = existing[0].id
          } else {
            await conn.execute(
              'INSERT INTO users (id, name, email, frame) VALUES (?, ?, ?, ?)',
              [p.user.id, p.user.name, email, p.user.frame || '#C9B6FF']
            )
          }
        }
        await conn.execute(
          `INSERT INTO group_members (group_id, user_id, role, status, joined_at)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE role = VALUES(role), status = VALUES(status)`,
          [p.groupId, targetUserId, p.role || 'member', p.status || 'active', p.joinedAt]
        )
        return { ok: true, userId: targetUserId }
      })
    }

    case 'transferOwnership': {
      return await withTransaction(async (conn) => {
        await conn.execute('UPDATE group_members SET role = "member" WHERE group_id = ?', [p.groupId])
        await conn.execute('UPDATE group_members SET role = "owner" WHERE group_id = ? AND user_id = ?', [p.groupId, p.toUserId])
        return { ok: true }
      })
    }

    case 'setGroupStatus': {
      const db = await ensureDb()
      await db.execute('UPDATE `groups` SET status = ? WHERE id = ?', [p.status, p.groupId])
      return { ok: true }
    }

    case 'joinByCode': {
      const code = String(p.code || '').trim().toUpperCase()
      if (!code) {
        throw createError({ statusCode: 400, statusMessage: 'Vui lòng cung cấp mã mời nhóm.' })
      }
      return await withTransaction(async (conn) => {
        const [rows] = await conn.query<any[]>(
          'SELECT id, name, status FROM `groups` WHERE UPPER(invite_code) = ? LIMIT 1',
          [code]
        )
        if (!rows.length) {
          throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy nhóm với mã mời này.' })
        }
        const g = rows[0]
        if (g.status === 'archived') {
          throw createError({ statusCode: 400, statusMessage: 'Nhóm này đã được lưu trữ, không nhận thêm thành viên.' })
        }

        const now = new Date().toISOString().slice(0, 10)
        await conn.execute(
          `INSERT INTO group_members (group_id, user_id, role, status, joined_at)
           VALUES (?, ?, 'member', 'active', ?)
           ON DUPLICATE KEY UPDATE status = 'active'`,
          [g.id, user.id, now]
        )

        const logId = 'a-' + Math.random().toString(36).slice(2, 10)
        try {
          await conn.execute(
            'INSERT INTO activity_logs (id, group_id, user_id, text, created_at) VALUES (?, ?, ?, ?, NOW())',
            [logId, g.id, user.id, `${user.name} tham gia nhóm qua mã mời`]
          )
        } catch (_) {
          await conn.execute(
            'INSERT INTO activity_logs (id, group_id, text, created_at) VALUES (?, ?, ?, NOW())',
            [logId, g.id, `${user.name} tham gia nhóm qua mã mời`]
          ).catch(() => {})
        }

        return { ok: true, groupId: g.id, groupName: g.name }
      })
    }

    case 'saveExpense': {
      const total = Math.round(Number(p.total))
      if (!Number.isFinite(total) || total <= 0) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Tổng hóa đơn phải lớn hơn 0đ.'
        })
      }
      if (total > 100_000_000_000) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Tổng hóa đơn không được vượt quá 100 tỷ đồng (100.000.000.000đ) / lần thêm.'
        })
      }
      const splits: { userId: string; share: number; value: number }[] = p.splits || []
      const sumShares = splits.reduce((s, x) => s + Math.round(Number(x.share)), 0)
      if (sumShares !== total) {
        throw createError({
          statusCode: 422,
          statusMessage: `Tổng phần chia (${sumShares}đ) không khớp tổng hóa đơn (${total}đ).`
        })
      }

      return await withTransaction(async (conn) => {
        await conn.execute(
          `INSERT INTO expenses (id, group_id, created_by, category_id, title, total_amount, split_type, expense_date, description, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
           ON DUPLICATE KEY UPDATE
             category_id = VALUES(category_id),
             title = VALUES(title),
             total_amount = VALUES(total_amount),
             split_type = VALUES(split_type),
             expense_date = VALUES(expense_date),
             description = VALUES(description)`,
          [p.id, p.groupId, user.id, p.categoryId, p.title, total, p.splitType, p.date, p.note || '']
        )
        await conn.execute('DELETE FROM expense_payers WHERE expense_id = ?', [p.id])
        await conn.execute(
          'INSERT INTO expense_payers (expense_id, user_id, paid_amount) VALUES (?, ?, ?)',
          [p.id, p.payerId, total]
        )
        await conn.execute('DELETE FROM expense_splits WHERE expense_id = ?', [p.id])
        for (const sp of splits) {
          await conn.execute(
            'INSERT INTO expense_splits (expense_id, user_id, share_amount, share_value) VALUES (?, ?, ?, ?)',
            [p.id, sp.userId, Math.round(Number(sp.share)), Number(sp.value ?? 1)]
          )
        }
        return { ok: true }
      })
    }

    case 'deleteExpense': {
      const db = await ensureDb()
      await db.execute('UPDATE expenses SET status = "deleted" WHERE id = ?', [p.id])
      return { ok: true }
    }

    case 'recordSettlement': {
      const amount = Math.round(Number(p.amount))
      if (!Number.isFinite(amount) || amount <= 0) {
        throw createError({ statusCode: 422, statusMessage: 'Số tiền thanh toán phải lớn hơn 0đ.' })
      }
      if (amount > 100_000_000_000) {
        throw createError({ statusCode: 422, statusMessage: 'Số tiền thanh toán không được vượt quá 100 tỷ đồng.' })
      }
      const db = await ensureDb()
      await db.execute(
        'INSERT INTO settlements (id, group_id, from_user_id, to_user_id, amount, paid_at, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.groupId, p.fromId, p.toId, amount, p.date, p.status, p.note || '']
      )
      return { ok: true }
    }

    case 'updateSettlementStatus': {
      const db = await ensureDb()
      await db.execute('UPDATE settlements SET status = ? WHERE id = ?', [p.status, p.id])
      return { ok: true }
    }

    case 'updateProfile': {
      const db = await ensureDb()
      await db.execute(
        'UPDATE users SET name = ?, email = ?, frame = ?, gender = ?, avatar = ?, currency = ?, timezone = ? WHERE id = ?',
        [
          p.name,
          p.email,
          p.frame || '#C9B6FF',
          p.gender || 'male',
          p.avatar || 'boy-cool',
          p.currency || 'VND',
          p.timezone || 'Asia/Ho_Chi_Minh',
          user.id
        ]
      )
      return { ok: true }
    }

    case 'log': {
      const db = await ensureDb()
      try {
        await db.execute(
          'INSERT INTO activity_logs (id, group_id, user_id, text) VALUES (?, ?, ?, ?)',
          [p.id, p.groupId || null, user.id, p.text]
        )
      } catch (_) {
        await db.execute(
          'INSERT INTO activity_logs (id, group_id, text) VALUES (?, ?, ?)',
          [p.id, p.groupId || null, p.text]
        )
      }
      return { ok: true }
    }

    default:
      throw createError({ statusCode: 400, statusMessage: `Action không hỗ trợ: ${action}` })
  }
})
