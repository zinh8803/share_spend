<script setup lang="ts">
import { useAppStore, todayIso } from '~/stores/app'
import { parseVnd, vnd } from '~/utils/money'

const route = useRoute()
const store = useAppStore()
const { t, tSettlementStatus } = useI18n()
const groupId = computed(() => String(route.params.id))
const group = computed(() => store.group(groupId.value))

const settlements = computed(() => store.groupSettlements(groupId.value))
const members = computed(() => store.groupMembers(groupId.value, false))

const fromId = ref(members.value[1]?.userId ?? store.meId)
const toId = ref(store.meId)
const amountInput = ref('')
const note = ref('')
const date = ref(todayIso())
const error = ref('')

watch([members, () => store.meId], ([curMembers, meId]) => {
  if (curMembers && curMembers.length >= 2) {
    if (!fromId.value || !curMembers.some(m => m.userId === fromId.value)) {
      fromId.value = curMembers.find(m => m.userId !== meId)?.userId || curMembers[0]?.userId || ''
    }
    if (!toId.value || !curMembers.some(m => m.userId === toId.value)) {
      toId.value = meId || curMembers[1]?.userId || ''
    }
  }
}, { immediate: true })

const statusCls: Record<string, string> = {
  pending: 'bg-butter',
  confirmed: 'bg-[var(--color-gain-bg)]',
  cancelled: 'bg-[var(--color-loss-bg)]'
}

async function submit() {
  error.value = ''
  if (fromId.value === toId.value) {
    error.value = 'Người trả và người nhận phải là hai thành viên khác nhau.'
    return
  }
  const amt = parseVnd(amountInput.value)
  if (amt <= 0) {
    error.value = 'Nhập số tiền hoàn trả lớn hơn 0.'
    return
  }
  await store.recordSettlement({
    groupId: groupId.value,
    fromId: fromId.value,
    toId: toId.value,
    amount: amt,
    note: note.value.trim(),
    date: date.value
  })
  amountInput.value = ''
  note.value = ''
}
</script>

<template>
  <div class="group-page">
    <div v-if="group">
    <GroupHeader :group-id="groupId" />

    <div class="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-7 items-start">
      <div class="panel p-6 flex flex-col gap-4">
        <h2 class="text-xl font-extrabold">{{ t('groups.settlementHistoryTitle', { count: settlements.length }) }}</h2>

        <div v-if="settlements.length" class="flex flex-col">
          <div
            v-for="s in settlements"
            :key="s.id"
            class="row-line flex flex-wrap items-center justify-between gap-4 py-3.5"
            :class="s.status === 'cancelled' ? 'opacity-60' : ''"
          >
            <div class="flex items-center gap-3.5">
              <PhotoAvatar
                :seed="store.user(s.fromId)?.name || s.fromId"
                :bg="store.user(s.fromId)?.frame"
                :size="46"
              />
              <div>
                <div class="text-sm">
                  <strong class="font-extrabold">{{ store.user(s.fromId)?.name }}</strong>
                  {{ t('groups.settledTo') }}
                  <strong class="font-extrabold">{{ store.user(s.toId)?.name }}</strong>
                </div>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                  <span class="chip text-xs" :class="statusCls[s.status]">
                    {{ tSettlementStatus(s.status) }}
                  </span>
                  <span class="text-xs text-ink-soft num">{{ s.date }}</span>
                  <span v-if="s.note" class="hand text-base text-ink-soft">· {{ s.note }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="font-extrabold text-lg num">{{ vnd(s.amount) }}</span>
              <template v-if="s.status === 'pending' && group.status === 'active'">
                <button
                  type="button"
                  class="btn btn-sm bg-[var(--color-gain-bg)]"
                  @click="store.confirmSettlement(s.id)"
                >
                  {{ t('groups.confirmReceived') }}
                </button>
                <button
                  type="button"
                  class="text-xs font-semibold underline loss cursor-pointer"
                  @click="store.cancelSettlement(s.id)"
                >
                  {{ t('common.cancel') }}
                </button>
              </template>
            </div>
          </div>
        </div>

        <DoodleScene
          v-else
          seed="no-settlements"
          :title="t('groups.noExpensesYet')"
          :caption="t('groups.manualSettlementDesc')"
          sticker="tien"
        />
      </div>

      <form
        v-if="group.status === 'active'"
        class="panel p-6 flex flex-col gap-4"
        @submit.prevent="submit"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold">{{ t('groups.manualSettlementTitle') }}</h2>
            <p class="text-xs text-ink-soft mt-0.5">
              {{ t('groups.manualSettlementDesc') }}
            </p>
          </div>
          <img src="/stickers/tien.png" alt="Thanh toán" class="w-11 h-11 object-contain" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="st-from" class="field-label">{{ t('groups.debtor') }}</label>
            <select id="st-from" v-model="fromId" class="field font-bold">
              <option v-for="m in members" :key="m.userId" :value="m.userId">
                {{ store.user(m.userId)?.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="st-to" class="field-label">{{ t('groups.creditor') }}</label>
            <select id="st-to" v-model="toId" class="field font-bold">
              <option v-for="m in members" :key="m.userId" :value="m.userId">
                {{ store.user(m.userId)?.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="st-amt" class="field-label">{{ t('common.amount') }} (VND)</label>
            <input id="st-amt" v-model="amountInput" type="text" inputmode="numeric" class="field font-extrabold num" placeholder="125000 hoặc 125k" />
          </div>
          <div>
            <label for="st-date" class="field-label">{{ t('common.date') }}</label>
            <input id="st-date" v-model="date" type="date" class="field num" />
          </div>
        </div>

        <div>
          <label for="st-note" class="field-label">{{ t('common.note') }}</label>
          <input id="st-note" v-model="note" type="text" class="field" :placeholder="t('feedback.contentPlaceholder')" />
        </div>

        <p v-if="error" role="alert" class="field-error">{{ error }}</p>

        <button type="submit" class="btn btn-ink self-start">{{ t('groups.saveSettlementBtn') }}</button>
      </form>
    </div>
  </div>
  </div>
</template>

