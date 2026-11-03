<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import { vnd } from '~/utils/money'

const route = useRoute()
const store = useAppStore()
const groupId = computed(() => String(route.params.id))
const group = computed(() => store.group(groupId.value))

const q = ref('')
const expenses = computed(() =>
  store.groupExpenses(groupId.value).filter(e =>
    !q.value.trim() || e.title.toLowerCase().includes(q.value.trim().toLowerCase())
  )
)

const splitName: Record<string, string> = {
  equal: 'Chia đều',
  exact: 'Số tiền tùy chỉnh',
  percent: 'Theo tỷ lệ %',
  shares: 'Theo trọng số (phần)'
}
</script>

<template>
  <div v-if="group">
    <GroupHeader :group-id="groupId" />

    <div class="panel p-6 flex flex-col gap-5">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex-1 min-w-[240px] max-w-md">
          <label for="exp-q" class="field-label">Tìm khoản chi trong nhóm</label>
          <input id="exp-q" v-model="q" type="search" class="field" placeholder="Gõ tên hóa đơn..." />
        </div>

        <NuxtLink
          v-if="group.status === 'active'"
          :to="`/groups/${groupId}/expenses/new`"
          class="btn btn-ink"
        >
          Thêm khoản chi chung
        </NuxtLink>
      </div>

      <div v-if="expenses.length" class="flex flex-col">
        <div
          v-for="e in expenses"
          :key="e.id"
          class="row-line grid grid-cols-1 md:grid-cols-[1.2fr_1fr_auto] items-center gap-4 py-4"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-[10px] border-2 border-ink bg-butter flex items-center justify-center shrink-0">
              <img
                :src="`/stickers/${store.category(e.categoryId)?.sticker || 'hoa-don'}.png`"
                :alt="e.title"
                class="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <NuxtLink :to="`/groups/${groupId}/expenses/${e.id}`" class="font-extrabold text-base hover:underline">
                {{ e.title }}
              </NuxtLink>
              <div class="text-xs text-ink-soft mt-0.5">
                <strong class="text-ink">{{ store.user(e.payerId)?.name }}</strong> đã thanh toán · {{ splitName[e.splitType] }} · {{ e.date }}
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-1.5">
            <span
              v-for="sp in e.splits"
              :key="sp.userId"
              class="chip text-xs num"
              :style="{ backgroundColor: store.user(sp.userId)?.frame }"
            >
              {{ store.user(sp.userId)?.name }}: {{ vnd(sp.share) }}
            </span>
          </div>

          <div class="flex items-center justify-end gap-4">
            <div class="text-right">
              <div class="font-extrabold text-lg num">{{ vnd(e.total) }}</div>
              <NuxtLink :to="`/groups/${groupId}/expenses/${e.id}`" class="text-xs font-semibold underline">
                Chi tiết & sửa
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <DoodleScene
        v-else
        seed="no-group-expenses"
        title="Chưa có khoản chi chung nào"
        caption="Tạo khoản chi đầu tiên để hệ thống tự chia tiền và cập nhật công nợ."
        sticker="hoa-don"
      >
        <NuxtLink
          v-if="group.status === 'active'"
          :to="`/groups/${groupId}/expenses/new`"
          class="btn btn-ink"
        >
          Tạo khoản chi đầu tiên
        </NuxtLink>
      </DoodleScene>
    </div>
  </div>
</template>

