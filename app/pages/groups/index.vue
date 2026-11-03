<script setup lang="ts">
import { useAppStore, type GroupType } from '~/stores/app'
import { vndShort } from '~/utils/money'

const store = useAppStore()
const router = useRouter()

const statusFilter = ref<'active' | 'archived' | 'all'>('active')
const name = ref('')
const description = ref('')
const type = ref<GroupType>('friends')
const createError = ref('')

const inviteCode = ref('')
const joinFeedback = ref<{ ok: boolean; text: string } | null>(null)

const copiedGroupId = ref<string | null>(null)
async function shareGroupLink(group: { name: string; inviteCode: string; id: string }) {
  if (typeof window === 'undefined') return
  const link = `${window.location.origin}/join?code=${encodeURIComponent(group.inviteCode)}`
  if (navigator.share) {
    try {
      await navigator.share({
        title: group.name,
        text: `Tham gia nhóm chi tiêu "${group.name}" trên ShareSpend:`,
        url: link
      })
      return
    } catch (_) {}
  }
  navigator.clipboard?.writeText(link)
  copiedGroupId.value = group.id
  setTimeout(() => {
    if (copiedGroupId.value === group.id) copiedGroupId.value = null
  }, 2000)
}

const visibleGroups = computed(() =>
  store.myGroups.filter(g => statusFilter.value === 'all' || g.status === statusFilter.value)
)

const strips = computed(() =>
  visibleGroups.value.map((g, idx) => {
    const members = store.groupMembers(g.id)
    const balances = store.groupBalances(g.id)
    const exps = store.groupExpenses(g.id)
    const total = exps.reduce((s, e) => s + e.total, 0)
    const tilts = [-1.4, 1.1, -0.7, 1.3]
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
      subcaption: exps.length ? `${exps.length} khoản · ${vndShort(total)}` : 'Chưa có chi phí'
    }
  })
)

const typeLabels: Record<GroupType, string> = {
  friends: 'Nhóm bạn',
  family: 'Gia đình',
  company: 'Công ty / Team',
  other: 'Thuê nhà / Khác'
}

async function handleCreate() {
  createError.value = ''
  if (!name.value.trim()) {
    createError.value = 'Nhập tên nhóm trước khi tạo.'
    return
  }
  const id = await store.createGroup({
    name: name.value.trim(),
    description: description.value.trim() || 'Nhóm chi tiêu chung',
    type: type.value
  })
  name.value = ''
  description.value = ''
  router.push(`/groups/${id}`)
}

async function handleJoin() {
  joinFeedback.value = null
  const res = await store.joinByCode(inviteCode.value)
  if (!res.ok) {
    joinFeedback.value = { ok: false, text: res.error || 'Không thể tham gia nhóm.' }
    return
  }
  joinFeedback.value = { ok: true, text: 'Đã tham gia nhóm thành công.' }
  inviteCode.value = ''
  if (res.groupId) router.push(`/groups/${res.groupId}`)
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold">Nhóm chi tiêu chung</h1>
        <p class="text-sm text-ink-soft mt-1">
          Mỗi nhóm hoạt động độc lập về thành viên, khoản chi và công nợ. Nhấn vào dải ảnh để mở nhóm.
        </p>
      </div>

      <div class="seg" role="group" aria-label="Trạng thái nhóm">
        <button type="button" :aria-pressed="statusFilter === 'active'" @click="statusFilter = 'active'">
          Đang hoạt động
        </button>
        <button type="button" :aria-pressed="statusFilter === 'archived'" @click="statusFilter = 'archived'">
          Đã lưu trữ
        </button>
        <button type="button" :aria-pressed="statusFilter === 'all'" @click="statusFilter = 'all'">
          Tất cả
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
      <div>
        <div v-if="strips.length" class="flex flex-wrap gap-6 pt-2">
          <div v-for="item in strips" :key="item.group.id" class="flex flex-col items-center gap-2">
            <PhotoStrip
              :slots="item.slots"
              :caption="item.caption"
              :subcaption="item.subcaption"
              :tilt="item.tilt"
              :archived="item.group.status === 'archived'"
              @select="router.push(`/groups/${item.group.id}`)"
            />
            <div class="flex items-center gap-1.5 flex-wrap justify-center">
              <span class="chip text-xs">{{ typeLabels[item.group.type] }} · {{ item.group.inviteCode }}</span>
              <button
                type="button"
                class="chip text-xs hover:bg-lilac cursor-pointer transition-colors"
                title="Sao chép hoặc gửi link mời"
                @click.stop="shareGroupLink(item.group)"
              >
                {{ copiedGroupId === item.group.id ? 'Đã sao chép link' : 'Chia sẻ link' }}
              </button>
            </div>
          </div>
        </div>
        <DoodleScene
          v-else
          seed="no-groups"
          title="Chưa có nhóm nào ở trạng thái này"
          caption="Tạo một nhóm mới bên phải hoặc chuyển bộ lọc sang Đang hoạt động."
          sticker="du-lich"
        />
      </div>

      <div class="flex flex-col gap-6">
        <form class="panel p-6 flex flex-col gap-4" @submit.prevent="handleCreate">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-extrabold">Tạo nhóm mới</h2>
            <img src="/stickers/du-lich.png" alt="Du lịch" class="w-10 h-10 object-contain" />
          </div>

          <div>
            <label for="g-name" class="field-label">Tên nhóm</label>
            <input
              id="g-name"
              v-model="name"
              type="text"
              class="field"
              placeholder="Ví dụ: Đi Phú Quốc, Quỹ liên hoan..."
            />
          </div>

          <div>
            <label for="g-type" class="field-label">Loại nhóm</label>
            <select id="g-type" v-model="type" class="field">
              <option value="friends">Nhóm bạn / Du lịch</option>
              <option value="family">Gia đình</option>
              <option value="company">Công ty / Nhóm làm việc</option>
              <option value="other">Nhóm thuê nhà / Khác</option>
            </select>
          </div>

          <div>
            <label for="g-desc" class="field-label">Mô tả ngắn</label>
            <input
              id="g-desc"
              v-model="description"
              type="text"
              class="field"
              placeholder="Ghi chú mục đích nhóm..."
            />
          </div>

          <p v-if="createError" role="alert" class="field-error">{{ createError }}</p>

          <button type="submit" class="btn btn-ink self-start">Tạo nhóm & nhận mã mời</button>
        </form>

        <form class="panel p-6 flex flex-col gap-4" @submit.prevent="handleJoin">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-xl font-extrabold">Tham gia nhóm bằng mã mời</h2>
              <p class="text-xs text-ink-soft mt-0.5">
                Nhập mã mời do chủ nhóm chia sẻ để tham gia vào nhóm.
              </p>
            </div>
            <img src="/stickers/phong-bi.png" alt="Thư mời" class="w-10 h-10 object-contain" />
          </div>

          <div>
            <label for="join-code" class="field-label">Mã mời</label>
            <input
              id="join-code"
              v-model="inviteCode"
              type="text"
              class="field font-bold uppercase"
              placeholder="NHOM-XXXX"
            />
          </div>

          <p
            v-if="joinFeedback"
            :role="joinFeedback.ok ? 'status' : 'alert'"
            :class="joinFeedback.ok ? 'gain font-semibold text-sm' : 'field-error'"
          >
            {{ joinFeedback.text }}
          </p>

          <button type="submit" class="btn bg-butter self-start">Tham gia nhóm</button>
        </form>
      </div>
    </div>
  </div>
</template>

