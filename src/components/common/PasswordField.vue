<template>
  <div class="money-password-field"><label :for="id">{{ label }}</label><div><input :id="id" :value="modelValue" :type="visible ? 'text' : 'password'" :autocomplete="autocomplete" :disabled="disabled" :required="required" :minlength="minlength" :aria-describedby="describedBy" :autofocus="autofocus" autocapitalize="off" :spellcheck="false" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" /><button type="button" :aria-label="`${visible ? 'Sembunyikan' : 'Tampilkan'} ${label.toLowerCase()}`" :aria-pressed="visible" :disabled="disabled" @click="visible = !visible"><AppIcon :name="visible ? 'eyeOff' : 'eye'" /></button></div></div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import '@/assets/password-field.css'
defineProps<{ id: string; modelValue: string; label: string; autocomplete: 'current-password' | 'new-password'; disabled?: boolean; required?: boolean; minlength?: number; describedBy?: string; autofocus?: boolean }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
const visible = ref(false)
</script>
