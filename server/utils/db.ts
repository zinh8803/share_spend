import fs from 'node:fs'
import path from 'node:path'
import mysql, { type Pool, type PoolConnection } from 'mysql2/promise'

let pool: Pool | null = null
let schemaReady = false

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

