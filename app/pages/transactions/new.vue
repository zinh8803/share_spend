<script setup lang="ts">
import { useAppStore, todayIso, type TxType, type PayMethod } from '~/stores/app'
import { parseVnd, vnd } from '~/utils/money'

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const { t, tCategoryName, tPaymentMethod } = useI18n()

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
  store.categories.filter(c => c.kind === type.value && (!c.groupId || c.id === categoryId.value))
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

const quickPresets = computed(() => [
  { label: t('nav.transactions') === 'Transactions' ? 'Breakfast 30k' : 'Ăn sáng 30k', amount: '30000', desc: t('nav.transactions') === 'Transactions' ? 'Breakfast' : 'Ăn sáng', cat: 'c-food', type: 'expense' as TxType },
  { label: t('nav.transactions') === 'Transactions' ? 'Lunch 50k' : 'Cơm trưa 50k', amount: '50000', desc: t('nav.transactions') === 'Transactions' ? 'Office lunch' : 'Ăn trưa văn phòng', cat: 'c-food', type: 'expense' as TxType },
  { label: t('nav.transactions') === 'Transactions' ? 'Gas 100k' : 'Đổ xăng 100k', amount: '100000', desc: t('nav.transactions') === 'Transactions' ? 'Motorbike gas' : 'Đổ xăng xe máy', cat: 'c-move', type: 'expense' as TxType },
  { label: t('nav.transactions') === 'Transactions' ? 'Shopping 500k' : 'Mua sắm 500k', amount: '500000', desc: t('nav.transactions') === 'Transactions' ? 'Shopping' : 'Mua đồ cá nhân', cat: 'c-shop', type: 'expense' as TxType },
  { label: t('nav.transactions') === 'Transactions' ? 'Salary 12M' : 'Lương 12tr', amount: '12000000', desc: t('nav.transactions') === 'Transactions' ? 'Monthly salary' : 'Tiền lương tháng', cat: 'c-salary', type: 'income' as TxType }
])

function applyPreset(p: { label: string; amount: string; desc: string; cat: string; type: TxType }) {
  type.value = p.type
  amountInput.value = p.amount
  description.value = p.desc
  categoryId.value = p.cat
}

async function submit() {
  error.value = ''
  if (parsedAmount.value <= 0) {
    error.value = t('nav.transactions') === 'Transactions'
      ? 'Enter an amount greater than 0 (e.g. 35k or 1.2M).'
      : 'Nhập số tiền lớn hơn 0 (có thể gõ nhanh như 35k hoặc 1,2tr).'
    return
  }
  if (parsedAmount.value > 100_000_000_000) {
    error.value = t('nav.transactions') === 'Transactions'
      ? 'Maximum transaction amount is 100 billion VND.'
      : 'Số tiền tối đa cho một giao dịch là 100 tỷ đồng (100.000.000.000đ).'
    return
  }
  if (!description.value.trim()) {
    error.value = t('nav.transactions') === 'Transactions'
      ? 'Please enter a description for this transaction.'
      : 'Nhập nội dung giao dịch để dễ tra cứu lại sau này.'
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
          {{ t('tx.backToList') }}
        </NuxtLink>
        <h1 class="text-3xl font-extrabold mt-1">
          {{ editId ? t('tx.editTitle') : t('tx.newTitle') }}
        </h1>
      </div>
      <div v-if="selectedCategory" class="w-16 h-16 rounded-[12px] border-[3px] border-ink bg-butter flex items-center justify-center">
        <img :src="`/stickers/${selectedCategory.sticker}.png`" :alt="tCategoryName(selectedCategory)" class="w-12 h-12 object-contain" />
      </div>
    </div>

    <div class="panel p-6 sm:p-8 flex flex-col gap-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="seg" role="group" :aria-label="t('tx.type')">
          <button type="button" :aria-pressed="type === 'expense'" @click="type = 'expense'">
            {{ t('common.expense') }}
          </button>
          <button type="button" :aria-pressed="type === 'income'" @click="type = 'income'">
            {{ t('common.income') }}
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
            <label for="tx-amount" class="field-label">{{ t('tx.amountLabel') }}</label>
            <input
              id="tx-amount"
              v-model="amountInput"
              type="text"
              inputmode="numeric"
              class="field font-extrabold text-lg num"
              placeholder="50000, 50k, 1.2tr..."
            />
            <div v-if="parsedAmount > 0" class="hand text-lg text-lilac-deep mt-1">
              {{ t('tx.willRecord', { amount: vnd(parsedAmount) }) }}
            </div>
          </div>

          <div>
            <label for="tx-date" class="field-label">{{ t('common.date') }}</label>
            <input id="tx-date" v-model="date" type="date" class="field num" />
          </div>
        </div>

        <div>
          <label class="field-label">{{ t('tx.category') }}</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              v-for="c in availableCategories"
              :key="c.id"
              type="button"
              class="flex flex-col items-center gap-1.5 p-3 rounded-[12px] border-2 border-ink text-center cursor-pointer transition-transform"
              :class="categoryId === c.id ? 'bg-lilac outline-4 outline-pink -translate-y-0.5' : 'bg-paper hover:bg-ground'"
              @click="categoryId = c.id"
            >
              <img :src="`/stickers/${c.sticker}.png`" :alt="tCategoryName(c)" class="w-10 h-10 object-contain" />
              <span class="text-sm font-bold">{{ tCategoryName(c) }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="tx-desc" class="field-label">{{ t('tx.descLabel') }}</label>
            <input
              id="tx-desc"
              v-model="description"
              type="text"
              class="field"
              :placeholder="t('tx.descPlaceholder')"
            />
          </div>

          <div>
            <label for="tx-method" class="field-label">{{ t('tx.method') }}</label>
            <select id="tx-method" v-model="method" class="field">
              <option value="transfer">{{ tPaymentMethod('transfer') }}</option>
              <option value="cash">{{ tPaymentMethod('cash') }}</option>
              <option value="other">{{ tPaymentMethod('other') }}</option>
            </select>
          </div>
        </div>

        <div>
          <label for="tx-note" class="field-label">{{ t('tx.noteLabel') }}</label>
          <input
            id="tx-note"
            v-model="note"
            type="text"
            class="field"
            :placeholder="t('feedback.contentPlaceholder')"
          />
        </div>

        <p v-if="error" role="alert" class="field-error">{{ error }}</p>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" class="btn btn-ink">
            {{ editId ? t('common.saveChanges') : t('tx.saveBtn') }}
          </button>
          <NuxtLink to="/transactions" class="btn">{{ t('common.cancel') }}</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

