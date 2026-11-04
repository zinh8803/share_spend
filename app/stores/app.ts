import { defineStore } from 'pinia'
import { type SplitType } from '~/utils/money'

export type TxType = 'income' | 'expense'
export type PayMethod = 'cash' | 'transfer' | 'other'
export type GroupType = 'friends' | 'family' | 'company' | 'other'
export type Role = 'owner' | 'member'

export type Gender = 'male' | 'female'
export interface AvatarPreset {
  id: string
  label: string
  gender: Gender
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'boy-cool', label: 'Cool ngầu', gender: 'male' },
  { id: 'boy-glasses', label: 'Kính thư sinh', gender: 'male' },
  { id: 'boy-cap', label: 'Nón kết', gender: 'male' },
  { id: 'boy-curly', label: 'Tóc xoăn', gender: 'male' },
  { id: 'boy-hoodie', label: 'Áo hoodie', gender: 'male' },
  { id: 'boy-chill', label: 'Thư giãn', gender: 'male' },
  { id: 'girl-bun', label: 'Búi củ tỏi', gender: 'female' },
  { id: 'girl-long', label: 'Tóc dài', gender: 'female' },
  { id: 'girl-short', label: 'Tóc ngắn', gender: 'female' },
  { id: 'girl-glasses', label: 'Kính cận', gender: 'female' },
  { id: 'girl-bangs', label: 'Mái ngố', gender: 'female' },
  { id: 'girl-cute', label: 'Dễ thương', gender: 'female' }
]

export interface User {
  id: string
  name: string
  email: string
  frame: string
  gender?: Gender
  avatar?: string
  currency?: string
  timezone?: string
}
export interface Category { id: string; name: string; kind: TxType; sticker: string; hint: string; isDefault: boolean }
export interface Transaction { id: string; type: TxType; amount: number; categoryId: string; description: string; date: string; method: PayMethod; note: string }
export interface Group { id: string; name: string; description: string; type: GroupType; status: 'active' | 'archived'; createdBy: string; inviteCode: string; createdAt: string; frame: string }
export interface Member { groupId: string; userId: string; role: Role; status: 'active' | 'left'; joinedAt: string }
export interface Split { userId: string; share: number; value: number }
export interface Expense { id: string; groupId: string; title: string; total: number; categoryId: string; date: string; payerId: string; splitType: SplitType; splits: Split[]; note: string; status: 'active' | 'deleted'; createdBy: string; createdAt: string; updatedAt: string }
export interface Settlement { id: string; groupId: string; fromId: string; toId: string; amount: number; date: string; status: 'pending' | 'confirmed' | 'cancelled'; note: string }
export interface Activity { id: string; groupId?: string; userId?: string; text: string; at: string }

export type DebtStatus = 'pending' | 'partial' | 'paid'
export interface Debt { groupId: string; fromId: string; toId: string; gross: number; paid: number; remaining: number; pendingAmount: number; status: DebtStatus }

export const FRAMES = ['#C9B6FF', '#A8D8FF', '#FFD6E2', '#FFF1A8', '#CDEFD9', '#FFDDBF']

let seq = 1000
const uid = (p: string) => `${p}_${Date.now().toString(36)}${(seq++).toString(36)}`
const nowIso = () => new Date().toISOString()
export const todayIso = () => new Date().toISOString().slice(0, 10)

