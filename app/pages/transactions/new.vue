<script setup lang="ts">
import { useAppStore, todayIso, type TxType, type PayMethod } from '~/stores/app'
import { parseVnd, vnd } from '~/utils/money'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const editId = computed(() => (typeof route.query.edit === 'string' ? route.query.edit : undefined))
const existing = computed(() => (editId.value ? store.transactions.find(t => t.id === editId.value) : undefined))

const type = ref<TxType>(existing.value?.type ?? 'expense')
const amountInput = ref(existing.value ? String(existing.value.amount) : '')
const categoryId = ref(existing.value?.categoryId ?? 'c-food')
const description = ref(existing.value?.description ?? '')
const date = ref(existing.value?.date ?? todayIso())
const method = ref<PayMethod>(existing.value?.method ?? 'transfer')
const note = ref(existing.value?.note ?? '')
const error = ref('')

const availableCategories = computed(() =>
  store.categories.filter(c => c.kind === type.value)
)

watch(existing, (tx) => {
  if (tx) {
    type.value = tx.type
    amountInput.value = String(tx.amount)
    categoryId.value = tx.categoryId
    description.value = tx.description
    date.value = tx.date
    method.value = tx.method
    note.value = tx.note || ''
  }
}, { immediate: true })

watch(type, (newType) => {
  if (!availableCategories.value.some(c => c.id === categoryId.value)) {
    categoryId.value = availableCategories.value[0]?.id ?? 'c-other'
  }
})

const parsedAmount = computed(() => parseVnd(amountInput.value))
const selectedCategory = computed(() => store.category(categoryId.value))

const quickPresets = [
  { label: 'Ăn sáng 30k', amount: '30000', desc: 'Ăn sáng', cat: 'c-food', type: 'expense' as TxType },
  { label: 'Cơm trưa 50k', amount: '50000', desc: 'Ăn trưa văn phòng', cat: 'c-food', type: 'expense' as TxType },
  { label: 'Đổ xăng 100k', amount: '100000', desc: 'Đổ xăng xe máy', cat: 'c-move', type: 'expense' as TxType },
  { label: 'Mua sắm 500k', amount: '500000', desc: 'Mua đồ cá nhân', cat: 'c-shop', type: 'expense' as TxType },
  { label: 'Lương 12tr', amount: '12000000', desc: 'Tiền lương tháng', cat: 'c-salary', type: 'income' as TxType }
]

function applyPreset(p: typeof quickPresets[number]) {
  type.value = p.type
  amountInput.value = p.amount
  description.value = p.desc
  categoryId.value = p.cat
}

async function submit() {
  error.value = ''
  if (parsedAmount.value <= 0) {
    error.value = 'Nhập số tiền lớn hơn 0 (có thể gõ nhanh như 35k hoặc 1,2tr).'
    return
  }
  if (parsedAmount.value > 100_000_000_000) {
    error.value = 'Số tiền tối đa cho một giao dịch là 100 tỷ đồng (100.000.000.000đ).'
    return
  }
  if (!description.value.trim()) {
    error.value = 'Nhập nội dung giao dịch để dễ tra cứu lại sau này.'
    return
  }
  await store.saveTransaction({
    id: editId.value,
    type: type.value,
    amount: parsedAmount.value,
    categoryId: categoryId.value,
    description: description.value.trim(),
    date: date.value,
    method: method.value,
    note: note.value.trim()
  })
  router.push('/transactions')
}
</script>

<template>
  <div class="max-w-3xl mx-auto flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <NuxtLink to="/transactions" class="text-sm font-semibold underline text-ink-soft hover:text-ink">
          Quay lại danh sách giao dịch
        </NuxtLink>
        <h1 class="text-3xl font-extrabold mt-1">
          {{ editId ? 'Chỉnh sửa giao dịch cá nhân' : 'Thêm giao dịch cá nhân' }}
        </h1>
      </div>
      <div v-if="selectedCategory" class="w-16 h-16 rounded-[12px] border-[3px] border-ink bg-butter flex items-center justify-center">
        <img :src="`/stickers/${selectedCategory.sticker}.png`" :alt="selectedCategory.name" class="w-12 h-12 object-contain" />
      </div>
    </div>

    <div class="panel p-6 sm:p-8 flex flex-col gap-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="seg" role="group" aria-label="Loại giao dịch">
          <button type="button" :aria-pressed="type === 'expense'" @click="type = 'expense'">
            Khoản chi (Expense)
          </button>
          <button type="button" :aria-pressed="type === 'income'" @click="type = 'income'">
            Khoản thu (Income)
          </button>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="p in quickPresets"
            :key="p.label"
            type="button"
            class="chip hover:bg-butter cursor-pointer"
            @click="applyPreset(p)"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="tx-amount" class="field-label">Số tiền (VND)</label>
            <input
              id="tx-amount"
              v-model="amountInput"
              type="text"
              inputmode="numeric"
              class="field font-extrabold text-lg num"
              placeholder="Ví dụ: 50000 hoặc 50k"
            />
            <div v-if="parsedAmount > 0" class="hand text-lg text-lilac-deep mt-1">
              Sẽ ghi nhận: {{ vnd(parsedAmount) }}
            </div>
          </div>

          <div>
            <label for="tx-date" class="field-label">Ngày giao dịch</label>
            <input id="tx-date" v-model="date" type="date" class="field num" />
          </div>
        </div>

        <div>
          <label class="field-label">Danh mục</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              v-for="c in availableCategories"
              :key="c.id"
              type="button"
              class="flex flex-col items-center gap-1.5 p-3 rounded-[12px] border-2 border-ink text-center cursor-pointer transition-transform"
              :class="categoryId === c.id ? 'bg-lilac outline-4 outline-pink -translate-y-0.5' : 'bg-paper hover:bg-ground'"
              @click="categoryId = c.id"
            >
              <img :src="`/stickers/${c.sticker}.png`" :alt="c.name" class="w-10 h-10 object-contain" />
              <span class="text-sm font-bold">{{ c.name }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="tx-desc" class="field-label">Nội dung</label>
            <input
              id="tx-desc"
              v-model="description"
              type="text"
              class="field"
              placeholder="Ví dụ: Cà phê muối, Lương tháng 10..."
            />
          </div>

          <div>
            <label for="tx-method" class="field-label">Phương thức thanh toán</label>
            <select id="tx-method" v-model="method" class="field">
              <option value="transfer">Chuyển khoản</option>
              <option value="cash">Tiền mặt</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div>
          <label for="tx-note" class="field-label">Ghi chú (tùy chọn)</label>
          <input
            id="tx-note"
            v-model="note"
            type="text"
            class="field"
            placeholder="Thêm ghi chú hoặc thông tin hóa đơn..."
          />
        </div>

        <p v-if="error" role="alert" class="field-error">{{ error }}</p>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" class="btn btn-ink">
            {{ editId ? 'Lưu thay đổi' : 'Lưu giao dịch' }}
          </button>
          <NuxtLink to="/transactions" class="btn">Hủy</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

