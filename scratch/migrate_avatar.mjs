import mysql from 'mysql2/promise'

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: 'sharespend'
  })

  const [cols] = await conn.query('SHOW COLUMNS FROM users')
  const names = cols.map(c => c.Field)

  if (!names.includes('gender')) {
    await conn.query("ALTER TABLE users ADD COLUMN gender VARCHAR(16) NOT NULL DEFAULT 'male'")
    console.log('Added gender column')
  }
  if (!names.includes('avatar')) {
    await conn.query("ALTER TABLE users ADD COLUMN avatar VARCHAR(64) NOT NULL DEFAULT 'boy-cool'")
    console.log('Added avatar column')
  }

  const [updatedCols] = await conn.query('SHOW COLUMNS FROM users')
  console.log('Updated columns:', updatedCols.map(c => c.Field))

  const [users] = await conn.query('SELECT id, name, gender, avatar FROM users')
  console.log('Users:', users)

  await conn.end()
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})

