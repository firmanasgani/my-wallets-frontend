<template>
  <li class="support-message" :class="message.senderType === 'USER' ? 'is-mine' : 'is-support'">
    <span v-if="message.senderType === 'ADMIN'" class="support-message-avatar" aria-hidden="true"><AppIcon name="chat" /></span>
    <div class="support-bubble"><span class="support-sender">{{ message.senderType === 'USER' ? 'Kamu' : 'Tim Moneytory' }}</span><p>{{ message.content }}</p><a v-if="attachment" :href="attachment" target="_blank" rel="noopener noreferrer" class="support-attachment"><AppIcon name="attachment" />Buka lampiran<AppIcon name="arrow" /></a><footer><time :datetime="message.createdAt">{{ chatTime(message.createdAt) }}</time><span v-if="message.senderType === 'USER'" class="support-message-receipt"><AppIcon :name="message.isRead ? 'eye' : 'check'" />{{ message.isRead ? 'Dibaca tim' : 'Terkirim' }}</span></footer></div>
  </li>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { chatAttachmentUrl, chatTime } from '@/utils/chat'
import type { ChatMessage } from '@/types/chat'
const props = defineProps<{ message: ChatMessage }>()
const attachment = computed(() => chatAttachmentUrl(props.message.attachmentUrl, window.location.origin))
</script>
