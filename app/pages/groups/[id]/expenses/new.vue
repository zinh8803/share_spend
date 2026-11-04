<script setup lang="ts">
import { useAppStore, todayIso } from '~/stores/app'
import { computeSplit, parseVnd, vnd, vndShort, type SplitType } from '~/utils/money'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const { t, tCategoryName, tSplitType } = useI18n()

const groupId = computed(() => String(route.params.id))
const group = computed(() => store.group(groupId.value))
const editId = computed(() => (typeof route.query.edit === 'string' ? route.query.edit : undefined))
const existing = computed(() => (editId.value ? store.expenses.find(e => e.id === editId.value) : undefined))

const members = computed(() => store.groupMembers(groupId.value, false))
const expenseCategories = computed(() =>
  store.categories.filter(c =>
    c.kind === 'expense' && (!c.groupId || c.groupId === groupId.value || c.id === categoryId.value)
  )
)

const title = ref(existing.value?.title ?? '')
const totalInput = ref(existing.value ? String(existing.value.total) : '500000')
const categoryId = ref(existing.value?.categoryId ?? 'c-food')
const date = ref(existing.value?.date ?? todayIso())
const payerId = ref(existing.value?.payerId ?? store.meId)
const splitType = ref<SplitType>(existing.value?.splitType ?? 'equal')
const note = ref(existing.value?.note ?? '')

const selectedIds = ref<string[]>(
  existing.value
    ? existing.value.splits.map(s => s.userId)
    : members.value.map(m => m.userId)
)

const customValues = reactive<Record<string, number>>({})
function initValues() {
  for (const m of members.value) {
    const found = existing.value?.splits.find(s => s.userId === m.userId)
    if (found) customValues[m.userId] = found.value
    else if (splitType.value === 'shares') customValues[m.userId] = 1
    else if (splitType.value === 'percent') customValues[m.userId] = Math.round(100 / Math.max(1, selectedIds.value.length))
    else customValues[m.userId] = 0
  }
}

watch([members, existing], ([curMembers, curExisting]) => {
  if (!curMembers || !curMembers.length) return
  if (curExisting) {
    title.value = curExisting.title
    totalInput.value = String(curExisting.total)
    categoryId.value = curExisting.categoryId
    date.value = curExisting.date
    payerId.value = curExisting.payerId
    splitType.value = curExisting.splitType
    note.value = curExisting.note || ''
    selectedIds.value = curExisting.splits.map(s => s.userId)
    for (const s of curExisting.splits) {
      customValues[s.userId] = s.value
    }
  } else {
    if (!selectedIds.value.length) {
      selectedIds.value = curMembers.map(m => m.userId)
      if (!payerId.value || !curMembers.some(m => m.userId === payerId.value)) {
        payerId.value = store.meId || curMembers[0]?.userId || ''
      }
      initValues()
    }
  }
}, { immediate: true })

watch(splitType, (next) => {
  const n = Math.max(1, selectedIds.value.length)
  if (next === 'shares') selectedIds.value.forEach(id => { customValues[id] = 1 })
  if (next === 'percent') {
    const base = Math.floor(100 / n)
    selectedIds.value.forEach((id, idx) => { customValues[id] = idx === 0 ? 100 - base * (n - 1) : base })
  }
  if (next === 'exact') {
    const base = Math.floor(totalAmount.value / n)
    selectedIds.value.forEach((id, idx) => { customValues[id] = idx === 0 ? totalAmount.value - base * (n - 1) : base })
  }
})

const totalAmount = computed(() => parseVnd(totalInput.value))

const splitResult = computed(() =>
  computeSplit(
    totalAmount.value,
    splitType.value,
    selectedIds.value.map(userId => ({ userId, value: Number(customValues[userId] || 0) }))
  )
)

const previewSlots = computed(() =>
  selectedIds.value.map(uid => {
    const u = store.user(uid)
    const share = splitResult.value.shares[uid] ?? 0
    return {
      id: u?.id || uid,
      name: u?.name || '...',
      bg: u?.frame || '#C9B6FF',
      avatar: u?.avatar,
      sub: vndShort(share)
    }
  })
)

const payerReceivable = computed(() => {
  if (!splitResult.value.ok) return 0
  const myShare = splitResult.value.shares[payerId.value] ?? 0
  return totalAmount.value - myShare
})

function toggleMember(uid: string) {
  const idx = selectedIds.value.indexOf(uid)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else {
    selectedIds.value.push(uid)
    if (customValues[uid] === undefined) customValues[uid] = 1
  }
}

