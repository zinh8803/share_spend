<script setup lang="ts">
import { useAppStore, todayIso, type Debt } from '~/stores/app'
import { parseVnd, vnd } from '~/utils/money'

const route = useRoute()
const store = useAppStore()
const { t, tDebtStatus } = useI18n()
const groupId = computed(() => String(route.params.id))
const group = computed(() => store.group(groupId.value))

const debts = computed(() => store.groupDebts(groupId.value))
const balances = computed(() => store.groupBalances(groupId.value))
const members = computed(() => store.groupMembers(groupId.value, true))

const activeDebt = ref<Debt | null>(null)
const payAmountInput = ref('')
const payNote = ref('')
const payDate = ref(todayIso())
const payError = ref('')

function openSettle(d: Debt) {
  store.markDebtSeen(d)
  activeDebt.value = d
  payAmountInput.value = String(d.remaining)
  payNote.value = ''
  payError.value = ''
}

async function submitSettle() {
  if (!activeDebt.value) return
  const amt = parseVnd(payAmountInput.value)
  if (amt <= 0) {
    payError.value = 'Nhập số tiền thanh toán lớn hơn 0.'
    return
  }
  if (amt > activeDebt.value.remaining) {
    payError.value = `Số tiền vượt quá phần còn nợ (${vnd(activeDebt.value.remaining)}).`
    return
  }
  await store.recordSettlement({
    groupId: groupId.value,
    fromId: activeDebt.value.fromId,
    toId: activeDebt.value.toId,
    amount: amt,
    note: payNote.value.trim(),
    date: payDate.value
  })
  activeDebt.value = null
}
</script>

<template>
  <div class="group-page">
    <div v-if="group">
    <GroupHeader :group-id="groupId" />

    <div class="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-7 items-start">
      <div class="panel p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-extrabold">{{ t('groups.directDebtsTitle') }}</h2>
            <p class="text-xs text-ink-soft mt-0.5">
              {{ t('groups.directDebtsDesc') }}
            </p>
          </div>
          <NuxtLink :to="`/groups/${groupId}/settlements`" class="text-sm font-semibold underline">
            {{ t('groups.settlementHistory') }}
          </NuxtLink>
        </div>

        <div v-if="debts.length" class="flex flex-col">
          <div
            v-for="d in debts"
            :key="`${d.fromId}-${d.toId}`"
            class="row-line flex flex-wrap items-center justify-between gap-4 py-4 px-2"
            :class="store.isDebtNew(d) ? 'is-new' : ''"
            @mouseenter="store.markDebtSeen(d)"
          >
            <div class="flex items-center gap-3.5">
              <PhotoAvatar
                :seed="store.user(d.fromId)?.name || d.fromId"
                :bg="store.user(d.fromId)?.frame"
                :size="50"
              />
              <div>
                <div class="text-base">
                  <strong class="font-extrabold">{{ store.user(d.fromId)?.name }}</strong>
                  {{ t('groups.owes') }}
                  <strong class="font-extrabold">{{ store.user(d.toId)?.name }}</strong>
                </div>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                  <span class="chip text-xs" :class="d.status === 'paid' ? 'bg-[var(--color-gain-bg)]' : d.status === 'partial' ? 'bg-butter' : 'bg-ground'">
                    {{ tDebtStatus(d.status) }}
                  </span>
                  <span v-if="d.paid > 0" class="text-xs text-ink-soft num">
                    {{ t('groups.paidPortion', { paid: vnd(d.paid), gross: vnd(d.gross) }) }}
                  </span>
                  <span v-if="d.pendingAmount > 0" class="text-xs font-semibold text-lilac-deep num">
                    {{ t('groups.pendingConfirmation', { amount: vnd(d.pendingAmount) }) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="font-extrabold text-xl num">{{ vnd(d.remaining) }}</span>
              <button
                v-if="d.remaining > 0 && group.status === 'active'"
                type="button"
                class="btn btn-sm bg-butter"
                @click="openSettle(d)"
              >
                {{ t('groups.recordPayBtn') }}
              </button>
            </div>
          </div>
        </div>

        <DoodleScene
          v-else
          seed="all-settled"
          :title="t('groups.allSettled')"
          :caption="t('groups.directDebtsDesc')"
          sticker="tim"
        />

        <!-- Inline settlement drawer -->
        <form
          v-if="activeDebt"
          class="mt-3 rounded-[16px] border-[3px] border-ink bg-butter p-5 flex flex-col gap-3"
          @submit.prevent="submitSettle"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-extrabold text-base">
              {{ t('groups.recordPayFromTo', { from: store.user(activeDebt.fromId)?.name, to: store.user(activeDebt.toId)?.name }) }}
            </h3>
            <button type="button" class="text-xs font-semibold underline cursor-pointer" @click="activeDebt = null">
              {{ t('common.close') }}
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label for="s-amt" class="field-label">{{ t('common.amount') }} (max {{ vnd(activeDebt.remaining) }})</label>
              <input id="s-amt" v-model="payAmountInput" type="text" inputmode="numeric" class="field font-extrabold num" />
            </div>
            <div>
              <label for="s-date" class="field-label">{{ t('common.date') }}</label>
              <input id="s-date" v-model="payDate" type="date" class="field num" />
            </div>
            <div>
              <label for="s-note" class="field-label">{{ t('common.note') }}</label>
              <input id="s-note" v-model="payNote" type="text" class="field" :placeholder="t('feedback.contentPlaceholder')" />
            </div>
          </div>

          <p v-if="payError" role="alert" class="field-error">{{ payError }}</p>

          <div class="flex items-center gap-2.5">
            <button type="submit" class="btn btn-ink btn-sm">{{ t('groups.savePayment') }}</button>
            <button type="button" class="btn btn-sm" @click="payAmountInput = String(Math.round(activeDebt.remaining / 2))">
              {{ t('groups.payHalf') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Right column: Member Paid vs Share breakdown -->
      <div class="panel p-6 flex flex-col gap-4">
        <div>
          <h2 class="text-xl font-extrabold">{{ t('groups.paidVsShareTitle') }}</h2>
          <p class="text-xs text-ink-soft mt-0.5">
            {{ t('groups.paidVsShareDesc') }}
          </p>
        </div>

        <div class="flex flex-col">
          <div
            v-for="m in members"
            :key="m.userId"
            class="row-line flex items-center justify-between gap-3 py-3"
          >
            <div class="flex items-center gap-3">
              <PhotoAvatar
                :seed="store.user(m.userId)?.name || m.userId"
                :bg="store.user(m.userId)?.frame"
                :size="42"
              />
              <div>
                <div class="font-bold text-sm">{{ store.user(m.userId)?.name }}</div>
                <div class="text-xs text-ink-soft num">
                  {{ t('reports.paidForGroup') }}: {{ vnd(balances[m.userId]?.paid || 0) }} · {{ t('reports.actualGroupShare') }}: {{ vnd(balances[m.userId]?.share || 0) }}
                </div>
              </div>
            </div>

            <div
              class="font-extrabold text-base num"
              :class="(balances[m.userId]?.net || 0) > 0 ? 'gain' : (balances[m.userId]?.net || 0) < 0 ? 'loss' : ''"
            >
              {{ vnd(balances[m.userId]?.net || 0, { sign: true }) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

