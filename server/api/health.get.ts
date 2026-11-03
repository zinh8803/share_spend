import { checkMysqlHealth } from '../utils/db'

export default defineEventHandler(async () => {
  return await checkMysqlHealth()
})