const formError = ref('')
async function submit() {
  formError.value = ''
  if (!group.value || group.value.status === 'archived') {
    formError.value = 'Nhóm đã lưu trữ, không thể thêm hoặc sửa khoản chi.'
    return
  }
  if (!title.value.trim()) {
    formError.value = 'Nhập tên khoản chi (ví dụ: Ăn tối lẩu gà lá é).'
    return
  }
  if (!totalAmount.value || totalAmount.value <= 0) {
    formError.value = 'Tổng tiền hóa đơn phải lớn hơn 0đ.'
    return
  }
  if (totalAmount.value > 100_000_000_000) {
    formError.value = 'Tổng tiền hóa đơn không được vượt quá 100 tỷ đồng (100.000.000.000đ) / lần thêm.'
    return
  }
  if (!splitResult.value.ok) {
    formError.value = splitResult.value.error || 'Tổng phân bổ chưa khớp với hóa đơn.'
    return
  }
  try {
    const id = await store.saveExpense({
      id: editId.value,
      groupId: groupId.value,
      title: title.value.trim(),
      total: totalAmount.value,
      categoryId: categoryId.value,
      date: date.value,
      payerId: payerId.value,
      splitType: splitType.value,
      splits: selectedIds.value.map(uid => ({
        userId: uid,
        value: splitType.value === 'equal' ? 1 : Number(customValues[uid] || 0),
        share: splitResult.value.shares[uid]
      })),
      note: note.value.trim()
    })
    if (id) router.push(`/groups/${groupId.value}/expenses/${id}`)
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || err?.message || 'Không thể lưu khoản chi.'
  }
}
</script>

