<template>
  <GoalDialog :is-open="isOpen" :title="goal ? 'Sesuaikan goal keuangan.' : 'Mulai dari satu impian.'" description="Tentukan tujuan, target dana, dan waktu yang ingin kamu capai." :busy="saving" @close="$emit('close')">
    <form class="goal-dialog-form" :aria-busy="saving" @submit.prevent="submit">
      <div v-if="error" ref="errorBox" class="goal-error" role="alert" tabindex="-1"><AppIcon name="warning" />{{ error }}</div>
      <fieldset :disabled="saving"><legend class="shell-sr-only">Rencana goal keuangan</legend>
        <div class="goal-field"><label for="goal-name">Nama goal</label><input id="goal-name" v-model="draft.name" type="text" required maxlength="100" placeholder="Contoh: Dana darurat keluarga" autofocus /></div>
        <div class="goal-field goal-amount-field"><label for="goal-amount">Target nominal</label><div><span>IDR</span><CurrencyInput id="goal-amount" v-model="draft.targetAmount" required placeholder="0" /></div></div>
        <div class="goal-field"><label for="goal-date">Tanggal target <span>{{ goal?.targetDate ? '(ganti tanggal)' : '(opsional)' }}</span></label><input id="goal-date" v-model="draft.targetDate" type="date" :required="!!goal?.targetDate" /><p v-if="goal?.targetDate" class="goal-hint">Tanggal yang sudah tersimpan dapat diganti dengan tanggal lain.</p></div>
        <AppSelect v-if="goal" id="goal-status" v-model="draft.status" :options="statusOptions" label="Status goal" :disabled="saving" />
        <p v-if="goal && goalNumber(goal.currentSaved) > 0" class="goal-hint">Lepaskan seluruh alokasi dana sebelum memilih status Dibatalkan.</p>
        <div class="goal-field"><label for="goal-description">Catatan <span>(opsional)</span></label><textarea id="goal-description" v-model="draft.description" rows="3" maxlength="255" placeholder="Apa yang membuat tujuan ini berarti untukmu?"></textarea></div>
      </fieldset>
      <div class="goal-form-note"><AppIcon name="info" /><p>Membuat atau mengedit goal tidak memindahkan uang. Tambahkan alokasi dana dari halaman detail.</p></div>
      <footer class="goal-dialog-actions"><button type="button" class="goal-button" :disabled="saving" @click="$emit('close')">Batal</button><button type="submit" class="goal-button is-primary" :disabled="saving"><span v-if="saving" class="goal-spinner" aria-hidden="true"></span><AppIcon v-else name="check" />{{ saving ? 'Menyimpan...' : goal ? 'Simpan perubahan' : 'Buat goal' }}</button></footer>
    </form>
  </GoalDialog>
</template>
<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import GoalDialog from './GoalDialog.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import { useFinancialGoalStore } from '@/stores/financialGoals'
import { GoalStatus } from '@/types/enums'
import type { FinancialGoal } from '@/types/financialGoals'
import { buildGoalPayload, goalNumber, goalStatusOptions, type GoalDraft } from '@/utils/financialGoals'
const props = defineProps<{ isOpen: boolean; goal?: FinancialGoal | null }>()
const emit = defineEmits<{ close: []; success: [] }>()
const store = useFinancialGoalStore(), saving = ref(false), error = ref(''), errorBox = ref<HTMLElement | null>(null)
const draft = reactive<GoalDraft>({ name: '', targetAmount: null, targetDate: '', description: '', status: GoalStatus.ACTIVE })
const statusOptions = computed(() => goalStatusOptions.map((option) => ({ ...option, disabled: option.value === GoalStatus.CANCELLED && props.goal?.status !== GoalStatus.CANCELLED && goalNumber(props.goal?.currentSaved) > 0 })))
watch(() => props.isOpen, (open) => { if (open) { error.value = ''; Object.assign(draft, { name: props.goal?.name || '', targetAmount: props.goal ? goalNumber(props.goal.targetAmount) : null, targetDate: props.goal?.targetDate?.slice(0, 10) || '', description: props.goal?.description || '', status: props.goal?.status || GoalStatus.ACTIVE }) } }, { immediate: true })
const submit = async () => {
  if (saving.value) return
  error.value = ''
  try {
    const payload = buildGoalPayload(draft, props.goal)
    saving.value = true
    if (props.goal) await store.updateGoal(props.goal.id, payload)
    else await store.createGoal(payload)
    emit('success')
  } catch (failure: unknown) { error.value = failure instanceof Error ? failure.message : 'Goal belum berhasil disimpan.'; await nextTick(); errorBox.value?.focus() }
  finally { saving.value = false }
}
</script>
