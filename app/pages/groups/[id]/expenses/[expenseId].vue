<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import { vnd, vndShort } from '~/utils/money'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const groupId = computed(() => String(route.params.id))
const expenseId = computed(() => String(route.params.expenseId))
const group = computed(() => store.group(groupId.value))
const expense = computed(() => store.expenses.find(e => e.id === expenseId.value))

const splitName: Record<string, string> = {
  equal: 'Chia đều (Equal Split)',
  exact: 'Chia số tiền tùy chỉnh (Exact Amount)',
  percent: 'Chia theo tỷ lệ % (Percentage Split)',
  shares: 'Chia theo trọng số (Shares Split)'
}

const payerShare = computed(() =>
  expense.value?.splits.find(s => s.userId === expense.value?.payerId)?.share ?? 0
)
const payerReceivable = computed(() =>
  expense.value ? expense.value.total - payerShare.value : 0
)

const stripSlots = computed(() =>
  (expense.value?.splits ?? []).map(sp => {
    const u = store.user(sp.userId)
    return {
      id: u?.id || sp.userId,
      name: u?.name || '...',
      bg: u?.frame || '#C9B6FF',
      avatar: u?.avatar,
      sub: vndShort(sp.share)
    }
  })
)

async function handleDelete() {
  if (!expense.value) return
  await store.deleteExpense(expense.value.id)
  router.push(`/groups/${groupId.value}/expenses`)
}
</script>

<template>
  <div v-if="group && expense">
    <GroupHeader :group-id="groupId" />

    <div class="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-start">
      <PhotoStrip
        :slots="stripSlots"
        :caption="expense.title"
        :subcaption="vnd(expense.total)"
        :tilt="-1.4"
        selected
      />

      <div class="panel p-6 sm:p-8 flex flex-col gap-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-[12px] border-[3px] border-ink bg-butter flex items-center justify-center shrink-0">
              <img
                :src="`/stickers/${store.category(expense.categoryId)?.sticker || 'hoa-don'}.png`"
                :alt="expense.title"
                class="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <span class="chip bg-ground">{{ store.category(expense.categoryId)?.name }} · {{ expense.date }}</span>
              <h2 class="text-2xl sm:text-3xl font-extrabold mt-1">{{ expense.title }}</h2>
              <p class="text-sm text-ink-soft mt-0.5">{{ splitName[expense.splitType] }}</p>
            </div>
          </div>

          <div class="text-right">
            <div class="text-xs font-semibold text-ink-soft">Tổng hóa đơn</div>
            <div class="text-3xl font-extrabold num">{{ vnd(expense.total) }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="rounded-[14px] border-2 border-ink bg-butter p-4">
            <div class="text-xs font-semibold text-ink/75">Người thanh toán hóa đơn</div>
            <div class="text-lg font-extrabold mt-1">
              {{ store.user(expense.payerId)?.name }} đã trả {{ vnd(expense.total) }}
            </div>
            <div class="text-xs text-ink-soft mt-0.5">
              Phần chịu thực tế: {{ vnd(payerShare) }}
            </div>
          </div>

          <div class="rounded-[14px] border-2 border-ink bg-[var(--color-gain-bg)] p-4">
            <div class="text-xs font-semibold text-ink/75">{{ store.user(expense.payerId)?.name }} cần nhận lại</div>
            <div class="text-2xl font-extrabold num mt-1 gain">+{{ vnd(payerReceivable) }}</div>
            <div class="text-xs text-ink-soft mt-0.5">
              Từ {{ expense.splits.filter(s => s.userId !== expense.payerId).length }} thành viên còn lại
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-base font-extrabold mb-2">Chi tiết phân bổ từng thành viên</h3>
          <div class="flex flex-col">
            <div
              v-for="sp in expense.splits"
              :key="sp.userId"
              class="row-line flex items-center justify-between gap-3 py-3"
            >
              <div class="flex items-center gap-3">
                <PhotoAvatar
                  :seed="store.user(sp.userId)?.name || sp.userId"
                  :bg="store.user(sp.userId)?.frame"
                  :size="46"
                />
                <div>
                  <div class="font-extrabold text-base">{{ store.user(sp.userId)?.name }}</div>
                  <div class="text-xs text-ink-soft">
                    <template v-if="sp.userId === expense.payerId">
                      Đã trả {{ vnd(expense.total) }} · Phần chịu {{ vnd(sp.share) }}
                    </template>
                    <template v-else>
                      Cần hoàn trả cho {{ store.user(expense.payerId)?.name }}
                    </template>
                  </div>
                </div>
              </div>

              <div class="text-right num">
                <div
                  v-if="sp.userId === expense.payerId"
                  class="font-extrabold text-lg gain"
                >
                  +{{ vnd(payerReceivable) }}
                </div>
                <div v-else class="font-extrabold text-lg loss">
                  −{{ vnd(sp.share) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-if="expense.note" class="hand text-xl text-ink-soft">
          Ghi chú: {{ expense.note }}
        </p>

        <div v-if="group.status === 'active' && expense.status === 'active'" class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-dashed border-line">
          <div class="flex flex-wrap gap-2.5">
            <NuxtLink :to="`/groups/${groupId}/expenses/new?edit=${expense.id}`" class="btn bg-lilac">
              Sửa hóa đơn & tính lại
            </NuxtLink>
            <NuxtLink :to="`/groups/${groupId}/balances`" class="btn">
              Mở bảng công nợ
            </NuxtLink>
          </div>
          <button type="button" class="btn btn-sm loss" @click="handleDelete">
            Xóa khoản chi này
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="!store.hydrated && store.loading" class="panel p-8 text-center">
    <p class="font-extrabold text-lg">Đang tải chi tiết hóa đơn từ MySQL...</p>
  </div>
  <DoodleScene
    v-else
    seed="missing-expense"
    title="Không tìm thấy hóa đơn"
    caption="Khoản chi này đã bị xóa hoặc không tồn tại."
  >
    <NuxtLink :to="`/groups/${groupId}/expenses`" class="btn btn-ink">Về danh sách chi phí</NuxtLink>
  </DoodleScene>
</template>

