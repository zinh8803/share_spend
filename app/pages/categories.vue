<script setup lang="ts">
import { useAppStore, type TxType } from '~/stores/app'

const store = useAppStore()
const name = ref('')
const kind = ref<TxType>('expense')
const sticker = ref('ca-phe')
const hint = ref('')
const message = ref('')

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

function addCategory() {
  message.value = ''
  if (!name.value.trim()) {
    message.value = 'Nhập tên danh mục trước khi lưu.'
    return
  }
  store.saveCategory({
    name: name.value.trim(),
    kind: kind.value,
    sticker: sticker.value,
    hint: hint.value.trim() || 'Danh mục tự tạo'
  })
  name.value = ''
  hint.value = ''
}

async function removeCategory(id: string) {
  const err = await store.deleteCategory(id)
  if (err) message.value = err
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold">Danh mục thu chi</h1>
        <p class="text-sm text-ink-soft mt-1">
          Mỗi danh mục gắn với một hình 3D riêng biệt để nhận diện tức thì trên bảng giao dịch.
        </p>
      </div>
      <NuxtLink to="/transactions/new" class="btn btn-ink">Thêm giao dịch mới</NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-7 items-start">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="c in store.categories"
          :key="c.id"
          class="panel p-4 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3.5">
            <div
              class="w-14 h-14 rounded-[10px] border-2 border-ink flex items-center justify-center shrink-0"
              :class="c.kind === 'income' ? 'bg-[var(--color-gain-bg)]' : 'bg-butter'"
            >
              <img :src="`/stickers/${c.sticker}.png`" :alt="c.name" class="w-10 h-10 object-contain" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-base">{{ c.name }}</span>
                <span class="chip" :class="c.kind === 'income' ? 'bg-[var(--color-gain-bg)]' : 'bg-ground'">
                  {{ c.kind === 'income' ? 'Thu' : 'Chi' }}
                </span>
              </div>
              <p class="hand text-lg text-ink-soft leading-snug mt-0.5">{{ c.hint }}</p>
            </div>
          </div>

          <button
            v-if="!c.isDefault"
            type="button"
            class="text-xs font-semibold underline loss cursor-pointer shrink-0"
            @click="removeCategory(c.id)"
          >
            Xóa
          </button>
          <span v-else class="text-xs text-ink-soft font-semibold shrink-0">Mặc định</span>
        </div>
      </div>

      <form class="panel p-6 sm:p-7 flex flex-col gap-4" @submit.prevent="addCategory">
        <h2 class="text-xl font-extrabold">Tạo danh mục mới</h2>

        <div>
          <label for="cat-name" class="field-label">Tên danh mục</label>
          <input id="cat-name" v-model="name" type="text" class="field" placeholder="Ví dụ: Thú cưng, Học tập..." />
        </div>

        <div>
          <label class="field-label">Nhóm</label>
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
              class="p-2 rounded-[10px] border-2 border-ink flex flex-col items-center gap-1 cursor-pointer"
              :class="sticker === s.id ? 'bg-lilac outline-3 outline-pink' : 'bg-paper hover:bg-ground'"
              @click="sticker = s.id"
            >
              <img :src="`/stickers/${s.id}.png`" :alt="s.label" class="w-8 h-8 object-contain" />
              <span class="text-[11px] font-semibold">{{ s.label }}</span>
            </button>
          </div>
        </div>

        <div>
          <label for="cat-hint" class="field-label">Gợi ý ngắn</label>
          <input id="cat-hint" v-model="hint" type="text" class="field" placeholder="Ví dụ: Hạt, cát mèo, khám thú y..." />
        </div>

        <p v-if="message" role="alert" class="field-error">{{ message }}</p>

        <button type="submit" class="btn btn-ink self-start">Lưu danh mục</button>
      </form>
    </div>
  </div>
</template>

