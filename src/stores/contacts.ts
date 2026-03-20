import { defineStore } from 'pinia'
import { ref } from 'vue'
import { BusinessService } from '@/services/business.service'
import type { Contact, ContactPayload, ContactType } from '@/types/business'

export const useContactsStore = defineStore('contacts', () => {
  const contacts = ref<Contact[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)

  const fetchContacts = async (type?: ContactType) => {
    isLoading.value = true
    try {
      const result = await BusinessService.getContacts({ type })
      contacts.value = result.data
      return contacts.value
    } finally {
      isLoading.value = false
    }
  }

  const createContact = async (payload: ContactPayload) => {
    isSubmitting.value = true
    try {
      const contact = await BusinessService.createContact(payload)
      contacts.value.push(contact)
      contacts.value.sort((a, b) => a.name.localeCompare(b.name))
      return contact
    } finally {
      isSubmitting.value = false
    }
  }

  const updateContact = async (id: string, payload: Partial<ContactPayload>) => {
    isSubmitting.value = true
    try {
      const updated = await BusinessService.updateContact(id, payload)
      const idx = contacts.value.findIndex((c) => c.id === id)
      if (idx !== -1) contacts.value[idx] = updated
      contacts.value.sort((a, b) => a.name.localeCompare(b.name))
      return updated
    } finally {
      isSubmitting.value = false
    }
  }

  const deleteContact = async (id: string) => {
    isSubmitting.value = true
    try {
      const result = await BusinessService.deleteContact(id)
      contacts.value = contacts.value.filter((c) => c.id !== id)
      return result
    } finally {
      isSubmitting.value = false
    }
  }

  const clearStore = () => {
    contacts.value = []
  }

  return {
    contacts,
    isLoading,
    isSubmitting,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    clearStore,
  }
})
