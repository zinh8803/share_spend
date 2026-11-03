<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import { vnd, vndShort } from '~/utils/money'

const route = useRoute()
const store = useAppStore()
const groupId = computed(() => String(route.params.id))
const group = computed(() => store.group(groupId.value))

const members = computed(() => store.groupMembers(groupId.value))
const expenses = computed(() => store.groupExpenses(groupId.value))
const debts = computed(() => store.groupDebts(groupId.value))
const balances = computed(() => store.groupBalances(groupId.value))

const totalExpense = computed(() => expenses.value.reduce((s, e) => s + e.total, 0))
const totalUnpaid = computed(() => debts.value.reduce((s, d) => s + d.remaining, 0))
const myBalance = computed(() => balances.value[store.meId] ?? { paid: 0, share: 0, net: 0 })

const stripSlots = computed(() =>
  members.value.map(m => {
    const u = store.user(m.userId)
    const net = balances.value[m.userId]?.net ?? 0
    return {
      id: u?.id || m.userId,
      name: u?.name || '...',
      bg: u?.frame || '#C9B6FF',
      avatar: u?.avatar,
      sub: net !== 0 ? (net > 0 ? `+${vndShort(net)}` : vndShort(net)) : '0đ'
    }
  })
)

const copiedCode = ref(false)
const copiedLink = ref(false)

function getInviteLink() {
  if (typeof window === 'undefined' || !group.value) return ''
  return `${window.location.origin}/join?code=${encodeURIComponent(group.value.inviteCode)}`
}

async function shareLink() {
  if (!group.value || typeof window === 'undefined') return
  const link = getInviteLink()
  if (navigator.share) {
    try {
      await navigator.share({
        title: group.value.name,
        text: `Tham gia nhóm chi tiêu "${group.value.name}" trên ShareSpend:`,
        url: link
      })
      return
    } catch (_) {}
  }
  navigator.clipboard?.writeText(link)
  copiedLink.value = true
  setTimeout(() => { copiedLink.value = false }, 2000)
}

function copyCode() {
  if (!group.value || typeof navigator === 'undefined') return
  navigator.clipboard?.writeText(group.value.inviteCode)
  copiedCode.value = true
  setTimeout(() => { copiedCode.value = false }, 1800)
}
</script>

