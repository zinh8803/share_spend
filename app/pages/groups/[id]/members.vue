<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import { vnd } from '~/utils/money'

const route = useRoute()
const store = useAppStore()
const groupId = computed(() => String(route.params.id))
const group = computed(() => store.group(groupId.value))

const activeMembers = computed(() => store.groupMembers(groupId.value, false))
const leftMembers = computed(() => store.groupMembers(groupId.value, true).filter(m => m.status === 'left'))
const balances = computed(() => store.groupBalances(groupId.value))

const newName = ref('')
const newEmail = ref('')
const feedback = ref('')

async function addMember() {
  feedback.value = ''
  if (!newName.value.trim() || !newEmail.value.trim()) {
    feedback.value = 'Nhập đủ tên và email thành viên.'
    return
  }
  const err = await store.addMember(groupId.value, newName.value.trim(), newEmail.value.trim())
  if (err) {
    feedback.value = err
    return
  }
  newName.value = ''
  newEmail.value = ''
}

async function removeMember(userId: string) {
  feedback.value = ''
  const err = await store.removeMember(groupId.value, userId)
  if (err) feedback.value = err
}
</script>

<template>
  <div v-if="group">
    <GroupHeader :group-id="groupId" />

    <div class="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-7 items-start">
      <div class="panel p-6 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-extrabold">Thành viên đang tham gia ({{ activeMembers.length }})</h2>
          <span class="text-xs text-ink-soft font-semibold">Mã mời: {{ group.inviteCode }}</span>
        </div>

        <p v-if="feedback" role="alert" class="field-error">{{ feedback }}</p>

        <div class="flex flex-col">
          <div
            v-for="m in activeMembers"
            :key="m.userId"
            class="row-line flex flex-wrap items-center justify-between gap-3 py-3.5"
          >
            <div class="flex items-center gap-3.5">
              <PhotoAvatar
                :avatar="store.user(m.userId)?.avatar"
                :seed="store.user(m.userId)?.name || m.userId"
                :bg="store.user(m.userId)?.frame"
                :size="52"
              />
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-base">{{ store.user(m.userId)?.name }}</span>
                  <span class="chip" :class="m.role === 'owner' ? 'bg-butter' : 'bg-ground'">
                    {{ m.role === 'owner' ? 'Owner (Chủ nhóm)' : 'Member' }}
                  </span>
                </div>
                <div class="text-xs text-ink-soft mt-0.5">
                  {{ store.user(m.userId)?.email }} · Đã trả {{ vnd(balances[m.userId]?.paid || 0) }} · Chịu {{ vnd(balances[m.userId]?.share || 0) }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <button
                v-if="m.role !== 'owner' && group.status === 'active'"
                type="button"
                class="text-xs font-semibold underline cursor-pointer"
                @click="store.transferOwnership(groupId, m.userId)"
              >
                Chuyển quyền Owner
              </button>
              <button
                v-if="group.status === 'active'"
                type="button"
                class="text-xs font-semibold underline loss cursor-pointer"
                @click="removeMember(m.userId)"
              >
                Rời nhóm
              </button>
            </div>
          </div>
        </div>

        <div v-if="leftMembers.length" class="pt-4 border-t-2 border-dashed border-line">
          <h3 class="text-sm font-extrabold text-ink-soft mb-2">
            Đã rời nhóm (lịch sử giao dịch và công nợ cũ vẫn được bảo toàn)
          </h3>
          <div v-for="m in leftMembers" :key="m.userId" class="flex items-center justify-between py-2 text-sm opacity-75">
            <span>{{ store.user(m.userId)?.name }} ({{ store.user(m.userId)?.email }})</span>
            <span class="num font-semibold">Số dư ròng: {{ vnd(balances[m.userId]?.net || 0, { sign: true }) }}</span>
          </div>
        </div>
      </div>

      <form
        v-if="group.status === 'active'"
        class="panel p-6 flex flex-col gap-4"
        @submit.prevent="addMember"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold">Mời thêm bạn vào nhóm</h2>
            <p class="text-xs text-ink-soft mt-0.5">
              Một tài khoản không thể bị thêm trùng hai lần vào cùng một nhóm.
            </p>
          </div>
          <img src="/stickers/phong-bi.png" alt="Mời bạn" class="w-11 h-11 object-contain" />
        </div>

        <div>
          <label for="m-name" class="field-label">Tên thành viên</label>
          <input id="m-name" v-model="newName" type="text" class="field" placeholder="Ví dụ: Thảo" />
        </div>

        <div>
          <label for="m-email" class="field-label">Email</label>
          <input id="m-email" v-model="newEmail" type="email" class="field" placeholder="thao@example.com" />
        </div>

        <button type="submit" class="btn btn-ink self-start">Thêm vào dải ảnh nhóm</button>
      </form>
    </div>
  </div>
</template>

