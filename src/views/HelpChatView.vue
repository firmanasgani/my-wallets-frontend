<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate">
        Chat Bantuan
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Chat langsung dengan tim support Moneytory Ledger.
      </p>
    </div>

    <div
      class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[65vh]"
    >
      <div
        class="px-6 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between"
      >
        <h3 class="text-sm font-medium text-slate-900 dark:text-white">Tim Support</h3>
        <span
          class="inline-flex items-center gap-1.5 text-xs font-medium"
          :class="chatStore.connected ? 'text-[#2E8B57] dark:text-emerald-400' : 'text-slate-400'"
        >
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="chatStore.connected ? 'bg-[#2E8B57] dark:bg-emerald-400' : 'bg-slate-400'"
          ></span>
          {{ chatStore.connected ? 'Online' : 'Menghubungkan...' }}
        </span>
      </div>

      <div ref="scrollArea" class="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        <LoadingSpinner v-if="chatStore.isLoading" text="Memuat percakapan..." />

        <p
          v-else-if="chatStore.messages.length === 0"
          class="text-center text-sm text-slate-400 dark:text-slate-500 mt-8"
        >
          Belum ada pesan. Kirim pesan pertama Anda ke tim support kami.
        </p>

        <div
          v-for="message in chatStore.messages"
          :key="message.id"
          class="flex"
          :class="message.senderType === 'USER' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[75%] rounded-2xl px-4 py-2 text-sm"
            :class="
              message.senderType === 'USER'
                ? 'bg-[#2E8B57] text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
            "
          >
            <p class="whitespace-pre-wrap break-words">{{ message.content }}</p>
            <p
              class="mt-1 text-[10px] opacity-70"
              :class="message.senderType === 'USER' ? 'text-white' : 'text-slate-500 dark:text-slate-400'"
            >
              {{ formatTime(message.createdAt) }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSend" class="flex gap-2 border-t border-slate-100 dark:border-slate-700 p-3">
        <input
          v-model="draft"
          type="text"
          placeholder="Tulis pesan..."
          class="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent transition-all"
        />
        <button
          type="submit"
          :disabled="!draft.trim()"
          class="bg-[#2E8B57] hover:bg-[#236B43] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 rounded-lg transition-all"
        >
          Kirim
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const chatStore = useChatStore()
const draft = ref('')
const scrollArea = ref<HTMLElement | null>(null)

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollArea.value) {
      scrollArea.value.scrollTop = scrollArea.value.scrollHeight
    }
  })
}

watch(() => chatStore.messages.length, scrollToBottom)

const handleSend = () => {
  const content = draft.value.trim()
  if (!content) return
  chatStore.sendMessage(content)
  draft.value = ''
}

onMounted(async () => {
  await chatStore.loadHistory()
  chatStore.connect()
  scrollToBottom()
})

onUnmounted(() => {
  chatStore.disconnect()
})
</script>
