<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore, type TxType } from '~/stores/app'

const store = useAppStore()
const name = ref('')
const kind = ref<TxType>('expense')
const sticker = ref('ca-phe')
const hint = ref('')
const message = ref('')
const successMsg = ref('')

const scope = ref<'personal' | 'group'>('personal')
const selectedGroupId = ref<string>('')
const filterTab = ref<'all' | 'default' | 'personal' | 'group'>('all')

const myGroups = computed(() => store.myGroups)

// If user has groups, set the default group ID
watch(myGroups, (groups) => {
  if (groups.length > 0 && !selectedGroupId.value) {
    selectedGroupId.value = groups[0].id
  }
}, { immediate: true })

const stickerChoices = [
  { id: 'an-uong', label: 'Tô phở' },
  { id: 'ca-phe', label: 'Ly cà phê' },
  { id: 'di-chuyen', label: 'Xe tay ga' },
  { id: 'nha-o', label: 'Ngôi nhà' },
  { id: 'mua-sam', label: 'Túi mua sắm' },
  { id: 'suc-khoe', label: 'Thuốc' },
  { id: 'giai-tri', label: 'Tiệc tùng' },
  { id: 'du-lich', label: 'Cắm trại' },
  { id: 'thu-nhap', label: 'Túi tiền' },
  { id: 'tien', label: 'Tiền bay' },
  { id: 'hoa-don', label: 'Hóa đơn' },
  { id: 'khac', label: 'Hộp quà' }
]

const filteredCategories = computed(() => {
  if (filterTab.value === 'default') {
    return store.categories.filter(c => c.isDefault)
  }
  if (filterTab.value === 'personal') {
    return store.categories.filter(c => !c.isDefault && !c.groupId)
  }
  if (filterTab.value === 'group') {
    return store.categories.filter(c => !c.isDefault && Boolean(c.groupId))
  }
  return store.categories
})

async function addCategory() {
  message.value = ''
  successMsg.value = ''
  if (!name.value.trim()) {
    message.value = 'Vui lòng nhập tên danh mục trước khi lưu.'
    return
  }

  if (scope.value === 'group' && !selectedGroupId.value) {
    message.value = 'Vui lòng chọn nhóm chi tiêu áp dụng cho danh mục này.'
    return
  }

  const targetGroupId = scope.value === 'group' ? selectedGroupId.value : null

  try {
    await store.saveCategory({
      name: name.value.trim(),
      kind: kind.value,
      sticker: sticker.value,
      hint: hint.value.trim() || (targetGroupId ? 'Danh mục nhóm' : 'Danh mục cá nhân'),
      groupId: targetGroupId
    })

    const groupName = targetGroupId ? store.group(targetGroupId)?.name : ''
    successMsg.value = targetGroupId
      ? `Đã thêm danh mục cho nhóm "${groupName}". Mọi thành viên trong nhóm đều có thể sử dụng!`
      : 'Đã thêm danh mục cá nhân thành công!'

    name.value = ''
    hint.value = ''
  } catch (err: any) {
    message.value = err?.data?.statusMessage || err?.message || 'Có lỗi khi lưu danh mục.'
  }
}

async function removeCategory(id: string) {
  message.value = ''
  successMsg.value = ''
  if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Các khoản chi cũ sẽ được chuyển về danh mục Khác.')) {
    return
  }
  const err = await store.deleteCategory(id)
  if (err) message.value = err
  else successMsg.value = 'Đã xóa danh mục thành công.'
}

