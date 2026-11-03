import { ensureDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = String(query.code || '').trim().toUpperCase()

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu mã mời nhóm.' })
  }

  const db = await ensureDb()
  const [groups] = await db.query<any[]>(
    'SELECT id, name, description, group_type AS type, status, created_by AS createdBy, invite_code AS inviteCode, frame, created_at AS createdAt FROM `groups` WHERE UPPER(invite_code) = ? LIMIT 1',
    [code]
  )

  if (!groups.length) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy nhóm với mã mời này.' })
  }

  const group = groups[0]

  const [creatorRows] = await db.query<any[]>(
    'SELECT name, frame, avatar FROM users WHERE id = ? LIMIT 1',
    [group.createdBy]
  )
  const creator = creatorRows[0] || { name: 'Thành viên', frame: '#C9B6FF', avatar: 'boy-cool' }

  const [members] = await db.query<any[]>(
    `SELECT gm.user_id AS id, u.name, u.frame, u.avatar
     FROM group_members gm
     JOIN users u ON gm.user_id = u.id
     WHERE gm.group_id = ? AND gm.status = 'active'
     LIMIT 8`,
    [group.id]
  )

  const [countRow] = await db.query<any[]>(
    'SELECT COUNT(*) AS total FROM group_members WHERE group_id = ? AND status = "active"',
    [group.id]
  )

  return {
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      type: group.type,
      status: group.status,
      inviteCode: group.inviteCode,
      frame: group.frame,
      createdAt: String(group.createdAt).slice(0, 10),
      creatorName: creator.name,
      creatorFrame: creator.frame,
      creatorAvatar: creator.avatar,
      memberCount: Number(countRow[0]?.total ?? members.length),
      members: members.map(m => ({
        id: m.id,
        name: m.name,
        frame: m.frame,
        avatar: m.avatar
      }))
    }
  }
})

