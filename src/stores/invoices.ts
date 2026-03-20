import { defineStore } from 'pinia'
import { ref } from 'vue'
import { BusinessService } from '@/services/business.service'
import type { Invoice, InvoiceStatus, CreateInvoicePayload, UpdateInvoicePayload, PayInvoicePayload } from '@/types/business'

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([])
  const currentInvoice = ref<Invoice | null>(null)
  const isLoading = ref(false)
  const isDetailLoading = ref(false)
  const isSubmitting = ref(false)

  const fetchInvoices = async (status?: InvoiceStatus) => {
    isLoading.value = true
    try {
      const result = await BusinessService.getInvoices({ status })
      invoices.value = result.data
      return result.data
    } finally {
      isLoading.value = false
    }
  }

  const fetchInvoiceById = async (id: string) => {
    isDetailLoading.value = true
    try {
      const invoice = await BusinessService.getInvoiceById(id)
      currentInvoice.value = invoice
      return invoice
    } finally {
      isDetailLoading.value = false
    }
  }

  const createInvoice = async (payload: CreateInvoicePayload) => {
    isSubmitting.value = true
    try {
      const invoice = await BusinessService.createInvoice(payload)
      invoices.value.unshift(invoice)
      return invoice
    } finally {
      isSubmitting.value = false
    }
  }

  const updateInvoice = async (id: string, payload: UpdateInvoicePayload) => {
    isSubmitting.value = true
    try {
      const invoice = await BusinessService.updateInvoice(id, payload)
      const idx = invoices.value.findIndex((i) => i.id === id)
      if (idx !== -1) invoices.value[idx] = invoice
      if (currentInvoice.value?.id === id) currentInvoice.value = invoice
      return invoice
    } finally {
      isSubmitting.value = false
    }
  }

  const deleteInvoice = async (id: string) => {
    isSubmitting.value = true
    try {
      const result = await BusinessService.deleteInvoice(id)
      invoices.value = invoices.value.filter((i) => i.id !== id)
      if (currentInvoice.value?.id === id) currentInvoice.value = null
      return result
    } finally {
      isSubmitting.value = false
    }
  }

  const sendInvoice = async (id: string) => {
    isSubmitting.value = true
    try {
      const invoice = await BusinessService.sendInvoice(id)
      const idx = invoices.value.findIndex((i) => i.id === id)
      if (idx !== -1) invoices.value[idx] = invoice
      if (currentInvoice.value?.id === id) currentInvoice.value = invoice
      return invoice
    } finally {
      isSubmitting.value = false
    }
  }

  const payInvoice = async (id: string, payload: PayInvoicePayload) => {
    isSubmitting.value = true
    try {
      const result = await BusinessService.payInvoice(id, payload)
      // Re-fetch to get updated status
      await fetchInvoiceById(id)
      const idx = invoices.value.findIndex((i) => i.id === id)
      if (idx !== -1 && currentInvoice.value) {
        invoices.value[idx] = currentInvoice.value
      }
      return result
    } finally {
      isSubmitting.value = false
    }
  }

  const duplicateInvoice = async (id: string) => {
    isSubmitting.value = true
    try {
      const invoice = await BusinessService.duplicateInvoice(id)
      return invoice
    } finally {
      isSubmitting.value = false
    }
  }

  const clearStore = () => {
    invoices.value = []
    currentInvoice.value = null
  }

  return {
    invoices,
    currentInvoice,
    isLoading,
    isDetailLoading,
    isSubmitting,
    fetchInvoices,
    fetchInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    payInvoice,
    duplicateInvoice,
    clearStore,
  }
})
