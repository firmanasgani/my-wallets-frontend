<template>
  <ConfirmationModal :is-open="isOpen" :title="blocked ? 'Lepaskan alokasi terlebih dahulu.' : 'Hapus goal keuangan?'" :message="blocked ? `Goal ${goal?.name} masih memiliki alokasi ${accountMoney(goalNumber(goal?.currentSaved), 'IDR')}. Lepaskan seluruh alokasi melalui detail goal sebelum menghapusnya. Saldo akun tidak berubah saat alokasi dilepas.` : `Hapus goal ${goal?.name || 'ini'} beserta riwayat alokasinya? Tindakan ini tidak dapat dibatalkan. Transaksi pengeluaran yang sudah tercatat tetap tersimpan.`" :icon-type="blocked ? 'warning' : 'danger'" :confirm-button-text="blocked ? 'Kelola alokasi' : 'Hapus goal'" :is-confirming="deleting" @update:is-open="!$event && $emit('close')" @confirm="confirm" />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, type LocationQueryRaw } from 'vue-router'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { useFinancialGoalStore } from '@/stores/financialGoals'
import { useToastStore } from '@/stores/toast'
import { accountMoney } from '@/utils/accountList'
import { goalNumber } from '@/utils/financialGoals'
import type { FinancialGoal } from '@/types/financialGoals'
const props = defineProps<{ isOpen: boolean; goal: FinancialGoal | null; query?: LocationQueryRaw }>()
const emit = defineEmits<{ close: []; deleted: [id: string] }>()
const store = useFinancialGoalStore(), toast = useToastStore(), router = useRouter(), deleting = ref(false)
const blocked = computed(() => goalNumber(props.goal?.currentSaved) > 0)
const confirm = async () => {
  if (!props.goal || deleting.value) return
  if (blocked.value) { emit('close'); await router.push({ name: 'financial-goal-detail', params: { id: props.goal.id }, query: props.query }); return }
  const id = props.goal.id
  deleting.value = true
  try { await store.deleteGoal(id); toast.show('Goal berhasil dihapus.'); emit('deleted', id); emit('close') }
  catch (failure: unknown) { toast.show(failure instanceof Error ? failure.message : 'Goal belum berhasil dihapus.', 'error') }
  finally { deleting.value = false }
}
</script>