function canDelete(c: any): boolean {
  if (c.isDefault) return false
  if (c.userId && c.userId === store.meId) return true
  if (c.groupId) {
    const isMember = store.members.some(m => m.groupId === c.groupId && m.userId === store.meId && m.status === 'active')
    return isMember
  }
  return !c.userId || c.userId === store.meId
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-ink">Danh mục thu chi</h1>
        <p class="text-sm text-ink-soft mt-1">
          Quản lý danh mục cá nhân và danh mục riêng cho từng nhóm chi tiêu.
        </p>
      </div>
      <NuxtLink to="/transactions/new" class="btn btn-ink">Thêm giao dịch mới</NuxtLink>
    </div>

    <!-- Feedback messages -->
    <div v-if="successMsg" class="p-4 bg-gain-bg border-2 border-gain rounded-2xl text-sm font-semibold text-gain flex items-center justify-between">
      <span>{{ successMsg }}</span>
      <button type="button" @click="successMsg = ''" class="font-bold underline text-xs">Ẩn</button>
    </div>
    <div v-if="message" class="p-4 bg-loss-bg border-2 border-loss rounded-2xl text-sm font-semibold text-loss flex items-center justify-between">
      <span>{{ message }}</span>
      <button type="button" @click="message = ''" class="font-bold underline text-xs">Ẩn</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-7 items-start">
      <div class="flex flex-col gap-4">
        <!-- Filter Tabs -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            @click="filterTab = 'all'"
            class="chip font-bold transition-all cursor-pointer"
            :class="filterTab === 'all' ? 'bg-ink text-white' : 'bg-paper text-ink hover:bg-ground'"
          >
            Tất cả ({{ store.categories.length }})
          </button>
          <button
            type="button"
            @click="filterTab = 'default'"
            class="chip font-bold transition-all cursor-pointer"
            :class="filterTab === 'default' ? 'bg-ink text-white' : 'bg-paper text-ink hover:bg-ground'"
          >
            Hệ thống mặc định
          </button>
          <button
            type="button"
            @click="filterTab = 'personal'"
            class="chip font-bold transition-all cursor-pointer"
            :class="filterTab === 'personal' ? 'bg-ink text-white' : 'bg-lilac text-ink hover:brightness-95'"
          >
            Cá nhân của tôi
          </button>
          <button
            type="button"
            @click="filterTab = 'group'"
            class="chip font-bold transition-all cursor-pointer"
            :class="filterTab === 'group' ? 'bg-ink text-white' : 'bg-butter text-ink hover:brightness-95'"
          >
            Theo nhóm
          </button>
        </div>

        <!-- Categories List -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="c in filteredCategories"
            :key="c.id"
            class="panel p-4 flex items-center justify-between gap-3 bg-paper"
          >
            <div class="flex items-center gap-3.5 min-w-0">
              <div
                class="w-14 h-14 rounded-[10px] border-2 border-ink flex items-center justify-center shrink-0"
                :class="c.kind === 'income' ? 'bg-[var(--color-gain-bg)]' : 'bg-butter'"
              >
                <img :src="`/stickers/${c.sticker}.png`" :alt="c.name" class="w-10 h-10 object-contain" />
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5 mb-1">
                  <span class="font-extrabold text-base text-ink truncate">{{ c.name }}</span>
                  <span class="chip text-[11px] py-0 px-2" :class="c.kind === 'income' ? 'bg-[var(--color-gain-bg)]' : 'bg-ground'">
                    {{ c.kind === 'income' ? 'Thu' : 'Chi' }}
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-1.5">
                  <span v-if="c.isDefault" class="chip text-[10px] py-0 px-1.5 bg-ground text-ink-soft">
                    Mặc định
                  </span>
                  <span v-else-if="!c.groupId" class="chip text-[10px] py-0 px-1.5 bg-lilac text-ink">
                    Cá nhân
                  </span>
                  <span v-else class="chip text-[10px] py-0 px-1.5 bg-butter text-ink">
                    Nhóm: {{ store.group(c.groupId)?.name || 'Nhóm chung' }}
                  </span>
                </div>

                <p class="hand text-base text-ink-soft leading-snug mt-1 truncate">{{ c.hint }}</p>
              </div>
            </div>

            <button
              v-if="canDelete(c)"
              type="button"
              class="text-xs font-semibold underline text-loss cursor-pointer shrink-0 hover:opacity-80"
              @click="removeCategory(c.id)"
            >
              Xóa
            </button>
            <span v-else-if="c.isDefault" class="text-xs text-ink-soft font-semibold shrink-0">Cố định</span>
          </div>
        </div>
      </div>

      <!-- Creation Form -->
      <form class="panel p-6 sm:p-7 flex flex-col gap-4 bg-paper" @submit.prevent="addCategory">
        <h2 class="text-xl font-extrabold text-ink">Tạo danh mục mới</h2>

        <!-- Scope selection -->
        <div>
          <label class="field-label">Phạm vi áp dụng</label>
          <div class="seg">
            <button
              type="button"
              :aria-pressed="scope === 'personal'"
              @click="scope = 'personal'"
            >
              Cá nhân (Chỉ tôi)
            </button>
            <button
              type="button"
              :aria-pressed="scope === 'group'"
              @click="scope = 'group'"
              :disabled="myGroups.length === 0"
            >
              Nhóm chi tiêu {{ myGroups.length === 0 ? '(Chưa có nhóm)' : '' }}
            </button>
          </div>
          <p class="text-[11px] text-ink-soft mt-1.5">
            {{ scope === 'personal' ? 'Danh mục cá nhân chỉ hiển thị riêng cho tài khoản của bạn.' : 'Danh mục nhóm sẽ hiển thị cho tất cả thành viên trong nhóm đó.' }}
          </p>
        </div>

        <!-- Group Selector if scope is group -->
        <div v-if="scope === 'group'">
          <label for="cat-group" class="field-label">Chọn nhóm chi tiêu <span class="text-loss">*</span></label>
          <select id="cat-group" v-model="selectedGroupId" class="field" required>
            <option value="" disabled>-- Chọn một nhóm --</option>
            <option v-for="g in myGroups" :key="g.id" :value="g.id">
              {{ g.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="cat-name" class="field-label">Tên danh mục <span class="text-loss">*</span></label>
          <input id="cat-name" v-model="name" type="text" class="field" placeholder="Ví dụ: Tiền trọ, Tiệc tất niên, Thú cưng..." required />
        </div>

        <div>
          <label class="field-label">Phân loại</label>
          <div class="seg">
            <button type="button" :aria-pressed="kind === 'expense'" @click="kind = 'expense'">Khoản chi</button>
            <button type="button" :aria-pressed="kind === 'income'" @click="kind = 'income'">Khoản thu</button>
          </div>
        </div>

        <div>
          <label class="field-label">Chọn hình minh họa 3D</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="s in stickerChoices"
              :key="s.id"
              type="button"
              class="p-2 rounded-[10px] border-2 border-ink flex flex-col items-center gap-1 cursor-pointer transition-all"
              :class="sticker === s.id ? 'bg-lilac outline-3 outline-pink shadow-md' : 'bg-paper hover:bg-ground'"
              @click="sticker = s.id"
            >
              <img :src="`/stickers/${s.id}.png`" :alt="s.label" class="w-8 h-8 object-contain" />
              <span class="text-[11px] font-semibold">{{ s.label }}</span>
            </button>
          </div>
        </div>

        <div>
          <label for="cat-hint" class="field-label">Gợi ý ngắn</label>
          <input id="cat-hint" v-model="hint" type="text" class="field" placeholder="Ví dụ: Ăn uống chung, tiền trúng số..." />
        </div>

        <button type="submit" class="btn btn-ink self-start font-bold">Lưu danh mục</button>
      </form>
    </div>
  </div>
</template>
