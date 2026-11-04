import fs from 'node:fs'
import path from 'node:path'
import mysql, { type Pool, type PoolConnection } from 'mysql2/promise'

let pool: Pool | null = null
let schemaReady = false
let activityMigrated = false

function getMysqlConfig() {
  const rc = useRuntimeConfig()
  return {
    host: process.env.MYSQL_HOST || rc.mysql?.host || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || rc.mysql?.port || 3306),
    user: process.env.MYSQL_USER || rc.mysql?.user || 'root',
    password: process.env.MYSQL_PASSWORD ?? rc.mysql?.password ?? '',
    database: process.env.MYSQL_DATABASE || rc.mysql?.database || 'sharespend'
  }
}

export async function ensureDb(): Promise<Pool> {
  const cfg = getMysqlConfig()
  if (!schemaReady) {
    const bootstrap = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      multipleStatements: true
    })
    const schemaPath = path.resolve(process.cwd(), 'database/schema.sql')
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8')
      await bootstrap.query(sql)
    } else {
      await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    }
    await bootstrap.end()
    schemaReady = true
  }

  if (!pool) {
    pool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true
    })
  }

  // Auto-migrate role column into users and ensure feedbacks table
  if (!activityMigrated && pool) {
    try {
      const [roleCols] = await pool.query<any[]>('SHOW COLUMNS FROM users LIKE "role"')
      if (!roleCols.length) {
        await pool.query("ALTER TABLE users ADD COLUMN `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER `password_hash`")
      }

      const [adminRows] = await pool.query<any[]>("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'")
      if (!adminRows[0]?.total) {
        const [firstUser] = await pool.query<any[]>("SELECT id FROM users ORDER BY created_at ASC LIMIT 1")
        if (firstUser.length > 0) {
          await pool.execute("UPDATE users SET role = 'admin' WHERE id = ?", [firstUser[0].id])
        }
      }

      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`feedbacks\` (
          \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
          \`user_id\` VARCHAR(36) DEFAULT NULL,
          \`email\` VARCHAR(190) NOT NULL,
          \`content\` TEXT NOT NULL,
          \`status\` ENUM('pending', 'read', 'resolved') NOT NULL DEFAULT 'pending',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX \`idx_fb_user\` (\`user_id\`),
          INDEX \`idx_fb_status\` (\`status\`),
          INDEX \`idx_fb_created\` (\`created_at\` DESC)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      const [catCols] = await pool.query<any[]>('SHOW COLUMNS FROM categories LIKE "user_id"')
      if (!catCols.length) {
        await pool.query('ALTER TABLE categories ADD COLUMN `user_id` VARCHAR(36) DEFAULT NULL AFTER `id`, ADD COLUMN `group_id` VARCHAR(36) DEFAULT NULL AFTER `user_id`, ADD INDEX `idx_cat_user` (`user_id`), ADD INDEX `idx_cat_group` (`group_id`)')
      }
      await pool.query("UPDATE `categories` SET is_default = 1 WHERE id IN ('c-food', 'c-move', 'c-home', 'c-shop', 'c-health', 'c-fun', 'c-other', 'c-salary', 'c-side')")

      const [cols] = await pool.query<any[]>('SHOW COLUMNS FROM activity_logs LIKE "user_id"')
      if (!cols.length) {
        await pool.query('ALTER TABLE activity_logs ADD COLUMN `user_id` VARCHAR(36) DEFAULT NULL AFTER `group_id`, ADD INDEX `idx_act_user` (`user_id`)')
      }

      // Backfill user_id for existing records where user_id is NULL
      const [users] = await pool.query<any[]>('SELECT id, name FROM users ORDER BY CHAR_LENGTH(name) DESC')
      for (const u of users) {
        if (!u.name) continue
        await pool.execute(
          'UPDATE activity_logs SET user_id = ? WHERE user_id IS NULL AND (text LIKE ? OR text LIKE ?)',
          [u.id, `${u.name} %`, `% ${u.name} %`]
        )
      }

      // Fallback: assign remaining group activities to the group creator
      await pool.query(`
        UPDATE activity_logs a
        JOIN \`groups\` g ON a.group_id = g.id
        SET a.user_id = g.created_by
        WHERE a.user_id IS NULL
      `)

      activityMigrated = true
    } catch (_) {}
  }
  return pool
}

export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const db = await ensureDb()
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export async function checkMysqlHealth() {
  const cfg = getMysqlConfig()
  try {
    const db = await ensureDb()
    const [rows] = await db.query<any[]>('SELECT COUNT(*) AS usersCount FROM users')
    return {
      connected: true,
      host: cfg.host,
      port: cfg.port,
      database: cfg.database,
      user: cfg.user,
      usersCount: Number(rows[0]?.usersCount ?? 0)
    }
  } catch (err: any) {
    return {
      connected: false,
      host: cfg.host,
      port: cfg.port,
      database: cfg.database,
      user: cfg.user,
      error: err?.message || 'Không thể kết nối MySQL'
    }
  }
}

