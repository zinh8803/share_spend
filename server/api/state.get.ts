import { ensureDb } from '../utils/db'
import { getActiveUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const db = await ensureDb()
    const currentUser = await getActiveUser(event)

    const [categories] = await db.query<any[]>('SELECT id, name, kind, sticker, hint, is_default FROM categories ORDER BY is_default DESC, name ASC')

    if (!currentUser) {
      return {
        connected: true,
        authenticated: false,
        user: null,
        data: {
          users: [],
          categories: categories.map(c => ({
            id: c.id,
            name: c.name,
            kind: c.kind,
            sticker: c.sticker,
            hint: c.hint,
            isDefault: Boolean(c.is_default)
          })),
          transactions: [],
          groups: [],
          members: [],
          expenses: [],
          settlements: [],
          activity: []
        }
      }
    }

    const [users] = await db.query<any[]>('SELECT id, name, email, frame, gender, avatar, currency, timezone FROM users ORDER BY created_at ASC')
    const [transactions] = await db.query<any[]>(
      'SELECT id, type, amount, category_id AS categoryId, description, transaction_date AS date, payment_method AS method, note FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC, created_at DESC',
      [currentUser.id]
    )
    const [groups] = await db.query<any[]>(
      'SELECT id, name, description, group_type AS type, status, created_by AS createdBy, invite_code AS inviteCode, created_at AS createdAt, frame FROM `groups` ORDER BY created_at ASC'
    )
    const [members] = await db.query<any[]>(
      'SELECT group_id AS groupId, user_id AS userId, role, status, joined_at AS joinedAt FROM group_members'
    )
    const [expenseRows] = await db.query<any[]>(
      'SELECT id, group_id AS groupId, created_by AS createdBy, category_id AS categoryId, title, total_amount AS total, split_type AS splitType, expense_date AS date, description AS note, status, created_at AS createdAt, updated_at AS updatedAt FROM expenses ORDER BY expense_date DESC, created_at DESC'
    )
    const [payerRows] = await db.query<any[]>(
      'SELECT expense_id AS expenseId, user_id AS userId, paid_amount AS paidAmount FROM expense_payers'
    )
    const [splitRows] = await db.query<any[]>(
      'SELECT expense_id AS expenseId, user_id AS userId, share_amount AS share, share_value AS value FROM expense_splits'
    )
    const [settlements] = await db.query<any[]>(
      'SELECT id, group_id AS groupId, from_user_id AS fromId, to_user_id AS toId, amount, paid_at AS date, status, note FROM settlements ORDER BY paid_at DESC'
    )
    const [activity] = await db.query<any[]>(
      'SELECT id, group_id AS groupId, text, created_at AS at FROM activity_logs ORDER BY created_at DESC LIMIT 30'
    )

    const payersByExpense = new Map<string, string>()
    for (const p of payerRows) {
      if (!payersByExpense.has(p.expenseId)) payersByExpense.set(p.expenseId, p.userId)
    }
    const splitsByExpense = new Map<string, { userId: string; share: number; value: number }[]>()
    for (const s of splitRows) {
      const list = splitsByExpense.get(s.expenseId) ?? []
      list.push({ userId: s.userId, share: Number(s.share), value: Number(s.value) })
      splitsByExpense.set(s.expenseId, list)
    }

    const expenses = expenseRows.map(e => ({
      id: e.id,
      groupId: e.groupId,
      title: e.title,
      total: Number(e.total),
      categoryId: e.categoryId,
      date: String(e.date).slice(0, 10),
      payerId: payersByExpense.get(e.id) || e.createdBy,
      splitType: e.splitType,
      splits: splitsByExpense.get(e.id) ?? [],
      note: e.note || '',
      status: e.status,
      createdBy: e.createdBy,
      createdAt: String(e.createdAt),
      updatedAt: String(e.createdAt)
    }))

    return {
      connected: true,
      authenticated: true,
      user: currentUser,
      data: {
        users,
        categories: categories.map(c => ({
          id: c.id,
          name: c.name,
          kind: c.kind,
          sticker: c.sticker,
          hint: c.hint,
          isDefault: Boolean(c.is_default)
        })),
        transactions: transactions.map(t => ({
          ...t,
          amount: Number(t.amount),
          date: String(t.date).slice(0, 10)
        })),
        groups: groups.map(g => ({
          ...g,
          createdAt: String(g.createdAt).slice(0, 10)
        })),
        members: members.map(m => ({
          ...m,
          joinedAt: String(m.joinedAt).slice(0, 10)
        })),
        expenses,
        settlements: settlements.map(s => ({
          ...s,
          amount: Number(s.amount),
          date: String(s.date).slice(0, 10)
        })),
        activity: activity.map(a => ({
          id: a.id,
          groupId: a.groupId || undefined,
          text: a.text,
          at: String(a.at)
        }))
      }
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err?.message || 'Lỗi kết nối MySQL'
    })
  }
})
