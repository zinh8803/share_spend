import fs from 'node:fs'
import path from 'node:path'
import mysql from 'mysql2/promise'

// Load .env if present
const envPath = path.resolve('.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
  }
}

const config = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  multipleStatements: true
}

console.log(`Đang kết nối MySQL tại ${config.host}:${config.port} (user: ${config.user})...`)

try {
  const conn = await mysql.createConnection(config)
  const sql = fs.readFileSync(path.resolve('database/schema.sql'), 'utf8')
  await conn.query(sql)

  const dbName = process.env.MYSQL_DATABASE || 'sharespend'
  await conn.query(`USE \`${dbName}\`;`)

  // Tự động bổ sung cột user_id vào bảng activity_logs nếu chưa có
  try {
    const [cols] = await conn.query('SHOW COLUMNS FROM `activity_logs` LIKE "user_id"')
    if (!cols.length) {
      await conn.query('ALTER TABLE `activity_logs` ADD COLUMN `user_id` VARCHAR(36) DEFAULT NULL AFTER `group_id`, ADD INDEX `idx_act_user` (`user_id`)')
      console.log('✔ Đã tự động thêm cột user_id vào bảng activity_logs thành công.')
    } else {
      console.log('✔ Bảng activity_logs đã có cột user_id.')
    }

    // Cập nhật hồi tố user_id cho các hoạt động cũ trước đó (Backfill)
    const [unassigned] = await conn.query('SELECT COUNT(*) AS total FROM `activity_logs` WHERE user_id IS NULL')
    const nullCount = unassigned[0]?.total || 0
    if (nullCount > 0) {
      console.log(`Đang tìm và gán user_id cho ${nullCount} hoạt động cũ trong lịch sử...`)

      // Bước 1: Khớp theo tên user ở đầu câu hoặc trong câu
      const [users] = await conn.query('SELECT id, name FROM `users` ORDER BY CHAR_LENGTH(name) DESC')
      for (const u of users) {
        if (!u.name) continue
        await conn.execute(
          'UPDATE `activity_logs` SET user_id = ? WHERE user_id IS NULL AND (text LIKE ? OR text LIKE ?)',
          [u.id, `${u.name} %`, `% ${u.name} %`]
        )
      }

      // Bước 2: Với các hoạt động nhóm còn lại, gán cho chủ nhóm (người tạo nhóm)
      await conn.query(`
        UPDATE \`activity_logs\` a
        JOIN \`groups\` g ON a.group_id = g.id
        SET a.user_id = g.created_by
        WHERE a.user_id IS NULL
      `)

      const [rem] = await conn.query('SELECT COUNT(*) AS total FROM `activity_logs` WHERE user_id IS NULL')
      const remainingCount = rem[0]?.total || 0
      console.log(`✔ Đã cập nhật xong! Các hoạt động cũ đã được gán user_id tương ứng (chưa rõ chủ thể: ${remainingCount}).`)
    }
  } catch (err) {
    console.error('Lỗi khi kiểm tra / cập nhật user_id:', err.message)
  }
  if (process.argv.includes('--reset')) {
    await conn.query(`
      USE sharespend;
      DELETE FROM activity_logs;
      DELETE FROM settlements;
      DELETE FROM expense_splits;
      DELETE FROM expense_payers;
      DELETE FROM expenses;
      DELETE FROM invitations;
      DELETE FROM group_members;
      DELETE FROM \`groups\`;
      DELETE FROM transactions;
      DELETE FROM users;
    `)
    console.log('Đã xóa sạch dữ liệu giao dịch/nhóm/user mẫu, chỉ giữ lại danh mục mặc định.')
  }
  console.log('Đã tạo database sharespend và 13 bảng thành công!')
  await conn.end()
} catch (err) {
  console.error('Không thể kết nối MySQL:', err.message)
  console.error('Hãy kiểm tra MySQL/XAMPP/Laragon/Docker đã bật chưa và thông số trong file .env.')
  process.exit(1)
}