<template>
  <div v-if="group">
    <GroupHeader :group-id="groupId" />

    <div class="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-start">
      <div class="flex flex-col items-center gap-3">
        <PhotoStrip
          :slots="stripSlots"
          :caption="group.name"
          :subcaption="`${expenses.length} khoản · ${vndShort(totalExpense)}`"
          :tilt="-1.2"
          selected
        />
        <div class="flex flex-col gap-2 w-full max-w-[172px]">
          <button
            type="button"
            class="btn btn-sm btn-ink w-full text-center"
            @click="shareLink"
          >
            {{ copiedLink ? 'Đã sao chép link' : 'Chia sẻ link nhóm' }}
          </button>
          <button
            type="button"
            class="btn btn-sm w-full text-center"
            @click="copyCode"
          >
            {{ copiedCode ? 'Đã sao chép mã' : `Sao chép mã ${group.inviteCode}` }}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div class="panel p-3.5 sm:p-4 bg-sky min-w-0 overflow-hidden flex flex-col justify-between">
            <div class="text-xs font-semibold text-ink/75 truncate">Tổng chi nhóm</div>
            <div class="text-base sm:text-lg xl:text-xl font-extrabold num mt-1 tracking-tight truncate" :title="vnd(totalExpense)">{{ vnd(totalExpense) }}</div>
          </div>
          <div class="panel p-3.5 sm:p-4 bg-butter min-w-0 overflow-hidden flex flex-col justify-between">
            <div class="text-xs font-semibold text-ink/75 truncate">Bạn đã trả hộ</div>
            <div class="text-base sm:text-lg xl:text-xl font-extrabold num mt-1 tracking-tight truncate" :title="vnd(myBalance.paid)">{{ vnd(myBalance.paid) }}</div>
          </div>
          <div class="panel p-3.5 sm:p-4 bg-ground min-w-0 overflow-hidden flex flex-col justify-between">
            <div class="text-xs font-semibold text-ink/75 truncate">Phần bạn thực chịu</div>
            <div class="text-base sm:text-lg xl:text-xl font-extrabold num mt-1 tracking-tight truncate" :title="vnd(myBalance.share)">{{ vnd(myBalance.share) }}</div>
          </div>
          <div class="panel p-3.5 sm:p-4 min-w-0 overflow-hidden flex flex-col justify-between" :class="myBalance.net >= 0 ? 'bg-[var(--color-gain-bg)]' : 'bg-[var(--color-loss-bg)]'">
            <div class="text-xs font-semibold text-ink/75 truncate">Số dư ròng của bạn</div>
            <div
              class="text-base sm:text-lg xl:text-xl font-extrabold num mt-1 tracking-tight truncate"
              :class="myBalance.net >= 0 ? 'gain' : 'loss'"
              :title="vnd(myBalance.net, { sign: true })"
            >
              {{ vnd(myBalance.net, { sign: true }) }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div class="panel p-6 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-extrabold">Ai đang nợ ai</h2>
              <NuxtLink :to="`/groups/${groupId}/balances`" class="text-sm font-semibold underline">
                Thanh toán ({{ vnd(totalUnpaid) }})
              </NuxtLink>
            </div>

            <div v-if="debts.length" class="flex flex-col">
              <div
                v-for="d in debts"
                :key="`${d.fromId}-${d.toId}`"
                class="row-line flex items-center justify-between gap-3 py-3"
              >
                <div class="flex items-center gap-3">
                  <PhotoAvatar
                    :avatar="store.user(d.fromId)?.avatar"
                    :seed="store.user(d.fromId)?.name || 'u'"
                    :bg="store.user(d.fromId)?.frame"
                    :size="44"
                  />
                  <div>
                    <div class="text-sm">
                      <strong class="font-extrabold">{{ store.user(d.fromId)?.name }}</strong>
                      cần trả
                      <strong class="font-extrabold">{{ store.user(d.toId)?.name }}</strong>
                    </div>
                    <div class="hand text-lg text-ink-soft">
                      {{ d.status === 'partial' ? `Đã trả ${vnd(d.paid)}, còn lại:` : 'Chưa thanh toán' }}
                    </div>
                  </div>
                </div>
                <span class="font-extrabold text-lg num">{{ vnd(d.remaining) }}</span>
              </div>
            </div>
            <p v-else class="hand text-xl text-ink-soft py-4">
              Mọi khoản nợ trong nhóm đã được thanh toán xong.
            </p>
          </div>

          <div class="panel p-6 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-extrabold">Khoản chi gần đây</h2>
              <NuxtLink :to="`/groups/${groupId}/expenses`" class="text-sm font-semibold underline">
                Tất cả ({{ expenses.length }})
              </NuxtLink>
            </div>

            <div v-if="expenses.length" class="flex flex-col">
              <NuxtLink
                v-for="e in expenses.slice(0, 4)"
                :key="e.id"
                :to="`/groups/${groupId}/expenses/${e.id}`"
                class="row-line flex items-center justify-between gap-3 py-3 hover:bg-ground/50 px-2 rounded-lg transition-colors"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="`/stickers/${store.category(e.categoryId)?.sticker || 'hoa-don'}.png`"
                    :alt="e.title"
                    class="w-9 h-9 object-contain"
                  />
                  <div>
                    <div class="font-bold text-sm">{{ e.title }}</div>
                    <div class="text-xs text-ink-soft">
                      {{ store.user(e.payerId)?.name }} trả · chia {{ e.splits.length }} người · {{ e.date }}
                    </div>
                  </div>
                </div>
                <span class="font-extrabold text-base num">{{ vnd(e.total) }}</span>
              </NuxtLink>
            </div>
            <p v-else class="hand text-xl text-ink-soft py-4">
              Chưa có khoản chi chung nào trong nhóm.
            </p>
          </div>
        </div>

        <div class="panel p-5 flex flex-wrap items-center justify-between gap-4">
          <div class="text-sm">
            Trạng thái nhóm:
            <strong class="font-extrabold">{{ group.status === 'active' ? 'Đang hoạt động' : 'Đã lưu trữ (chỉ xem lịch sử)' }}</strong>
          </div>
          <button
            type="button"
            class="btn btn-sm"
            @click="store.setGroupStatus(groupId, group.status === 'active' ? 'archived' : 'active')"
          >
            {{ group.status === 'active' ? 'Lưu trữ nhóm này' : 'Mở lại nhóm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="!store.hydrated" class="panel p-8 text-center text-ink-soft">
    Đang tải dữ liệu nhóm từ máy chủ...
  </div>
  <DoodleScene
    v-else
    seed="missing-group"
    title="Không tìm thấy nhóm"
    caption="Nhóm này không tồn tại hoặc bạn chưa tham gia."
  >
    <NuxtLink to="/groups" class="btn btn-ink">Về danh sách nhóm</NuxtLink>
  </DoodleScene>
</template>