export const useAppStore = defineStore('app', {
  state: () => ({
    users: [] as User[],
    categories: [] as Category[],
    transactions: [] as Transaction[],
    groups: [] as Group[],
    members: [] as Member[],
    expenses: [] as Expense[],
    settlements: [] as Settlement[],
    activity: [] as Activity[],
    meId: '',
    loggedIn: false,
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    seenDebts: {} as Record<string, number>,
    hydrated: false,
    loading: false,
    dbStatus: 'checking' as 'checking' | 'connected' | 'error',
    dbInfo: 'Đang kết nối...'
  }),
  getters: {
    me(s): User {
      return s.users.find(u => u.id === s.meId) || {
        id: s.meId || 'guest',
        name: 'Khách',
        email: '',
        frame: '#C9B6FF',
        gender: 'male',
        avatar: 'boy-cool'
      }
    },
    user: s => (id: string) => s.users.find(u => u.id === id),
    category: s => (id: string) => s.categories.find(c => c.id === id),
    group: s => (id: string) => s.groups.find(g => g.id === id),

    myGroups(s): Group[] {
      const ids = new Set(s.members.filter(m => m.userId === s.meId && m.status === 'active').map(m => m.groupId))
      return s.groups.filter(g => ids.has(g.id))
    },
    groupMembers: s => (groupId: string, includeLeft = false) =>
      s.members.filter(m => m.groupId === groupId && (includeLeft || m.status === 'active')),
    groupExpenses: s => (groupId: string) =>
      s.expenses.filter(e => e.groupId === groupId && e.status === 'active').sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    groupSettlements: s => (groupId: string) =>
      s.settlements.filter(x => x.groupId === groupId).sort((a, b) => b.date.localeCompare(a.date)),

    /** Pairwise debts in a group, netted per pair, minus confirmed settlements */
    groupDebts(s) {
      return (groupId: string): Debt[] => {
        const owed = new Map<string, number>()
        const key = (a: string, b: string) => `${a}>${b}`
        for (const e of s.expenses) {
          if (e.groupId !== groupId || e.status !== 'active') continue
          for (const sp of e.splits) {
            if (sp.userId === e.payerId || !sp.share) continue
            owed.set(key(sp.userId, e.payerId), (owed.get(key(sp.userId, e.payerId)) || 0) + sp.share)
          }
        }
        const paidMap = new Map<string, number>()
        const pendMap = new Map<string, number>()
        for (const x of s.settlements) {
          if (x.groupId !== groupId) continue
          if (x.status === 'confirmed') paidMap.set(key(x.fromId, x.toId), (paidMap.get(key(x.fromId, x.toId)) || 0) + x.amount)
          if (x.status === 'pending') pendMap.set(key(x.fromId, x.toId), (pendMap.get(key(x.fromId, x.toId)) || 0) + x.amount)
        }
        const people = new Set<string>()
        for (const k of [...owed.keys(), ...paidMap.keys()]) k.split('>').forEach(p => people.add(p))
        const list = [...people].sort()
        const out: Debt[] = []
        for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
          const a = list[i], b = list[j]
          const net = (owed.get(key(a, b)) || 0) - (owed.get(key(b, a)) || 0)
          if (net === 0 && !paidMap.get(key(a, b)) && !paidMap.get(key(b, a))) continue
          const [from, to, gross] = net >= 0 ? [a, b, net] : [b, a, -net]
          const paid = (paidMap.get(key(from, to)) || 0) - (paidMap.get(key(to, from)) || 0)
          const remaining = gross - paid
          if (gross === 0 && remaining === 0) continue
          if (remaining < 0) {
            out.push({ groupId, fromId: to, toId: from, gross: -remaining, paid: 0, remaining: -remaining, pendingAmount: pendMap.get(key(to, from)) || 0, status: 'pending' })
            continue
          }
          out.push({
            groupId, fromId: from, toId: to, gross, paid: Math.max(0, paid), remaining,
            pendingAmount: pendMap.get(key(from, to)) || 0,
            status: remaining === 0 ? 'paid' : paid > 0 ? 'partial' : 'pending'
          })
        }
        return out.sort((x, y) => y.remaining - x.remaining)
      }
    },

    groupBalances(s) {
      return (groupId: string) => {
        const map: Record<string, { paid: number; share: number; net: number }> = {}
        const ensure = (id: string) => (map[id] ??= { paid: 0, share: 0, net: 0 })
        this.groupMembers(groupId, true).forEach(m => ensure(m.userId))
        for (const d of this.groupDebts(groupId)) { ensure(d.fromId).net -= d.remaining; ensure(d.toId).net += d.remaining }
        for (const e of s.expenses) {
          if (e.groupId !== groupId || e.status !== 'active') continue
          ensure(e.payerId).paid += e.total
          e.splits.forEach(sp => { ensure(sp.userId).share += sp.share })
        }
        return map
      }
    },

    allMyDebts(): Debt[] {
      return this.myGroups.flatMap(g => this.groupDebts(g.id)).filter(d => (d.fromId === this.meId || d.toId === this.meId) && d.remaining > 0)
    },
    myNet(): { receive: number; pay: number } {
      let receive = 0, pay = 0
      for (const d of this.allMyDebts) { if (d.toId === this.meId) receive += d.remaining; else pay += d.remaining }
      return { receive, pay }
    },
    myGroupShare(s) {
      return (month: string) => s.expenses
        .filter(e => e.status === 'active' && e.date.startsWith(month))
        .reduce((a, e) => a + (e.splits.find(sp => sp.userId === s.meId)?.share || 0), 0)
    },
    monthTotals(s) {
      return (month: string) => {
        let income = 0, expense = 0
        for (const t of s.transactions) if (t.date.startsWith(month)) t.type === 'income' ? (income += t.amount) : (expense += t.amount)
        return { income, expense, balance: income - expense }
      }
    },
    isDebtNew(s) {
      return (d: Debt) => {
        const k = `${d.groupId}:${d.fromId}>${d.toId}`
        return s.hydrated && k in s.seenDebts && s.seenDebts[k] !== d.remaining
      }
    }
  },
  actions: {
    getAuthHeaders(): Record<string, string> {
      const headers: Record<string, string> = {}
      if (typeof localStorage !== 'undefined') {
        const uid = localStorage.getItem('sharespend_uid')
        if (uid) headers['x-user-id'] = uid
      }
      return headers
    },

    async callApi(action: string, payload: Record<string, any>) {
      return await $fetch('/api/mutate', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: { action, payload }
      })
    },

    async hydrate(force = false) {
      if (this.hydrated && !force) return
      this.loading = true
      try {
        // Clear legacy localStorage cache if any existed
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('sharespend:v1')
        }
        const res = await $fetch<any>('/api/state', {
          headers: this.getAuthHeaders()
        })
        this.dbStatus = 'connected'
        this.dbInfo = 'Đã kết nối máy chủ'
        if (res.data) {
          this.$patch(res.data)
        }
        if (res.authenticated && res.user) {
          this.loggedIn = true
          this.meId = res.user.id
          this.currency = res.user.currency || 'VND'
          this.timezone = res.user.timezone || 'Asia/Ho_Chi_Minh'
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('sharespend_uid', res.user.id)
          }
        } else {
          this.loggedIn = false
          this.meId = ''
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('sharespend_uid')
          }
        }
        this.hydrated = true
        this.markAllDebtsSeen()
      } catch (e: any) {
        this.dbStatus = 'error'
        this.dbInfo = e?.data?.statusMessage || e?.message || 'Không thể kết nối tới máy chủ'
      } finally {
        this.loading = false
      }
    },

    markDebtSeen(d: Debt) { this.seenDebts[`${d.groupId}:${d.fromId}>${d.toId}`] = d.remaining },
    markAllDebtsSeen() {
      for (const g of this.groups) for (const d of this.groupDebts(g.id)) this.markDebtSeen(d)
    },
    async log(text: string, groupId?: string) {
      const item: Activity = { id: uid('a'), groupId, userId: this.meId, text, at: nowIso() }
      this.activity.unshift(item)
      await this.callApi('log', item).catch(() => {})
    },

    async login(email: string, password: string) {
      const res = await $fetch<any>('/api/auth', {
        method: 'POST',
        body: { mode: 'login', email, password }
      })
      if (res?.user) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sharespend_uid', res.user.id)
        }
        await this.hydrate(true)
      }
    },

    async register(name: string, email: string, password: string) {
      const res = await $fetch<any>('/api/auth', {
        method: 'POST',
        body: { mode: 'register', name, email, password }
      })
      if (res?.user) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sharespend_uid', res.user.id)
        }
        await this.hydrate(true)
      }
    },

    async logout() {
      await $fetch('/api/auth', { method: 'POST', body: { mode: 'logout' } })
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('sharespend_uid')
      }
      this.loggedIn = false
      this.meId = ''
      this.transactions = []
      this.groups = []
      this.members = []
      this.expenses = []
      this.settlements = []
      this.activity = []
    },

    async updateProfile(p: {
      name?: string
      email?: string
      frame?: string
      gender?: Gender
      avatar?: string
      currency?: string
      timezone?: string
    }) {
      const u = this.users.find(x => x.id === this.meId)
      if (!u) return
      if (p.name) u.name = p.name
      if (p.email) u.email = p.email
      if (p.frame) u.frame = p.frame
      if (p.gender) u.gender = p.gender
      if (p.avatar) u.avatar = p.avatar
      if (p.currency) this.currency = p.currency
      if (p.timezone) this.timezone = p.timezone
      await this.callApi('updateProfile', {
        id: u.id,
        name: u.name,
        email: u.email,
        frame: u.frame,
        gender: u.gender || 'male',
        avatar: u.avatar || 'boy-cool',
        currency: this.currency,
        timezone: this.timezone
      })
    },

    async saveTransaction(t: Omit<Transaction, 'id'> & { id?: string }) {
      const id = t.id || uid('t')
      const record: Transaction = { ...t, id }
      await this.callApi('saveTransaction', record)
      const i = this.transactions.findIndex(x => x.id === id)
      if (i >= 0) this.transactions[i] = record
      else this.transactions.unshift(record)
      return id
    },

    async deleteTransaction(id: string) {
      await this.callApi('deleteTransaction', { id })
      this.transactions = this.transactions.filter(t => t.id !== id)
    },

    async saveCategory(c: Omit<Category, 'id' | 'isDefault'> & { id?: string }) {
      const id = c.id || uid('c')
      const record: Category = { ...c, id, isDefault: false }
      await this.callApi('saveCategory', record)
      const existing = this.categories.find(x => x.id === id)
      if (existing) Object.assign(existing, record)
      else this.categories.push(record)
    },

    async deleteCategory(id: string): Promise<string | null> {
      const cat = this.categories.find(c => c.id === id)
      if (!cat) return null
      if (cat.isDefault) return 'Danh mục mặc định không xóa được.'
      const fallback = cat.kind === 'income' ? 'c-side' : 'c-other'
      await this.callApi('deleteCategory', { id, fallback })
      this.transactions.forEach(t => { if (t.categoryId === id) t.categoryId = fallback })
      this.expenses.forEach(e => { if (e.categoryId === id) e.categoryId = fallback })
      this.categories = this.categories.filter(c => c.id !== id)
      return null
    },

    async createGroup(p: { name: string; description: string; type: GroupType }) {
      const id = uid('g')
      const code = `${p.name.normalize('NFD').replace(/[^\w]/g, '').slice(0, 5).toUpperCase() || 'NHOM'}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const grp: Group = { id, ...p, status: 'active', createdBy: this.meId, inviteCode: code, createdAt: todayIso(), frame: FRAMES[this.groups.length % FRAMES.length] }
      await this.callApi('createGroup', grp)
      this.groups.push(grp)
      this.members.push({ groupId: id, userId: this.meId, role: 'owner', status: 'active', joinedAt: todayIso() })
      await this.log(`${this.me.name} tạo nhóm "${p.name}"`, id)
      return id
    },

    async joinByCode(code: string): Promise<{ ok: boolean; groupId?: string; error?: string }> {
      const trimmed = (code || '').trim().toUpperCase()
      if (!trimmed) {
        return { ok: false, error: 'Vui lòng nhập mã mời.' }
      }
      try {
        const res = await this.callApi('joinByCode', { code: trimmed }) as any
        if (!res?.ok || !res?.groupId) {
          return { ok: false, error: 'Không thể tham gia nhóm.' }
        }
        // Force refresh all state so group, members, and expenses are immediately loaded
        await this.hydrate(true)
        return { ok: true, groupId: res.groupId }
      } catch (e: any) {
        return {
          ok: false,
          error: e?.data?.statusMessage || e?.message || 'Không tìm thấy nhóm với mã này.'
        }
      }
    },

    async addMember(groupId: string, name: string, email: string): Promise<string | null> {
      const lower = email.toLowerCase()
      const exists = this.users.find(u => u.email.toLowerCase() === lower)
      const u = exists ?? { id: uid('u'), name, email: lower, frame: FRAMES[this.users.length % FRAMES.length] }
      const m = this.members.find(x => x.groupId === groupId && x.userId === u.id)
      if (m?.status === 'active') return `${u.name} đã ở trong nhóm.`
      const res = await this.callApi('upsertMember', { groupId, userId: u.id, role: m?.role || 'member', status: 'active', joinedAt: todayIso(), user: u }) as any
      const actualId = res?.userId || u.id
      u.id = actualId
      if (!this.users.some(x => x.id === actualId)) this.users.push(u)
      if (m) m.status = 'active'
      else this.members.push({ groupId, userId: actualId, role: 'member', status: 'active', joinedAt: todayIso() })
      await this.log(`${u.name} được thêm vào nhóm`, groupId)
      return null
    },

    async removeMember(groupId: string, userId: string): Promise<string | null> {
      const m = this.members.find(x => x.groupId === groupId && x.userId === userId)
      if (!m) return null
      if (m.role === 'owner') return 'Chủ nhóm cần chuyển quyền sở hữu trước khi rời nhóm.'
      await this.callApi('upsertMember', { groupId, userId, role: m.role, status: 'left', joinedAt: m.joinedAt })
      m.status = 'left'
      await this.log(`${this.user(userId)?.name} đã rời nhóm. Lịch sử và công nợ cũ vẫn được giữ.`, groupId)
      return null
    },

    async transferOwnership(groupId: string, toUserId: string) {
      await this.callApi('transferOwnership', { groupId, toUserId })
      this.members.forEach(m => { if (m.groupId === groupId) m.role = m.userId === toUserId ? 'owner' : 'member' })
      await this.log(`Quyền chủ nhóm được chuyển cho ${this.user(toUserId)?.name}`, groupId)
    },

    async setGroupStatus(groupId: string, status: 'active' | 'archived') {
      await this.callApi('setGroupStatus', { groupId, status })
      const g = this.group(groupId); if (g) g.status = status
      await this.log(status === 'archived' ? 'Nhóm đã được lưu trữ' : 'Nhóm hoạt động trở lại', groupId)
    },

    async saveExpense(e: Omit<Expense, 'id' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt'> & { id?: string }) {
      if (e.total <= 0 || e.total > 100_000_000_000) {
        throw new Error('Tổng hóa đơn không được vượt quá 100 tỷ đồng / lần thêm.')
      }
      if (e.id) {
        const cur = this.expenses.find(x => x.id === e.id)
        if (!cur || cur.status !== 'active') return null
        const updated: Expense = { ...cur, ...e, updatedAt: nowIso() }
        await this.callApi('saveExpense', updated)
        Object.assign(cur, updated)
        await this.log(`${this.me.name} sửa "${e.title}", công nợ đã được tính lại`, e.groupId)
        return cur.id
      }
      const id = uid('e')
      const record: Expense = { ...e, id, status: 'active', createdBy: this.meId, createdAt: nowIso(), updatedAt: nowIso() }
      await this.callApi('saveExpense', record)
      this.expenses.unshift(record)
      await this.log(`${this.me.name} thêm "${e.title}"`, e.groupId)
      return id
    },

    async deleteExpense(id: string) {
      const e = this.expenses.find(x => x.id === id)
      if (!e) return
      await this.callApi('deleteExpense', { id })
      e.status = 'deleted'; e.updatedAt = nowIso()
      await this.log(`${this.me.name} xóa "${e.title}". Công nợ liên quan đã được hủy.`, e.groupId)
    },

    async recordSettlement(p: { groupId: string; fromId: string; toId: string; amount: number; note: string; date: string }) {
      const status = p.toId === this.meId ? 'confirmed' : 'pending'
      const record: Settlement = { id: uid('s'), ...p, status }
      await this.callApi('recordSettlement', record)
      this.settlements.unshift(record)
      const from = this.user(p.fromId)?.name, to = this.user(p.toId)?.name
      await this.log(status === 'confirmed' ? `${to} xác nhận đã nhận ${from} trả` : `${from} ghi nhận đã trả ${to}, chờ xác nhận`, p.groupId)
    },

    async confirmSettlement(id: string) {
      const s = this.settlements.find(x => x.id === id); if (!s) return
      await this.callApi('updateSettlementStatus', { id, status: 'confirmed' })
      s.status = 'confirmed'
      await this.log(`${this.user(s.toId)?.name} xác nhận đã nhận tiền từ ${this.user(s.fromId)?.name}`, s.groupId)
    },

    async cancelSettlement(id: string) {
      const s = this.settlements.find(x => x.id === id); if (!s) return
      await this.callApi('updateSettlementStatus', { id, status: 'cancelled' })
      s.status = 'cancelled'
      await this.log(`Khoản thanh toán của ${this.user(s.fromId)?.name} đã bị hủy`, s.groupId)
    }
  }
})
