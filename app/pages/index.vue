<script setup lang="ts">
import { useAppStore, todayIso } from '~/stores/app'
import { vnd, vndShort } from '~/utils/money'

const store = useAppStore()
const currentYm = todayIso().slice(0, 7)
const month = ref(currentYm)
const selectedGroupId = ref('')

const monthOptions = computed(() => {
  const set = new Set<string>([currentYm])
  for (const t of store.transactions) if (t.date) set.add(t.date.slice(0, 7))
  for (const e of store.expenses) if (e.date) set.add(e.date.slice(0, 7))
  return [...set].sort().reverse().slice(0, 4)
})

const selectedGroup = computed(() =>
  store.group(selectedGroupId.value) ?? store.myGroups.find(g => g.status === 'active') ?? store.myGroups[0]
)

const groupStrips = computed(() =>
  store.myGroups.filter(g => g.status === 'active').map((g, idx) => {
    const members = store.groupMembers(g.id)
    const balances = store.groupBalances(g.id)
    const total = store.groupExpenses(g.id).reduce((s, e) => s + e.total, 0)
    const expCount = store.groupExpenses(g.id).length
    const tilts = [-1.5, 1.2, -0.6, 1.0]
    return {
      group: g,
      tilt: tilts[idx % tilts.length],
      slots: members.map(m => {
        const u = store.user(m.userId)
        const net = balances[m.userId]?.net ?? 0
        return {
          id: u?.id || m.userId,
          name: u?.name || '...',
          bg: u?.frame || '#C9B6FF',
          avatar: u?.avatar,
          sub: net !== 0 ? (net > 0 ? `+${vndShort(net)}` : vndShort(net)) : undefined
        }
      }),
      caption: g.name,
      subcaption: expCount > 0 ? `${expCount} khoản · ${vndShort(total)}` : 'Chưa có khoản chi'
    }
  })
)

const selectedGroupDebts = computed(() =>
  selectedGroup.value ? store.groupDebts(selectedGroup.value.id) : []
)
const selectedGroupExpenses = computed(() =>
  selectedGroup.value ? store.groupExpenses(selectedGroup.value.id) : []
)
const selectedGroupTotal = computed(() =>
  selectedGroupExpenses.value.reduce((s, e) => s + e.total, 0)
)
const selectedGroupMyReceive = computed(() =>
  selectedGroupDebts.value
    .filter(d => d.toId === store.meId)
    .reduce((s, d) => s + d.remaining, 0)
)
const selectedGroupUnpaid = computed(() =>
  selectedGroupDebts.value.reduce((s, d) => s + d.remaining, 0)
)

const monthStats = computed(() => store.monthTotals(month.value))
const myGroupSpend = computed(() => store.myGroupShare(month.value))

