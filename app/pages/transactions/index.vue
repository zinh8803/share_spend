<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import { vnd } from '~/utils/money'

const store = useAppStore()
const { t, tCategoryName, tPaymentMethod } = useI18n()
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
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold">{{ t('tx.title') }}</h1>
        <p class="text-sm text-ink-soft mt-1">
          {{ t('tx.subtitle') }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2.5">
        <NuxtLink to="/categories" class="btn">{{ t('tx.manageCategories') }}</NuxtLink>
        <NuxtLink to="/transactions/new" class="btn btn-ink">{{ t('header.addTx') }}</NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="panel p-4 bg-[var(--color-gain-bg)]">
        <div class="text-xs font-semibold text-ink/75">{{ t('tx.filteredIncome') }}</div>
        <div class="text-2xl font-extrabold num mt-1 gain">{{ vnd(totals.income) }}</div>
      </div>
      <div class="panel p-4 bg-[var(--color-loss-bg)]">
        <div class="text-xs font-semibold text-ink/75">{{ t('tx.filteredExpense') }}</div>
        <div class="text-2xl font-extrabold num mt-1 loss">{{ vnd(totals.expense) }}</div>
      </div>
      <div class="panel p-4 bg-butter">
        <div class="text-xs font-semibold text-ink/75">{{ t('tx.balance') }}</div>
        <div class="text-2xl font-extrabold num mt-1">{{ vnd(totals.balance) }}</div>
      </div>
    </div>

    <div class="panel p-5 sm:p-6 flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
        <div>
          <label for="tx-search" class="field-label">{{ t('tx.searchLabel') }}</label>
          <input
            id="tx-search"
            v-model="q"
            type="search"
            class="field"
            :placeholder="t('tx.searchPlaceholder')"
          />
        </div>

        <div>
          <label for="tx-month" class="field-label">{{ t('tx.month') }}</label>
          <select id="tx-month" v-model="monthFilter" class="field">
            <option value="all">{{ t('tx.allMonths') }}</option>
            <option v-for="m in monthChoices" :key="m" :value="m">
              {{ t('dashboard.monthFormat', { m: m.slice(5, 7), y: m.slice(0, 4) }) }}
            </option>
          </select>
        </div>

        <div>
          <label for="tx-type" class="field-label">{{ t('tx.type') }}</label>
          <select id="tx-type" v-model="typeFilter" class="field">
            <option value="all">{{ t('tx.allTypes') }}</option>
            <option value="expense">{{ t('common.expense') }}</option>
            <option value="income">{{ t('common.income') }}</option>
          </select>
        </div>

        <div>
          <label for="tx-cat" class="field-label">{{ t('tx.category') }}</label>
          <select id="tx-cat" v-model="categoryFilter" class="field">
            <option value="all">{{ t('tx.allCategories') }}</option>
            <option v-for="c in store.categories" :key="c.id" :value="c.id">
              {{ tCategoryName(c) }} ({{ c.kind === 'income' ? t('common.income') : t('common.expense') }})
            </option>
          </select>
        </div>
      </div>

      <div v-if="filtered.length" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-xs font-extrabold text-ink-soft border-b-2 border-ink">
              <th class="py-2.5 pr-3">{{ t('tx.thDescription') }}</th>
              <th class="py-2.5 px-3">{{ t('tx.thCategory') }}</th>
              <th class="py-2.5 px-3">{{ t('tx.thMethod') }}</th>
              <th class="py-2.5 px-3">{{ t('common.date') }}</th>
              <th class="py-2.5 px-3 text-right">{{ t('tx.thAmount') }}</th>
              <th class="py-2.5 pl-3 text-right">{{ t('tx.thActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in filtered"
              :key="tx.id"
              class="row-line text-sm"
            >
              <td class="py-3 pr-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-[8px] border-2 border-ink bg-ground flex items-center justify-center shrink-0">
                    <img
                      :src="`/stickers/${store.category(tx.categoryId)?.sticker || 'khac'}.png`"
                      :alt="tCategoryName(store.category(tx.categoryId))"
                      class="w-7 h-7 object-contain"
                    />
                  </div>
                  <div>
                    <div class="font-bold text-ink">{{ tx.description }}</div>
                    <div v-if="tx.note" class="hand text-base text-ink-soft">{{ tx.note }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-3">
                <span class="chip" :class="tx.type === 'income' ? 'bg-[var(--color-gain-bg)]' : 'bg-ground'">
                  {{ tCategoryName(store.category(tx.categoryId)) }}
                </span>
              </td>
              <td class="py-3 px-3 text-ink-soft">{{ tPaymentMethod(tx.method) }}</td>
              <td class="py-3 px-3 num">{{ tx.date }}</td>
              <td
                class="py-3 px-3 text-right font-extrabold text-base num"
                :class="tx.type === 'income' ? 'gain' : 'loss'"
              >
                {{ vnd(tx.type === 'income' ? tx.amount : -tx.amount, { sign: true }) }}
              </td>
              <td class="py-3 pl-3 text-right whitespace-nowrap">
                <NuxtLink :to="`/transactions/new?edit=${tx.id}`" class="text-xs font-semibold underline mr-3">
                  {{ t('common.edit') }}
                </NuxtLink>
                <button
                  type="button"
                  class="text-xs font-semibold underline loss cursor-pointer"
                  @click="store.deleteTransaction(tx.id)"
                >
                  {{ t('common.delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <DoodleScene
        v-else
        seed="empty-transactions"
        :title="t('tx.emptyTitle')"
        :caption="t('tx.emptyCaption')"
        sticker="ca-phe"
      >
        <NuxtLink to="/transactions/new" class="btn btn-ink">{{ t('tx.addFirst') }}</NuxtLink>
      </DoodleScene>
    </div>
  </div>
</template>

