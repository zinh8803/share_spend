// Money is always an integer number of đồng. Never float.

const fmt = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

export function vnd(amount: number, opts: { sign?: boolean } = {}): string {
  const abs = fmt.format(Math.abs(Math.round(amount)))
  if (opts.sign) {
    if (amount > 0) return `+${abs}đ`
    if (amount < 0) return `−${abs}đ`
  } else if (amount < 0) {
    return `−${abs}đ`
  }
  return `${abs}đ`
}

/** Short form for tight spots: 375k, 4,2tr */
export function vndShort(amount: number): string {
  const a = Math.abs(amount)
  const s = amount < 0 ? '−' : ''
  if (a >= 1_000_000) return `${s}${(a / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`
  if (a >= 1_000) return `${s}${Math.round(a / 1_000)}k`
  return `${s}${a}đ`
}

/** Parse what people type: "125.000", "125k", "1,2tr" */
export function parseVnd(input: string): number {
  const raw = input.trim().toLowerCase().replace(/\s/g, '')
  if (!raw) return 0
  const tr = raw.match(/^([\d.,]+)(tr|m)$/)
  if (tr) return Math.round(parseFloat(tr[1].replace(/\./g, '').replace(',', '.')) * 1_000_000)
  const k = raw.match(/^([\d.,]+)k$/)
  if (k) return Math.round(parseFloat(k[1].replace(/\./g, '').replace(',', '.')) * 1_000)
  const digits = raw.replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export type SplitType = 'equal' | 'exact' | 'percent' | 'shares'

/**
 * Distribute `total` across weights so the parts are integers and sum exactly to total.
 * Remainder đồng go to participants in list order (consistent rounding rule).
 */
export function distribute(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  if (sum <= 0 || weights.length === 0) return weights.map(() => 0)
  const raw = weights.map(w => (total * w) / sum)
  const parts = raw.map(Math.floor)
  let rest = total - parts.reduce((a, b) => a + b, 0)
  // largest fractional remainder first, ties by list order
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)
  for (let k = 0; rest > 0; k = (k + 1) % order.length, rest--) parts[order[k].i]++
  return parts
}

export interface SplitInput { userId: string; value: number }

export interface SplitResult { ok: boolean; shares: Record<string, number>; error?: string; allocated: number }

export function computeSplit(total: number, type: SplitType, inputs: SplitInput[]): SplitResult {
  const ids = inputs.map(i => i.userId)
  if (ids.length === 0) return { ok: false, shares: {}, allocated: 0, error: 'Chọn ít nhất một người chịu chi phí.' }
  if (total <= 0) return { ok: false, shares: {}, allocated: 0, error: 'Nhập số tiền lớn hơn 0.' }
  let parts: number[] = []
  if (type === 'equal') parts = distribute(total, ids.map(() => 1))
  else if (type === 'shares') {
    if (inputs.some(i => i.value < 0)) return { ok: false, shares: {}, allocated: 0, error: 'Số phần không được âm.' }
    if (inputs.reduce((a, i) => a + i.value, 0) <= 0) return { ok: false, shares: {}, allocated: 0, error: 'Tổng số phần phải lớn hơn 0.' }
    parts = distribute(total, inputs.map(i => i.value))
  } else if (type === 'percent') {
    const pct = inputs.reduce((a, i) => a + i.value, 0)
    if (Math.abs(pct - 100) > 0.001) {
      return { ok: false, shares: {}, allocated: Math.round((total * pct) / 100), error: `Tổng tỷ lệ đang là ${pct.toLocaleString('vi-VN')}%, cần đúng 100%.` }
    }
    parts = distribute(total, inputs.map(i => i.value))
  } else {
    parts = inputs.map(i => Math.round(i.value))
    const allocated = parts.reduce((a, b) => a + b, 0)
    if (allocated !== total) {
      const diff = total - allocated
      return {
        ok: false, shares: {}, allocated,
        error: diff > 0 ? `Còn thiếu ${vnd(diff)} chưa chia cho ai.` : `Đang chia dư ${vnd(-diff)} so với hóa đơn.`
      }
    }
  }
  const shares: Record<string, number> = {}
  ids.forEach((id, i) => { shares[id] = parts[i] })
  return { ok: true, shares, allocated: total }
}

