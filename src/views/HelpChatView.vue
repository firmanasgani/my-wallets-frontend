<template>
  <div class="money-support">
    <header class="support-heading"><div><span class="shell-overline">KAMI SIAP MENDENGARKAN</span><h1>Ada yang bisa kami bantu?</h1><p>Ceritakan kendalamu kepada tim bantuan Moneytory melalui percakapan ini.</p></div><RouterLink :to="{ name: 'settings' }" class="support-button"><AppIcon name="settings" />Pengaturan</RouterLink></header>
    <div class="support-layout">
      <section class="support-chat" aria-labelledby="support-chat-title">
        <header class="support-chat-header"><span class="support-team-symbol"><AppIcon name="chat" /></span><div><h2 id="support-chat-title">Tim bantuan Moneytory</h2><span class="support-connection" :class="`is-${chat.connectionState}`" role="status"><span aria-hidden="true"></span>{{ chatConnectionLabel(chat.connectionState) }}</span></div><button type="button" class="support-icon-button" :aria-label="chat.soundEnabled ? 'Nonaktifkan suara pesan' : 'Aktifkan suara pesan'" :aria-pressed="chat.soundEnabled" :title="chat.soundEnabled ? 'Suara pesan aktif' : 'Suara pesan nonaktif'" @click="chat.soundEnabled = !chat.soundEnabled"><AppIcon :name="chat.soundEnabled ? 'volume' : 'volumeOff'" /></button><button type="button" class="support-icon-button" aria-label="Muat ulang percakapan" title="Muat ulang percakapan" :disabled="chat.isLoading || chat.isSending" @click="refresh"><AppIcon name="refresh" /></button></header>
        <div v-if="chat.historyError || chat.connectionError" class="support-connection-notice" role="alert"><AppIcon name="warning" /><p>{{ chat.historyError || chat.connectionError }}</p><button type="button" class="support-text-button" :disabled="chat.isLoading" @click="refresh">Coba lagi</button></div>
        <div v-else-if="chat.connectionState === 'disconnected' || chat.connectionState === 'connecting'" class="support-reconnect-note" role="status"><span v-if="chat.connectionState === 'connecting'" class="support-spinner" aria-hidden="true"></span><AppIcon v-else name="info" /><p>{{ chat.connectionState === 'connecting' ? 'Menyambungkan ke percakapan...' : 'Koneksi terputus. Draf pesanmu tetap tersimpan.' }}</p><button v-if="chat.connectionState === 'disconnected'" type="button" class="support-text-button" @click="refresh">Hubungkan lagi</button></div>
        <div ref="scrollArea" class="support-message-scroll" tabindex="0" aria-label="Riwayat percakapan bantuan" @scroll="handleScroll">
          <div v-if="chat.hasOlder" class="support-load-older"><button type="button" class="support-button" :disabled="chat.isLoadingOlder || chat.isLoading" @click="loadOlder"><span v-if="chat.isLoadingOlder" class="support-spinner" aria-hidden="true"></span>{{ chat.isLoadingOlder ? 'Memuat pesan...' : 'Muat pesan sebelumnya' }}</button><p v-if="chat.olderError" role="alert">{{ chat.olderError }}</p></div>
          <div v-if="chat.isLoading && !chat.messages.length" class="support-empty" role="status"><span class="support-spinner" aria-hidden="true"></span><h3>Memuat percakapanmu...</h3></div>
          <div v-else-if="!chat.messages.length && !chat.historyError" class="support-empty"><span class="support-empty-symbol"><AppIcon name="chat" /></span><span class="shell-overline">MULAI DARI CERITAMU</span><h3>Kita cari jalan keluarnya bersama.</h3><p>Tulis pertanyaan atau pilih topik di samping untuk menyiapkan draf pesan.</p></div>
          <ol v-else class="support-days" role="log" aria-label="Pesan percakapan" aria-live="polite" aria-relevant="additions" :aria-busy="chat.isLoading || chat.isLoadingOlder"><li v-for="group in groups" :key="group.key"><h3 class="support-day-label">{{ group.label }}</h3><ol><ChatMessageBubble v-for="message in group.messages" :key="message.id" :message="message" /></ol></li></ol>
        </div>
        <div v-if="newCount" class="support-new-messages"><button type="button" class="support-button" @click="scrollToBottom"><AppIcon name="down" />{{ newCount }} pesan baru</button></div>
        <div v-if="chat.conversation?.status === 'CLOSED'" class="support-closed-note"><AppIcon name="check" /><p>Percakapan ditandai selesai. Pesan baru akan membuka percakapan kembali.</p></div>
        <form class="support-composer" :aria-busy="chat.isSending" @submit.prevent="handleSend">
          <div v-if="chat.sendError" class="support-send-error" role="alert"><AppIcon name="warning" /><div><p>{{ chat.sendError }}</p><button v-if="chat.sendUnconfirmed" type="button" class="support-text-button" :disabled="chat.isLoading" @click="refresh">Periksa riwayat percakapan</button></div></div>
          <label class="shell-sr-only" for="support-draft">Pesan untuk tim bantuan</label><textarea id="support-draft" ref="composer" v-model="chat.draft" :disabled="chat.isSending" rows="3" :maxlength="CHAT_MESSAGE_LIMIT" placeholder="Tulis pertanyaan atau kendalamu..." aria-describedby="support-compose-hint support-character-count" @keydown="handleComposerKey"></textarea>
          <footer><div><p id="support-compose-hint">Enter untuk kirim · Shift + Enter untuk baris baru</p><span id="support-character-count">{{ chat.draft.length.toLocaleString('id-ID') }}/4.000 karakter</span></div><button type="submit" class="support-button is-primary" :disabled="!canSend"><span v-if="chat.isSending" class="support-spinner" aria-hidden="true"></span><AppIcon v-else name="send" />{{ chat.isSending ? 'Mengirim...' : 'Kirim pesan' }}</button></footer><span v-if="chat.isSending" class="shell-sr-only" role="status">Menunggu konfirmasi pengiriman pesan.</span>
        </form>
      </section>
      <aside class="support-sidebar"><section class="support-guide"><span class="support-guide-symbol"><AppIcon name="help" /></span><span class="shell-overline">BANTU KAMI MEMAHAMI</span><h2>Mulai dari topik yang paling dekat.</h2><p>Pilih topik untuk menyiapkan draf. Kamu bisa melengkapinya sebelum mengirim.</p><div class="support-topics"><button v-for="topic in topics" :key="topic.label" type="button" :disabled="chat.isSending || chat.sendUnconfirmed" @click="useTopic(topic.prompt)"><AppIcon :name="topic.icon" /><span>{{ topic.label }}</span><AppIcon name="plus" /></button></div></section><section class="support-info-card"><h2>Agar lebih mudah ditelusuri</h2><p>Sebutkan halaman yang dibuka, langkah yang dilakukan, dan hasil yang kamu harapkan.</p><p>Balasan tim akan muncul di percakapan ini. Status koneksi ditampilkan di bagian atas chat.</p></section><section class="support-shortcuts"><h2>Akses cepat</h2><RouterLink :to="{ name: 'settings', query: { section: 'payment-history' } }"><AppIcon name="credit" />Riwayat pembayaran<AppIcon name="arrow" /></RouterLink><RouterLink :to="{ name: 'profile' }"><AppIcon name="user" />Profil & keamanan<AppIcon name="arrow" /></RouterLink></section></aside>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import AppIcon from '@/components/common/AppIcon.vue'
