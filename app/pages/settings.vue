<script setup lang="ts">
import { useAppStore, FRAMES, AVATAR_PRESETS, type Gender } from '~/stores/app'

const store = useAppStore()
const router = useRouter()

const name = ref(store.me.name)
const email = ref(store.me.email)
const frame = ref(store.me.frame)
const gender = ref<Gender>(store.me.gender || 'male')
const avatar = ref(store.me.avatar || 'boy-cool')
const saved = ref(false)
const saving = ref(false)

const currentPresets = computed(() =>
  AVATAR_PRESETS.filter(p => p.gender === gender.value)
)

const myActivities = computed(() => {
  const myGroupIds = new Set(store.myGroups.map(g => g.id))
  return store.activity.filter(a => {
    if (a.groupId && myGroupIds.has(a.groupId)) return true
    if (a.userId && a.userId === store.meId) return true
    if (!a.groupId && (!a.userId || a.userId === store.meId)) return true
    return false
  })
})

function setGender(g: Gender) {
  gender.value = g
  const list = AVATAR_PRESETS.filter(p => p.gender === g)
  if (!list.some(p => p.id === avatar.value)) {
    avatar.value = list[0]?.id || (g === 'male' ? 'boy-cool' : 'girl-bun')
  }
}

function syncFromStore() {
  if (store.me && store.me.id && store.me.id !== 'guest') {
    name.value = store.me.name
    email.value = store.me.email
    frame.value = store.me.frame
    gender.value = store.me.gender || 'male'
    avatar.value = store.me.avatar || (gender.value === 'female' ? 'girl-bun' : 'boy-cool')
  }
}

watch(
  () => [store.hydrated, store.me.id, store.me.name, store.me.email, store.me.frame, store.me.gender, store.me.avatar],
  () => {
    syncFromStore()
  },
  { immediate: true }
)

