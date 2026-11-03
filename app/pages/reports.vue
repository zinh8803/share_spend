<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useAppStore, todayIso } from '~/stores/app'
import { vnd } from '~/utils/money'

use([CanvasRenderer, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const store = useAppStore()
const mode = ref<'personal' | 'group'>('personal')
const currentYm = todayIso().slice(0, 7)
const month = ref(currentYm)
const includeGroupShare = ref(true)
const selectedGroupId = ref('')

const monthOptions = computed(() => {
  const set = new Set<string>([currentYm])
  for (const t of store.transactions) if (t.date) set.add(t.date.slice(0, 7))
  for (const e of store.expenses) if (e.date) set.add(e.date.slice(0, 7))
  return [...set].sort().reverse().slice(0, 6)
})

watch(() => store.myGroups, (groups) => {
  if (!selectedGroupId.value && groups.length) {
    selectedGroupId.value = groups[0].id
  }
}, { immediate: true })

// Personal stats
const monthPersonal = computed(() => store.monthTotals(month.value))
const monthGroupShare = computed(() => store.myGroupShare(month.value))
const totalActualExpense = computed(() =>
  monthPersonal.value.expense + (includeGroupShare.value ? monthGroupShare.value : 0)
)
const actualBalance = computed(() => monthPersonal.value.income - totalActualExpense.value)

const categoryBreakdown = computed(() => {
  const map = new Map<string, number>()
  for (const t of store.transactions) {
    if (t.type !== 'expense' || !t.date.startsWith(month.value)) continue
    map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount)
  }
  if (includeGroupShare.value) {
    for (const e of store.expenses) {
      if (e.status !== 'active' || !e.date.startsWith(month.value)) continue
      const myShare = e.splits.find(s => s.userId === store.meId)?.share ?? 0
      if (myShare > 0) map.set(e.categoryId, (map.get(e.categoryId) || 0) + myShare)
    }
  }
  return [...map.entries()]
    .map(([id, value]) => ({
      id,
      name: store.category(id)?.name || 'Khác',
      sticker: store.category(id)?.sticker || 'khac',
      value
    }))
    .sort((a, b) => b.value - a.value)
})

const topCategory = computed(() => categoryBreakdown.value[0])

const personalPieOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    valueFormatter: (val: number) => vnd(val)
  },
  color: ['#C9B6FF', '#A8D8FF', '#FFD6E2', '#FFF1A8', '#FF8FB1', '#7A5CFF'],
  series: [
    {
      name: 'Chi tiêu theo danh mục',
      type: 'pie',
      radius: ['42%', '74%'],
      itemStyle: { borderColor: '#222222', borderWidth: 2, borderRadius: 6 },
      label: { fontFamily: 'Be Vietnam Pro', fontWeight: 700, color: '#222222' },
      data: categoryBreakdown.value.map(c => ({ name: c.name, value: c.value }))
    }
  ]
}))

const monthlyCompareOption = computed(() => {
  const months = [...monthOptions.value].reverse()
  const labels = months.map(m => `Tháng ${m.slice(5, 7)}/${m.slice(0, 4)}`)
  const incomes = months.map(m => store.monthTotals(m).income)
  const personalEx = months.map(m => store.monthTotals(m).expense)
  const groupShare = months.map(m => store.myGroupShare(m))

  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { fontFamily: 'Be Vietnam Pro', fontWeight: 600, color: '#222222' } },
    grid: { top: 20, left: 68, right: 20, bottom: 42 },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { fontFamily: 'Be Vietnam Pro', fontWeight: 700, color: '#222222' }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontFamily: 'Be Vietnam Pro',
        color: '#55506A',
        formatter: (v: number) => `${Math.round(v / 1_000_000)}tr`
      }
    },
    series: [
      {
        name: 'Thu nhập',
        type: 'bar',
        data: incomes,
        itemStyle: { color: '#D4F5E3', borderColor: '#222222', borderWidth: 2, borderRadius: [6, 6, 0, 0] }
      },
      {
        name: 'Chi cá nhân',
        type: 'bar',
        stack: 'spend',
        data: personalEx,
        itemStyle: { color: '#FFD6E2', borderColor: '#222222', borderWidth: 2 }
      },
      {
        name: 'Phần chịu trong nhóm',
        type: 'bar',
        stack: 'spend',
        data: groupShare,
        itemStyle: { color: '#C9B6FF', borderColor: '#222222', borderWidth: 2, borderRadius: [6, 6, 0, 0] }
      }
    ]
  }
})