import ChatMessageBubble from '@/components/support/ChatMessageBubble.vue'
import { CHAT_MESSAGE_LIMIT, chatConnectionLabel, chatDayGroups, chatMessageProblem, shouldSendOnEnter } from '@/utils/chat'
import '@/assets/support-chat.css'
const chat = useChatStore()
chat.prepareSession()
const scrollArea = ref<HTMLElement | null>(null), composer = ref<HTMLTextAreaElement | null>(null)
const nearBottom = ref(true), newCount = ref(0)
const groups = computed(() => chatDayGroups(chat.messages))
const canSend = computed(() => chat.connected && !!chat.conversation && !chat.isLoading && !chat.isLoadingOlder && !chat.isSending && !chat.sendUnconfirmed && !chatMessageProblem(chat.draft))
const topics = [{ label: 'Transaksi & saldo', icon: 'wallet', prompt: 'Saya butuh bantuan terkait transaksi atau saldo. Halaman yang saya buka: ' }, { label: 'Paket & pembayaran', icon: 'credit', prompt: 'Saya butuh bantuan terkait paket atau pembayaran. Kendala yang saya alami: ' }, { label: 'Akun & akses', icon: 'lock', prompt: 'Saya butuh bantuan terkait akun atau akses. Kendala yang saya alami: ' }, { label: 'Saran & kendala lain', icon: 'chat', prompt: 'Saya ingin menyampaikan saran atau kendala berikut: ' }]
let active = true
const updateReading = () => chat.setReading(nearBottom.value && document.visibilityState === 'visible' && document.hasFocus())
const handleScroll = () => { if (!scrollArea.value) return; const area = scrollArea.value; nearBottom.value = area.scrollHeight - area.clientHeight - area.scrollTop < 80; if (nearBottom.value) newCount.value = 0; updateReading() }
const scrollToBottom = async () => { await nextTick(); if (!active || !scrollArea.value) return; scrollArea.value.scrollTop = scrollArea.value.scrollHeight; nearBottom.value = true; newCount.value = 0; updateReading() }
const loadOlder = async () => { const area = scrollArea.value; if (!area) return; const height = area.scrollHeight, top = area.scrollTop; await chat.loadOlder(); await nextTick(); if (active && scrollArea.value === area) { area.scrollTop = top + area.scrollHeight - height; handleScroll() } }
const refresh = async () => { if (chat.isLoading || chat.isLoadingOlder || chat.isSending) return; await chat.loadHistory(); if (!active) return; if (!chat.connected) chat.connect(); await scrollToBottom() }
const handleSend = async () => { if (!canSend.value) return; if (await chat.sendMessage(chat.draft)) { await scrollToBottom(); composer.value?.focus() } }
const handleComposerKey = (event: KeyboardEvent) => { if (shouldSendOnEnter(event)) { event.preventDefault(); void handleSend() } }
const useTopic = async (prompt: string) => { chat.draft = (chat.draft ? chat.draft + '\n' : '') + prompt; chat.draft = chat.draft.slice(0, CHAT_MESSAGE_LIMIT); await nextTick(); composer.value?.focus() }
watch(() => chat.messages[chat.messages.length - 1]?.id, (latest, previous) => { if (!latest || latest === previous) return; if (!previous || nearBottom.value) void scrollToBottom(); else { const index = chat.messages.findIndex((message) => message.id === previous); newCount.value += Math.max(1, chat.messages.length - index - 1) } })
onMounted(async () => {
  document.addEventListener('visibilitychange', updateReading); window.addEventListener('focus', updateReading); window.addEventListener('blur', updateReading)
  await chat.loadHistory()
  if (!active) return
  chat.connect(); await scrollToBottom()
})
onUnmounted(() => { active = false; document.removeEventListener('visibilitychange', updateReading); window.removeEventListener('focus', updateReading); window.removeEventListener('blur', updateReading); chat.disconnect() })
</script>
