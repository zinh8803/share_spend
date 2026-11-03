<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import { vnd } from '~/utils/money'

const store = useAppStore()
const q = ref('')
const monthFilter = ref('all')
const typeFilter = ref<'all' | 'income' | 'expense'>('all')
const categoryFilter = ref('all')

const monthChoices = computed(() => {
  const set = new Set<string>()
  for (const t of store.transactions) if (t.date) set.add(t.date.slice(0, 7))
  return [...set].sort().reverse()
})

const filtered = computed(() =>
  store.transactions
    .filter(t => {
      if (monthFilter.value !== 'all' && !t.date.startsWith(monthFilter.value)) return false
      if (typeFilter.value !== 'all' && t.type !== typeFilter.value) return false
      if (categoryFilter.value !== 'all' && t.categoryId !== categoryFilter.value) return false
      if (q.value.trim()) {
        const needle = q.value.trim().toLowerCase()
        if (!t.description.toLowerCase().includes(needle) && !t.note.toLowerCase().includes(needle)) return false
      }
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date))
)

const totals = computed(() => {
  let income = 0, expense = 0
  for (const t of filtered.value) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense, balance: income - expense }
})

const methodLabel: Record<string, string> = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  other: 'Khác'
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold">Giao dịch cá nhân</h1>
        <p class="text-sm text-ink-soft mt-1">
          Ghi chép thu nhập và chi tiêu riêng của bạn. Chi phí nhóm được tách riêng để không tính trùng.
        </p>
      </div>
      <div class="flex flex-wrap gap-2.5">
        <NuxtLink to="/categories" class="btn">Quản lý danh mục</NuxtLink>
        <NuxtLink to="/transactions/new" class="btn btn-ink">Thêm thu chi</NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="panel p-4 bg-[var(--color-gain-bg)]">
        <div class="text-xs font-semibold text-ink/75">Tổng thu theo bộ lọc</div>
        <div class="text-2xl font-extrabold num mt-1 gain">{{ vnd(totals.income) }}</div>
      </div>
      <div class="panel p-4 bg-[var(--color-loss-bg)]">
        <div class="text-xs font-semibold text-ink/75">Tổng chi theo bộ lọc</div>
        <div class="text-2xl font-extrabold num mt-1 loss">{{ vnd(totals.expense) }}</div>
      </div>
      <div class="panel p-4 bg-butter">
        <div class="text-xs font-semibold text-ink/75">Số dư (Thu − Chi)</div>
        <div class="text-2xl font-extrabold num mt-1">{{ vnd(totals.balance) }}</div>
      </div>
    </div>

    <div class="panel p-5 sm:p-6 flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
        <div>
          <label for="tx-search" class="field-label">Tìm theo nội dung hoặc ghi chú</label>
          <input
            id="tx-search"
            v-model="q"
            type="search"
            class="field"
            placeholder="Ví dụ: cà phê, lương, tiền điện..."
          />
        </div>

        <div>
          <label for="tx-month" class="field-label">Tháng</label>
          <select id="tx-month" v-model="monthFilter" class="field">
            <option value="all">Tất cả các tháng</option>
            <option v-for="m in monthChoices" :key="m" :value="m">
              Tháng {{ m.slice(5, 7) }}/{{ m.slice(0, 4) }}
            </option>
          </select>
        </div>

        <div>
          <label for="tx-type" class="field-label">Loại giao dịch</label>
          <select id="tx-type" v-model="typeFilter" class="field">
            <option value="all">Thu & Chi</option>
            <option value="expense">Khoản chi</option>
            <option value="income">Khoản thu</option>
          </select>
        </div>

        <div>
          <label for="tx-cat" class="field-label">Danh mục</label>
          <select id="tx-cat" v-model="categoryFilter" class="field">
            <option value="all">Mọi danh mục</option>
            <option v-for="c in store.categories" :key="c.id" :value="c.id">
              {{ c.name }} ({{ c.kind === 'income' ? 'Thu' : 'Chi' }})
            </option>
          </select>
        </div>
      </div>

      <div v-if="filtered.length" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-xs font-extrabold text-ink-soft border-b-2 border-ink">
              <th class="py-2.5 pr-3">Nội dung</th>
              <th class="py-2.5 px-3">Danh mục</th>
              <th class="py-2.5 px-3">Phương thức</th>
              <th class="py-2.5 px-3">Ngày</th>
              <th class="py-2.5 px-3 text-right">Số tiền</th>
              <th class="py-2.5 pl-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="t in filtered"
              :key="t.id"
              class="row-line text-sm"
            >
              <td class="py-3 pr-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-[8px] border-2 border-ink bg-ground flex items-center justify-center shrink-0">
                    <img
                      :src="`/stickers/${store.category(t.categoryId)?.sticker || 'khac'}.png`"
                      :alt="store.category(t.categoryId)?.name || 'Danh mục'"
                      class="w-7 h-7 object-contain"
                    />
                  </div>
                  <div>
                    <div class="font-bold text-ink">{{ t.description }}</div>
                    <div v-if="t.note" class="hand text-base text-ink-soft">{{ t.note }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-3">
                <span class="chip" :class="t.type === 'income' ? 'bg-[var(--color-gain-bg)]' : 'bg-ground'">
                  {{ store.category(t.categoryId)?.name }}
                </span>
              </td>
              <td class="py-3 px-3 text-ink-soft">{{ methodLabel[t.method] }}</td>
              <td class="py-3 px-3 num">{{ t.date }}</td>
              <td
                class="py-3 px-3 text-right font-extrabold text-base num"
                :class="t.type === 'income' ? 'gain' : 'loss'"
              >
                {{ vnd(t.type === 'income' ? t.amount : -t.amount, { sign: true }) }}
              </td>
              <td class="py-3 pl-3 text-right whitespace-nowrap">
                <NuxtLink :to="`/transactions/new?edit=${t.id}`" class="text-xs font-semibold underline mr-3">
                  Sửa
                </NuxtLink>
                <button
                  type="button"
                  class="text-xs font-semibold underline loss cursor-pointer"
                  @click="store.deleteTransaction(t.id)"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <DoodleScene
        v-else
        seed="empty-transactions"
        title="Không có giao dịch nào khớp bộ lọc"
        caption="Thử xóa từ khóa tìm kiếm hoặc ghi nhận một khoản thu chi mới."
        sticker="ca-phe"
      >
        <NuxtLink to="/transactions/new" class="btn btn-ink">Thêm giao dịch đầu tiên</NuxtLink>
      </DoodleScene>
    </div>
  </div>
</template>