// Group report stats
const groupExpenses = computed(() => store.groupExpenses(selectedGroupId.value))
const groupDebts = computed(() => store.groupDebts(selectedGroupId.value))
const groupBalances = computed(() => store.groupBalances(selectedGroupId.value))
const groupMembers = computed(() => store.groupMembers(selectedGroupId.value, true))

const groupTotalSpend = computed(() => groupExpenses.value.reduce((s, e) => s + e.total, 0))
const groupUnpaidTotal = computed(() => groupDebts.value.reduce((s, d) => s + d.remaining, 0))
const groupSettledTotal = computed(() =>
  store.groupSettlements(selectedGroupId.value)
    .filter(s => s.status === 'confirmed')
    .reduce((sum, s) => sum + s.amount, 0)
)

const topPayer = computed(() => {
  const list = groupMembers.value.map(m => ({
    user: store.user(m.userId)!,
    paid: groupBalances.value[m.userId]?.paid ?? 0
  })).sort((a, b) => b.paid - a.paid)
  return list[0]
})

const topDebtor = computed(() => {
  const list = groupMembers.value.map(m => ({
    user: store.user(m.userId)!,
    net: groupBalances.value[m.userId]?.net ?? 0
  })).sort((a, b) => a.net - b.net)
  return list[0] && list[0].net < 0 ? list[0] : null
})

