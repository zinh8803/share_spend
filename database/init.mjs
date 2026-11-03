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
      DELETE FROM groups;
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

