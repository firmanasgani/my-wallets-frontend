import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, reactive } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useSubscriptionStore } from '@/stores/subscriptions'
import SubscriptionCheckoutView from '../SubscriptionCheckoutView.vue'

const mocks = vi.hoisted(() => ({
  route: { query: { action: 'upgrade' } as Record<string, string> },
  profile: vi.fn(),
  push: vi.fn(),
}))
const auth = reactive({
  currentUser: { activeSubscription: { planCode: 'BUSINESS_12', endDate: '2027-01-01T00:00:00Z' } },
  fetchUserProfile: mocks.profile,
})
vi.mock('vue-router', () => ({ useRoute: () => mocks.route, useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/stores/auth', () => ({ useAuthStore: () => auth }))
vi.mock('@/services/apiService', () => ({ default: {} }))

const DialogStub = defineComponent({
  props: ['isOpen', 'title', 'busy'],
  emits: ['close'],
  template: '<section v-if="isOpen" role="dialog" :aria-label="title"><slot /></section>',
})
let store: ReturnType<typeof useSubscriptionStore>
beforeEach(() => {
  vi.clearAllMocks()
  mocks.route.query = { action: 'upgrade' }
  auth.currentUser.activeSubscription = { planCode: 'BUSINESS_12', endDate: '2027-01-01T00:00:00Z' }
  mocks.profile.mockResolvedValue(undefined)
  setActivePinia(createPinia())
  store = useSubscriptionStore()
  store.plans = [
    { id: '1', code: 'FREE', name: 'Free', description: null, price: 0, discountPrice: null, durationMonths: null },
    { id: '2', code: 'PREMIUM_1', name: 'Premium', description: null, price: 20000, discountPrice: null, durationMonths: 1 },
    { id: '3', code: 'BUSINESS_12', name: 'Business', description: null, price: 500000, discountPrice: null, durationMonths: 12 },
  ]
  vi.spyOn(store, 'fetchPaymentMethods').mockImplementation(async () => {
    store.paymentMethodsError = null
    store.paymentMethodsAvailable = true
    store.paymentMethods = [{ code: 'bca_va', name: 'BCA Virtual Account', sort_order: 1 }]
  })
  vi.spyOn(store, 'initiateCheckout').mockResolvedValue({
    provider: 'payfest', order_id: 'order-1', status: 'PENDING', checkout: { va_number: '123456', bank: 'BCA' },
  })
  vi.spyOn(store, 'scheduleDowngrade').mockResolvedValue({ currentPlan: 'BUSINESS_12', scheduledPlan: 'FREE', effectiveDate: '2027-01-01' })
})

async function renderCheckout() {
  const wrapper = mount(SubscriptionCheckoutView, {
    global: { stubs: { AppDialog: DialogStub, PayfestCheckoutInstructions: true } },
  })
  await flushPromises()
  return wrapper
}

describe('subscription checkout', () => {
  it('requires a payment selection for a paid tier cheaper than the current tier and shows renewal instructions', async () => {
    const wrapper = await renderCheckout()
    await wrapper.get('input[name="plan-family"]').setValue()
    await wrapper.get('.checkout-review button').trigger('click')
    await flushPromises()
    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('aria-label')).toBe('Pilih Metode Pembayaran')
    expect(dialog.get('footer button').attributes('disabled')).toBeDefined()
    expect(store.initiateCheckout).not.toHaveBeenCalled()
    await dialog.get('input[name="upgrade-payment-method"]').setValue()
    await dialog.get('footer button').trigger('click')
    await flushPromises()
    expect(store.initiateCheckout).toHaveBeenCalledWith('PREMIUM_1', 'bca_va')
    expect(store.scheduleDowngrade).not.toHaveBeenCalled()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Instruksi Pembayaran')
    expect(wrapper.findComponent({ name: 'PayfestCheckoutInstructions' }).props('orderId')).toBe('order-1')
    wrapper.unmount()
  })

  it('schedules Free without opening payment selection', async () => {
    const wrapper = await renderCheckout()
    const families = wrapper.findAll('input[name="plan-family"]')
    await families[families.length - 1]!.setValue()
    expect(wrapper.text()).toContain('Selamanya · tanpa biaya langganan')
    await wrapper.get('.checkout-review button').trigger('click')
    await flushPromises()
    expect(store.scheduleDowngrade).toHaveBeenCalledWith('FREE')
    expect(store.fetchPaymentMethods).not.toHaveBeenCalled()
    expect(store.initiateCheckout).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Perubahan Terjadwal')
    wrapper.unmount()
  })

  it('shows checkout failures and keeps the selected method for retry', async () => {
    vi.mocked(store.initiateCheckout).mockRejectedValueOnce(new Error('Checkout gagal'))
    const wrapper = await renderCheckout()
    await wrapper.get('input[name="plan-family"]').setValue()
    await wrapper.get('.checkout-review button').trigger('click')
    await flushPromises()
    await wrapper.get('input[name="upgrade-payment-method"]').setValue()
    await wrapper.get('.checkout-payment-dialog footer button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Checkout gagal')
    expect(wrapper.get<HTMLInputElement>('input[name="upgrade-payment-method"]').element.checked).toBe(true)
    expect(wrapper.find('.checkout-payment-dialog footer button').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('offers retry when payment methods are unavailable', async () => {
    vi.mocked(store.fetchPaymentMethods).mockImplementationOnce(async () => {
      store.paymentMethodsAvailable = false
      store.paymentMethodsError = 'Metode gagal dimuat'
    })
    const wrapper = await renderCheckout()
    await wrapper.get('input[name="plan-family"]').setValue()
    await wrapper.get('.checkout-review button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Metode gagal dimuat')
    expect(wrapper.get('.checkout-payment-dialog footer button').attributes('disabled')).toBeDefined()
    await wrapper.get('.checkout-payment-retry').trigger('click')
    await flushPromises()
    expect(wrapper.find('input[name="upgrade-payment-method"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('keeps renewal checkout using the active plan', async () => {
    mocks.route.query = { action: 'renew' }
    const wrapper = await renderCheckout()
    expect(wrapper.find('input[name="plan-family"]').exists()).toBe(false)
    const pay = wrapper.findAll('button').find(button => button.text() === 'Bayar Sekarang')!
    await pay.trigger('click')
    await flushPromises()
    expect(store.initiateCheckout).toHaveBeenCalledWith('BUSINESS_12', 'bca_va')
    expect(wrapper.text()).toContain('Instruksi Pembayaran')
    wrapper.unmount()
  })
})