<template>
  <div class="group-page">
    <div v-if="group">
    <GroupHeader :group-id="groupId" />

    <div class="grid grid-cols-1 lg:grid-cols-[1.45fr_auto] gap-8 items-start">
      <form class="panel p-6 sm:p-8 flex flex-col gap-5" @submit.prevent="submit">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-2xl font-extrabold">
            {{ editId ? t('groups.editExpenseTitle') : t('groups.newExpenseTitle') }}
          </h2>
          <span class="chip bg-butter">100% = {{ vnd(totalAmount) }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="e-title" class="field-label">{{ t('tx.thDescription') }}</label>
            <input
              id="e-title"
              v-model="title"
              type="text"
              class="field"
              :placeholder="t('groups.newExpenseDefault')"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="e-total" class="field-label mb-0">{{ t('groups.billTotal') }} (VND)</label>
              <span v-if="totalAmount > 0" class="text-xs font-semibold text-ink-soft">
                {{ vnd(totalAmount) }}
              </span>
            </div>
            <input
              id="e-total"
              v-model="totalInput"
              type="text"
              inputmode="numeric"
              class="field font-extrabold text-lg num"
              :class="totalAmount > 100000000000 ? 'border-[var(--color-loss)]' : ''"
              placeholder="500000, 500k hoặc 1,5tỷ"
            />
            <p v-if="totalAmount > 100000000000" role="alert" class="field-error">
              Vượt quá giới hạn tối đa 100 tỷ đồng (100.000.000.000đ).
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="e-payer" class="field-label">{{ t('groups.billPayer') }}</label>
            <select id="e-payer" v-model="payerId" class="field font-bold">
              <option v-for="m in members" :key="m.userId" :value="m.userId">
                {{ store.user(m.userId)?.name }}
              </option>
            </select>
          </div>

          <div>
            <label for="e-cat" class="field-label">{{ t('tx.category') }}</label>
            <select id="e-cat" v-model="categoryId" class="field">
              <option v-for="c in expenseCategories" :key="c.id" :value="c.id">
                {{ tCategoryName(c) }}{{ c.groupId ? ' (' + t('common.group') + ')' : !c.isDefault ? ' (' + t('common.personal') + ')' : '' }}
              </option>
            </select>
          </div>

          <div>
            <label for="e-date" class="field-label">{{ t('common.date') }}</label>
            <input id="e-date" v-model="date" type="date" class="field num" />
          </div>
        </div>

        <div>
          <label class="field-label">{{ t('reports.byCategory') }}</label>
          <div class="seg" role="group" :aria-label="t('reports.byCategory')">
            <button type="button" :aria-pressed="splitType === 'equal'" @click="splitType = 'equal'">
              {{ tSplitType('equal') }}
            </button>
            <button type="button" :aria-pressed="splitType === 'exact'" @click="splitType = 'exact'">
              {{ tSplitType('exact') }}
            </button>
            <button type="button" :aria-pressed="splitType === 'percent'" @click="splitType = 'percent'">
              {{ tSplitType('percent') }}
            </button>
            <button type="button" :aria-pressed="splitType === 'shares'" @click="splitType = 'shares'">
              {{ tSplitType('shares') }}
            </button>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="field-label mb-0">{{ t('groups.participatingMembers', { selected: selectedIds.length, total: members.length }) }}</label>
            <button
              type="button"
              class="text-xs font-semibold underline cursor-pointer"
              @click="selectedIds = members.map(m => m.userId)"
            >
              {{ t('groups.selectAll') }}
            </button>
          </div>

          <div class="flex flex-col">
            <div
              v-for="m in members"
              :key="m.userId"
              class="row-line grid grid-cols-[auto_1fr_auto] items-center gap-3.5 py-3"
            >
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(m.userId)"
                  class="w-5 h-5 accent-[var(--color-lilac-deep)]"
                  @change="toggleMember(m.userId)"
                />
                <PhotoAvatar
                  :seed="store.user(m.userId)?.name || m.userId"
                  :bg="store.user(m.userId)?.frame"
                  :size="42"
                />
                <div>
                  <div class="font-bold text-sm">
                    {{ store.user(m.userId)?.name }}
                    <span v-if="m.userId === payerId" class="chip bg-butter ml-1 text-[11px]">{{ t('groups.payerBadge') }}</span>
                  </div>
                  <div class="text-xs text-ink-soft">
                    {{ selectedIds.includes(m.userId) ? t('groups.shareAmount', { amount: vnd(splitResult.shares[m.userId] || 0) }) : t('groups.notParticipating') }}
                  </div>
                </div>
              </label>

              <div />

              <div v-if="selectedIds.includes(m.userId)" class="flex items-center gap-2">
                <template v-if="splitType === 'equal'">
                  <span class="font-extrabold text-base num">{{ vnd(splitResult.shares[m.userId] || 0) }}</span>
                </template>
                <template v-else-if="splitType === 'exact'">
                  <input
                    v-model.number="customValues[m.userId]"
                    type="number"
                    step="1000"
                    min="0"
                    class="field w-36 text-right font-bold num py-1.5"
                    :aria-label="`Amount of ${store.user(m.userId)?.name}`"
                  />
                  <span class="text-xs font-bold">đ</span>
                </template>
                <template v-else-if="splitType === 'percent'">
                  <input
                    v-model.number="customValues[m.userId]"
                    type="number"
                    min="0"
                    max="100"
                    class="field w-24 text-right font-bold num py-1.5"
                    :aria-label="`Percent of ${store.user(m.userId)?.name}`"
                  />
                  <span class="text-xs font-bold">% ({{ vnd(splitResult.shares[m.userId] || 0) }})</span>
                </template>
                <template v-else>
                  <input
                    v-model.number="customValues[m.userId]"
                    type="number"
                    min="0"
                    step="1"
                    class="field w-20 text-right font-bold num py-1.5"
                    :aria-label="`Shares of ${store.user(m.userId)?.name}`"
                  />
                  <span class="text-xs font-bold">phần ({{ vnd(splitResult.shares[m.userId] || 0) }})</span>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div
          class="rounded-[14px] border-2 border-ink p-4 flex flex-wrap items-center justify-between gap-3"
          :class="splitResult.ok ? 'bg-[var(--color-gain-bg)]' : 'bg-[var(--color-loss-bg)]'"
        >
          <div class="text-sm font-semibold">
            <template v-if="splitResult.ok">
              {{ t('groups.splitMatched', { total: vnd(totalAmount), payer: store.user(payerId)?.name, receivable: vnd(payerReceivable) }) }}
            </template>
            <template v-else>
              {{ splitResult.error }}
            </template>
          </div>
        </div>

        <div>
          <label for="e-note" class="field-label">{{ t('common.note') }}</label>
          <input id="e-note" v-model="note" type="text" class="field" :placeholder="t('feedback.contentPlaceholder')" />
        </div>

        <p v-if="formError" role="alert" class="field-error">{{ formError }}</p>

        <div class="flex flex-wrap items-center gap-3">
          <button type="submit" class="btn btn-ink" :disabled="!splitResult.ok">
            {{ editId ? t('groups.updateExpenseBtn') : t('groups.confirmExpenseBtn') }}
          </button>
          <NuxtLink :to="`/groups/${groupId}/expenses`" class="btn">{{ t('common.cancel') }}</NuxtLink>
        </div>
      </form>

      <div class="flex flex-col items-center gap-3">
        <PhotoStrip
          :slots="previewSlots"
          :caption="title || t('groups.newExpenseDefault')"
          :subcaption="`${store.user(payerId)?.name} ${t('groups.paidAmount', { amount: vndShort(totalAmount) })}`"
          :tilt="1.2"
          selected
        />
      </div>
    </div>
  </div>
  </div>
</template>