async function save() {
  saving.value = true
  try {
    await store.updateProfile({
      name: name.value.trim() || store.me.name,
      email: email.value.trim() || store.me.email,
      frame: frame.value,
      gender: gender.value,
      avatar: avatar.value,
      currency: store.currency,
      timezone: store.timezone
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } finally {
    saving.value = false
  }
}

function handleLogout() {
  store.logout()
  router.push('/login')
}
</script>

<template>
  <div class="max-w-4xl mx-auto flex flex-col gap-7">
    <div>
      <h1 class="text-3xl font-extrabold">Cài đặt tài khoản & hồ sơ</h1>
      <p class="text-sm text-ink-soft mt-1">
        Tùy chỉnh nhân vật nam/nữ, màu khung photobooth, tên hiển thị và thông tin cá nhân.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-7 items-start">
      <form class="panel p-6 sm:p-8 flex flex-col gap-6" @submit.prevent="save">
        <!-- Live Avatar Preview -->
        <div class="flex items-center gap-4 p-4 rounded-[12px] bg-ground border-2 border-ink">
          <PhotoAvatar :avatar="avatar" :bg="frame" :size="76" :label="name || store.me.name" />
          <div class="min-w-0">
            <h2 class="text-xl font-extrabold truncate">{{ name || store.me.name }}</h2>
            <p class="hand text-lg text-ink-soft">
              Nhân vật {{ gender === 'male' ? 'Nam' : 'Nữ' }} · {{ AVATAR_PRESETS.find(p => p.id === avatar)?.label || 'Photobooth' }}
            </p>
          </div>
        </div>

        <!-- Gender Selection (Nam / Nữ) -->
        <div>
          <label class="field-label">Giới tính nhân vật đại diện</label>
          <div class="seg w-full sm:w-auto" role="group" aria-label="Chọn giới tính">
            <button
              type="button"
              :aria-pressed="gender === 'male'"
              @click="setGender('male')"
            >
              Nhân vật Nam
            </button>
            <button
              type="button"
              :aria-pressed="gender === 'female'"
              @click="setGender('female')"
            >
              Nhân vật Nữ
            </button>
          </div>
        </div>

        <!-- Avatar Character Picker -->
        <div>
          <label class="field-label">Chọn phong cách nhân vật ({{ gender === 'male' ? 'Nam' : 'Nữ' }})</label>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            <button
              v-for="p in currentPresets"
              :key="p.id"
              type="button"
              class="flex flex-col items-center gap-1.5 p-2 rounded-[10px] border-2 border-ink cursor-pointer transition-transform bg-paper hover:bg-ground"
              :class="avatar === p.id ? 'outline-4 outline-pink bg-lilac -translate-y-0.5' : ''"
              :aria-label="`Chọn phong cách ${p.label}`"
              @click="avatar = p.id"
            >
              <PhotoAvatar :avatar="p.id" :bg="frame" :size="48" />
              <span class="text-xs font-bold text-ink truncate max-w-full">{{ p.label }}</span>
            </button>
          </div>
        </div>

        <!-- Frame Color Picker -->
        <div>
          <label class="field-label">Màu nền khung ảnh photobooth</label>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="color in FRAMES"
              :key="color"
              type="button"
              class="w-10 h-10 rounded-[8px] border-2 border-ink cursor-pointer"
              :class="frame === color ? 'outline-4 outline-pink' : ''"
              :style="{ backgroundColor: color }"
              :aria-label="`Chọn màu ${color}`"
              @click="frame = color"
            />
          </div>
        </div>

        <!-- Name & Email Inputs -->
        <div>
          <label for="st-name" class="field-label">Tên hiển thị</label>
          <input id="st-name" v-model="name" type="text" class="field" />
        </div>

        <div>
          <label for="st-email" class="field-label">Email</label>
          <input id="st-email" v-model="email" type="email" class="field" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="st-cur" class="field-label">Tiền tệ mặc định</label>
            <select id="st-cur" v-model="store.currency" class="field">
              <option value="VND">VND (đồng)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label for="st-tz" class="field-label">Múi giờ</label>
            <select id="st-tz" v-model="store.timezone" class="field">
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
            </select>
          </div>
        </div>

        <p v-if="saved" role="status" class="gain text-sm font-semibold">
          Đã lưu thông tin cá nhân và nhân vật đại diện.
        </p>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button type="submit" class="btn btn-ink" :disabled="saving">
            {{ saving ? 'Đang lưu...' : 'Lưu cài đặt' }}
          </button>
          <button type="button" class="btn loss" @click="handleLogout">Đăng xuất</button>
        </div>
      </form>

      <!-- Right Column: Only Activity History -->
      <div class="flex flex-col gap-6">
        <div class="panel p-6 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-extrabold">Lịch sử hoạt động</h2>
            <span class="text-xs text-ink-soft font-semibold">Của bạn & nhóm</span>
          </div>
          <p class="text-xs text-ink-soft">
            Chỉ hiển thị các hoạt động của bạn hoặc các nhóm bạn đang tham gia.
          </p>

          <ul v-if="myActivities.length" class="flex flex-col gap-2.5 text-sm">
            <li
              v-for="act in myActivities.slice(0, 15)"
              :key="act.id"
              class="row-line pt-2.5 flex justify-between gap-3"
            >
              <div class="flex flex-col min-w-0">
                <span class="leading-snug break-words">{{ act.text }}</span>
                <span v-if="act.groupId && store.group(act.groupId)" class="text-xs text-ink-soft font-semibold mt-0.5">
                  Nhóm: {{ store.group(act.groupId)?.name }}
                </span>
              </div>
              <span class="text-xs text-ink-soft num shrink-0">{{ act.at.slice(0, 10) }}</span>
            </li>
          </ul>
          <p v-else class="hand text-lg text-ink-soft py-3">
            Chưa có hoạt động nào trong nhóm hoặc tài khoản của bạn.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