const recentTransactions = computed(() =>
  [...store.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
)
</script>

<template>
  <div class="flex flex-col gap-10">
    <!-- First Viewport: Photobooth 4 Khung Composition -->
    <section v-if="store.myGroups.length" aria-labelledby="groups-overview-heading" class="grid grid-cols-1 xl:grid-cols-[auto_minmax(480px,1fr)] gap-7 items-start">
      <div class="flex gap-4 overflow-x-auto pb-3 pt-2 px-2">
        <PhotoStrip
          v-for="(item, idx) in groupStrips"
          :key="item.group.id"
          :slots="item.slots"
          :caption="item.caption"
          :subcaption="item.subcaption"
          :tilt="item.tilt"
          :selected="selectedGroup?.id === item.group.id"
          :archived="item.group.status === 'archived'"
          :class="idx === 1 ? 'mt-5' : idx === 2 ? 'mt-2' : ''"
          @select="selectedGroupId = item.group.id"
        />
      </div>

      <div v-if="selectedGroup" class="panel p-6 sm:p-8 flex flex-col gap-5 min-w-0">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <h1 id="groups-overview-heading" class="text-2xl sm:text-3xl font-extrabold">
              {{ selectedGroup.name }}
            </h1>
            <p class="text-ink-soft text-sm mt-1">
              {{ store.groupMembers(selectedGroup.id).length }} thành viên · tạo bởi {{ store.user(selectedGroup.createdBy)?.name }} · {{ selectedGroup.description }}
            </p>
          </div>
          <NuxtLink :to="`/groups/${selectedGroup.id}`" class="btn btn-sm bg-lilac shrink-0">
            Mở chi tiết nhóm
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="rounded-[14px] bg-sky p-3 sm:p-3.5 border-2 border-ink min-w-0 overflow-hidden flex flex-col justify-between">
            <div class="text-xs font-semibold text-ink/75 truncate">Tổng chi nhóm</div>
            <div class="text-base sm:text-lg xl:text-xl font-extrabold num mt-1 tracking-tight truncate" :title="vnd(selectedGroupTotal)">
              {{ vnd(selectedGroupTotal) }}
            </div>
          </div>
          <div class="rounded-[14px] bg-blush p-3 sm:p-3.5 border-2 border-ink min-w-0 overflow-hidden flex flex-col justify-between">
            <div class="text-xs font-semibold text-ink/75 truncate">Bạn cần nhận</div>
            <div class="text-base sm:text-lg xl:text-xl font-extrabold num mt-1 tracking-tight gain truncate" :title="vnd(selectedGroupMyReceive)">
              {{ vnd(selectedGroupMyReceive) }}
            </div>
          </div>
          <div class="rounded-[14px] bg-ground p-3 sm:p-3.5 border-2 border-ink min-w-0 overflow-hidden flex flex-col justify-between">
            <div class="text-xs font-semibold text-ink/75 truncate">Còn chưa trả</div>
            <div class="text-base sm:text-lg xl:text-xl font-extrabold num mt-1 tracking-tight truncate" :title="vnd(selectedGroupUnpaid)">
              {{ vnd(selectedGroupUnpaid) }}
            </div>
          </div>
        </div>

        <div v-if="selectedGroupDebts.length" class="flex flex-col">
          <div
            v-for="d in selectedGroupDebts"
            :key="`${d.fromId}-${d.toId}`"
            class="row-line grid grid-cols-[52px_1fr_auto] sm:grid-cols-[52px_minmax(110px,1fr)_minmax(130px,1.2fr)_auto] items-center gap-3.5 py-3 px-2"
            :class="store.isDebtNew(d) ? 'is-new' : ''"
            @mouseenter="store.markDebtSeen(d)"
          >
            <PhotoAvatar
              :avatar="store.user(d.fromId)?.avatar"
              :seed="store.user(d.fromId)?.name || d.fromId"
              :bg="store.user(d.fromId)?.frame"
              :size="52"
              :label="store.user(d.fromId)?.name"
            />
            <div class="min-w-0">
              <div class="text-base leading-snug">
                <strong class="font-extrabold">{{ store.user(d.fromId)?.name }}</strong>
                nợ
                <strong class="font-extrabold">{{ store.user(d.toId)?.name }}</strong>
              </div>
              <div class="text-xs text-ink-soft sm:hidden hand text-base text-lilac-deep truncate">
                {{ d.status === 'partial' ? `đã trả ${vnd(d.paid)}` : selectedGroupExpenses[0]?.title }}
              </div>
            </div>
            <div class="hidden sm:block hand text-xl text-lilac-deep leading-snug truncate">
              {{ d.status === 'partial' ? `đã trả một phần (${vnd(d.paid)})` : (selectedGroupExpenses[0]?.title || 'khoản chi chung') }}
            </div>
            <div
              class="font-extrabold text-lg sm:text-xl num whitespace-nowrap text-right"
              :class="d.toId === store.meId ? 'gain' : d.fromId === store.meId ? 'loss' : ''"
            >
              {{ vnd(d.remaining) }}
            </div>
          </div>
        </div>
        <p v-else class="hand text-xl text-ink-soft py-4">
          Nhóm này đã thanh toán hết công nợ.
        </p>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div class="flex flex-wrap gap-2.5">
            <NuxtLink :to="`/groups/${selectedGroup.id}/balances`" class="btn">
              Ghi nhận thanh toán
            </NuxtLink>
            <NuxtLink
              v-if="selectedGroup.status === 'active'"
              :to="`/groups/${selectedGroup.id}/expenses/new`"
              class="btn btn-pink"
            >
              Chia khoản chi mới
            </NuxtLink>
          </div>
          <NuxtLink to="/groups" class="text-sm font-semibold underline text-ink-soft hover:text-ink">
            Quản lý tất cả {{ store.myGroups.length }} nhóm
          </NuxtLink>
        </div>
      </div>
    </section>

    <DoodleScene
      v-else
      seed="first-group-empty"
      title="Bạn chưa có nhóm chi tiêu chung nào"
      caption="Tạo một nhóm mới để mời bạn bè, thêm hóa đơn chung và theo dõi ai nợ ai trên dải ảnh Photobooth."
      sticker="du-lich"
    >
      <div class="flex flex-wrap justify-center gap-3">
        <NuxtLink to="/groups" class="btn btn-ink">Tạo nhóm đầu tiên</NuxtLink>
        <NuxtLink to="/transactions/new" class="btn bg-butter">Ghi thu chi cá nhân</NuxtLink>
      </div>
    </DoodleScene>

    <!-- Second section: Personal Expense Tracker + Activity -->
    <section aria-labelledby="personal-summary-heading" class="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-7 items-start">
      <div class="panel p-6 sm:p-8 flex flex-col gap-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="personal-summary-heading" class="text-2xl font-extrabold">
              Sổ thu chi cá nhân của {{ store.me.name }}
            </h2>
            <p class="text-sm text-ink-soft mt-0.5">
              Tách biệt hoàn toàn giữa tiền đã ứng trả cho nhóm và phần thực tế bạn phải chịu.
            </p>
          </div>
          <div class="seg" role="group" aria-label="Chọn tháng">
            <button
              v-for="m in monthOptions"
              :key="m"
              type="button"
              :aria-pressed="month === m"
              @click="month = m"
            >
              Tháng {{ m.slice(5, 7) }}/{{ m.slice(0, 4) }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-[14px] border-2 border-ink bg-butter p-3.5 min-w-0 overflow-hidden">
            <div class="text-xs font-semibold text-ink/75 truncate">Số dư cá nhân</div>
            <div class="text-lg sm:text-xl font-extrabold num mt-1 tracking-tight truncate">{{ vnd(monthStats.balance) }}</div>
          </div>
          <div class="rounded-[14px] border-2 border-ink bg-[var(--color-gain-bg)] p-3.5 min-w-0 overflow-hidden">
            <div class="text-xs font-semibold text-ink/75 truncate">Tổng thu</div>
            <div class="text-lg sm:text-xl font-extrabold num mt-1 tracking-tight gain truncate">{{ vnd(monthStats.income) }}</div>
          </div>
          <div class="rounded-[14px] border-2 border-ink bg-[var(--color-loss-bg)] p-3.5 min-w-0 overflow-hidden">
            <div class="text-xs font-semibold text-ink/75 truncate">Chi riêng</div>
            <div class="text-lg sm:text-xl font-extrabold num mt-1 tracking-tight loss truncate">{{ vnd(monthStats.expense) }}</div>
          </div>
          <div class="rounded-[14px] border-2 border-ink bg-ground p-3.5 min-w-0 overflow-hidden">
            <div class="text-xs font-semibold text-ink/75 truncate">Phần chịu trong nhóm</div>
            <div class="text-lg sm:text-xl font-extrabold num mt-1 tracking-tight truncate">{{ vnd(myGroupSpend) }}</div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-extrabold">Giao dịch cá nhân gần đây</h3>
            <div class="flex items-center gap-3">
              <NuxtLink to="/transactions/new" class="text-sm font-semibold underline">Thêm giao dịch</NuxtLink>
              <NuxtLink to="/transactions" class="text-sm font-semibold underline text-ink-soft hover:text-ink">Xem tất cả</NuxtLink>
            </div>
          </div>

          <div v-if="recentTransactions.length" class="flex flex-col">
            <div
              v-for="t in recentTransactions"
              :key="t.id"
              class="row-line grid grid-cols-[44px_1fr_auto] items-center gap-3 py-2.5"
            >
              <div class="w-11 h-11 rounded-[8px] border-2 border-ink bg-ground flex items-center justify-center overflow-hidden">
                <img
                  :src="`/stickers/${store.category(t.categoryId)?.sticker || 'khac'}.png`"
                  :alt="store.category(t.categoryId)?.name || 'Danh mục'"
                  class="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <div class="font-bold text-[15px]">{{ t.description }}</div>
                <div class="text-xs text-ink-soft">
                  {{ store.category(t.categoryId)?.name }} · {{ t.date }}
                </div>
              </div>
              <div
                class="font-extrabold text-base num"
                :class="t.type === 'income' ? 'gain' : 'loss'"
              >
                {{ vnd(t.type === 'income' ? t.amount : -t.amount, { sign: true }) }}
              </div>
            </div>
          </div>
          <p v-else class="hand text-xl text-ink-soft py-4">
            Chưa có giao dịch cá nhân nào. Bấm "Thêm giao dịch" để ghi nhận khoản đầu tiên.
          </p>
        </div>
      </div>

      <!-- Right column: Net balances across all groups + Activity -->
      <div class="panel p-6 sm:p-8 flex flex-col gap-5">
        <div>
          <h2 class="text-2xl font-extrabold">Tổng hợp công nợ của bạn</h2>
          <p class="text-sm text-ink-soft mt-0.5">
            Cộng gộp trên toàn bộ nhóm đang tham gia.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3.5">
          <div class="rounded-[14px] border-2 border-ink bg-[var(--color-gain-bg)] p-4">
            <div class="text-xs font-semibold text-ink/75">Mọi người nợ bạn</div>
            <div class="text-2xl font-extrabold num mt-1 gain">{{ vnd(store.myNet.receive) }}</div>
          </div>
          <div class="rounded-[14px] border-2 border-ink bg-[var(--color-loss-bg)] p-4">
            <div class="text-xs font-semibold text-ink/75">Bạn đang nợ</div>
            <div class="text-2xl font-extrabold num mt-1 loss">{{ vnd(store.myNet.pay) }}</div>
          </div>
        </div>

        <div>
          <h3 class="text-base font-extrabold mb-2">Các khoản cần thu & trả</h3>
          <div class="flex flex-col">
            <NuxtLink
              v-for="d in store.allMyDebts"
              :key="`${d.groupId}-${d.fromId}-${d.toId}`"
              :to="`/groups/${d.groupId}/balances`"
              class="row-line flex items-center justify-between gap-3 py-2.5 hover:bg-ground/60 px-2 rounded-lg transition-colors"
            >
              <div class="flex items-center gap-3">
                <PhotoAvatar
                  :avatar="store.user(d.fromId === store.meId ? d.toId : d.fromId)?.avatar"
                  :seed="store.user(d.fromId === store.meId ? d.toId : d.fromId)?.name || 'user'"
                  :bg="store.user(d.fromId === store.meId ? d.toId : d.fromId)?.frame"
                  :size="40"
                />
                <div>
                  <div class="text-sm font-bold">
                    <template v-if="d.toId === store.meId">
                      {{ store.user(d.fromId)?.name }} trả cho bạn
                    </template>
                    <template v-else>
                      Bạn trả cho {{ store.user(d.toId)?.name }}
                    </template>
                  </div>
                  <div class="text-xs text-ink-soft">{{ store.group(d.groupId)?.name }}</div>
                </div>
              </div>
              <span
                class="font-extrabold num text-base"
                :class="d.toId === store.meId ? 'gain' : 'loss'"
              >
                {{ vnd(d.toId === store.meId ? d.remaining : -d.remaining, { sign: true }) }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <div class="pt-2 border-t-2 border-dashed border-line">
          <h3 class="text-base font-extrabold mb-2">Hoạt động mới</h3>
          <ul class="flex flex-col gap-2 text-sm">
            <li v-for="act in store.activity.slice(0, 4)" :key="act.id" class="flex items-baseline justify-between gap-3">
              <span>{{ act.text }}</span>
              <span class="text-xs text-ink-soft shrink-0 num">{{ act.at.slice(0, 10) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