const groupBarOption = computed(() => {
  const names = groupMembers.value.map(m => store.user(m.userId)?.name || m.userId)
  const paid = groupMembers.value.map(m => groupBalances.value[m.userId]?.paid || 0)
  const share = groupMembers.value.map(m => groupBalances.value[m.userId]?.share || 0)
  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { fontFamily: 'Be Vietnam Pro', fontWeight: 600, color: '#222222' } },
    grid: { top: 20, left: 68, right: 20, bottom: 42 },
    xAxis: { type: 'category', data: names, axisLabel: { fontFamily: 'Be Vietnam Pro', fontWeight: 700, color: '#222222' } },
    yAxis: {
      type: 'value',
      axisLabel: { fontFamily: 'Be Vietnam Pro', color: '#55506A', formatter: (v: number) => `${Math.round(v / 1_000)}k` }
    },
    series: [
      {
        name: 'Đã ứng trả',
        type: 'bar',
        data: paid,
        itemStyle: { color: '#A8D8FF', borderColor: '#222222', borderWidth: 2, borderRadius: [6, 6, 0, 0] }
      },
      {
        name: 'Phần thực chịu',
        type: 'bar',
        data: share,
        itemStyle: { color: '#FFF1A8', borderColor: '#222222', borderWidth: 2, borderRadius: [6, 6, 0, 0] }
      }
    ]
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold">Thống kê & Báo cáo</h1>
        <p class="text-sm text-ink-soft mt-1">
          Phân tích thu chi cá nhân và báo cáo công nợ theo từng nhóm.
        </p>
      </div>

      <div class="seg" role="tablist" aria-label="Loại báo cáo">
        <button type="button" :aria-pressed="mode === 'personal'" @click="mode = 'personal'">
          A. Báo cáo cá nhân
        </button>
        <button type="button" :aria-pressed="mode === 'group'" @click="mode = 'group'">
          B. Báo cáo nhóm
        </button>
      </div>
    </div>

    <!-- A. Personal Report -->
    <template v-if="mode === 'personal'">
      <div class="panel p-5 flex flex-wrap items-center justify-between gap-4">
        <div class="seg" role="group" aria-label="Tháng báo cáo">
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

        <label class="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
          <input v-model="includeGroupShare" type="checkbox" class="w-4 h-4 accent-[var(--color-lilac-deep)]" />
          <span>Cộng phần nghĩa vụ chi tiêu của tôi trong nhóm ({{ vnd(monthGroupShare) }})</span>
        </label>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="panel p-4 bg-[var(--color-gain-bg)] min-w-0 overflow-hidden">
          <div class="text-xs font-semibold text-ink/75 truncate">Tổng thu nhập</div>
          <div class="text-xl font-extrabold num mt-1 tracking-tight gain truncate">{{ vnd(monthPersonal.income) }}</div>
        </div>
        <div class="panel p-4 bg-[var(--color-loss-bg)] min-w-0 overflow-hidden">
          <div class="text-xs font-semibold text-ink/75 truncate">Tổng chi thực tế</div>
          <div class="text-xl font-extrabold num mt-1 tracking-tight loss truncate">{{ vnd(totalActualExpense) }}</div>
        </div>
        <div class="panel p-4 bg-butter min-w-0 overflow-hidden">
          <div class="text-xs font-semibold text-ink/75 truncate">Số dư ròng</div>
          <div class="text-xl font-extrabold num mt-1 tracking-tight truncate">{{ vnd(actualBalance) }}</div>
        </div>
        <div class="panel p-4 bg-ground min-w-0 overflow-hidden">
          <div class="text-xs font-semibold text-ink/75 truncate">Danh mục chi nhiều nhất</div>
          <div class="text-base font-extrabold mt-1 truncate">
            {{ topCategory ? `${topCategory.name} (${vnd(topCategory.value)})` : 'Chưa có' }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="panel p-6 flex flex-col gap-3">
          <h2 class="text-xl font-extrabold">Cơ cấu chi tiêu theo danh mục</h2>
          <div class="h-[300px] w-full">
            <ClientOnly>
              <VChart :option="personalPieOption" autoresize class="h-full w-full" />
            </ClientOnly>
          </div>
        </div>

        <div class="panel p-6 flex flex-col gap-3">
          <h2 class="text-xl font-extrabold">So sánh thu & chi giữa các tháng</h2>
          <div class="h-[300px] w-full">
            <ClientOnly>
              <VChart :option="monthlyCompareOption" autoresize class="h-full w-full" />
            </ClientOnly>
          </div>
        </div>
      </div>
    </template>

    <!-- B. Group Report -->
    <template v-else>
      <div class="panel p-5 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <label for="rep-group" class="text-sm font-bold">Chọn nhóm phân tích:</label>
          <select id="rep-group" v-model="selectedGroupId" class="field w-auto font-bold">
            <option v-for="g in store.myGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </div>

        <NuxtLink :to="`/groups/${selectedGroupId}`" class="btn btn-sm">
          Mở trang nhóm
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div class="panel p-4 bg-sky min-w-0 overflow-hidden">
          <div class="text-xs font-semibold text-ink/75 truncate">Tổng chi phí nhóm</div>
          <div class="text-lg font-extrabold num mt-1 tracking-tight truncate">{{ vnd(groupTotalSpend) }}</div>
        </div>
        <div class="panel p-4 bg-[var(--color-gain-bg)] min-w-0 overflow-hidden">
          <div class="text-xs font-semibold text-ink/75 truncate">Đã hoàn trả</div>
          <div class="text-lg font-extrabold num mt-1 tracking-tight gain truncate">{{ vnd(groupSettledTotal) }}</div>
        </div>
        <div class="panel p-4 bg-[var(--color-loss-bg)] min-w-0 overflow-hidden">
          <div class="text-xs font-semibold text-ink/75 truncate">Công nợ chưa trả</div>
          <div class="text-lg font-extrabold num mt-1 tracking-tight loss truncate">{{ vnd(groupUnpaidTotal) }}</div>
        </div>
        <div class="panel p-4 bg-butter min-w-0 overflow-hidden">
          <div class="text-xs font-semibold text-ink/75 truncate">Chi nhiều nhất</div>
          <div class="text-sm font-extrabold mt-1 truncate">
            {{ topPayer ? `${topPayer.user.name} (${vnd(topPayer.paid)})` : '—' }}
          </div>
        </div>
        <div class="panel p-4 bg-ground min-w-0 overflow-hidden">
          <div class="text-xs font-semibold text-ink/75 truncate">Đang nợ nhiều nhất</div>
          <div class="text-sm font-extrabold mt-1 truncate">
            {{ topDebtor ? `${topDebtor.user.name} (${vnd(-topDebtor.net)})` : 'Không có' }}
          </div>
        </div>
      </div>

      <div class="panel p-6 flex flex-col gap-3">
        <h2 class="text-xl font-extrabold">So sánh Đã ứng trả và Phần thực chịu theo thành viên</h2>
        <div class="h-[320px] w-full">
          <ClientOnly>
            <VChart :option="groupBarOption" autoresize class="h-full w-full" />
          </ClientOnly>
        </div>
      </div>
    </template>
  </div>
</template>

