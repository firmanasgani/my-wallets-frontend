<template>
  <div class="money-auth">
    <header class="auth-header">
      <a class="auth-brand" href="https://moneytory.my.id/id" aria-label="Beranda Moneytory Ledger">
        <img src="/logo.png" alt="" width="36" height="36" />
        <span>Moneytory Ledger</span>
      </a>
      <a class="auth-home-link" href="https://moneytory.my.id/id" aria-label="Tentang Moneytory">
        <span class="auth-home-text">Tentang Moneytory</span> <span aria-hidden="true">↗</span>
      </a>
    </header>

    <main class="auth-main">
      <section class="auth-story" aria-labelledby="story-title">
        <span class="auth-eyebrow">LANGKAH KECIL. AWAL YANG BAIK.</span>
        <h1 id="story-title">Mulai mencatat.<br /> <span>Mulai tertata.</span></h1>
        <p class="auth-story-copy">
          Beri setiap rencana keuangan tempat untuk tumbuh. Buat akun gratis untuk mulai mengelola
          keuangan personal dan bisnis dengan lebih tenang.
        </p>

        <div class="auth-artwork" aria-hidden="true">
          <span class="artwork-label">RENCANA BESAR DIMULAI DARI SINI.</span>
          <svg viewBox="0 0 480 230" fill="none" focusable="false">
            <ellipse cx="242" cy="208" rx="158" ry="9" fill="#27231d" fill-opacity=".08" />
            <g stroke="#27231d" stroke-width="2.5" stroke-linejoin="round">
              <rect x="135" y="27" width="188" height="170" rx="15" fill="#cfb8f5" />
              <path d="M160 28v169" />
              <rect x="179" y="53" width="124" height="120" rx="10" fill="#fffcf5" />
              <rect x="194" y="72" width="16" height="16" rx="4" fill="#c8edc6" />
              <path d="m198 80 3 3 6-7m15 4h61m-61 32h61m-61 32h43" stroke-linecap="round" />
              <rect x="194" y="104" width="16" height="16" rx="4" fill="#ffd962" />
              <rect x="194" y="136" width="16" height="16" rx="4" fill="#eee4ff" />
              <path d="m332 73 15-8 13 24-15 8Zm13 24 15-8 42 80-15 8Zm42 80 15-8 1 25Z" fill="#ffd962" />
              <circle cx="122" cy="166" r="32" fill="#c8edc6" />
              <path d="M122 153v26m-13-13h26" stroke-width="4" stroke-linecap="round" />
              <path d="m369 27 5 13 13 5-13 5-5 13-5-13-13-5 13-5Z" fill="#ffd962" />
              <path d="m99 61 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#cfb8f5" />
            </g>
          </svg>
          <span class="artwork-note">Catatan pertamamu, langkah menuju rencana berikutnya.</span>
        </div>

        <ul class="auth-features" aria-label="Keuntungan akun Moneytory">
          <li><span aria-hidden="true">✓</span> Mulai gratis</li>
          <li><span aria-hidden="true">✓</span> Personal &amp; bisnis</li>
          <li><span aria-hidden="true">✓</span> Satu tempat</li>
        </ul>
      </section>

      <section class="auth-card auth-signup-card" aria-labelledby="register-title">
        <div class="auth-card-heading">
          <span class="auth-eyebrow">{{ registrationSuccess ? 'SIAP MELANGKAH' : 'MULAI DARI SINI' }}</span>
          <span class="auth-card-badge" aria-hidden="true">{{ registrationSuccess ? '✓' : '↗' }}</span>
        </div>

        <ol v-if="!registrationSuccess" class="auth-steps" aria-label="Langkah pendaftaran">
          <li :class="{ 'is-active': currentStep === 1, 'is-complete': currentStep === 2 }"
            :aria-current="currentStep === 1 ? 'step' : undefined">
            <span class="auth-step-number" aria-hidden="true">{{ currentStep === 2 ? '✓' : '1' }}</span>
            <span><span class="auth-sr-only">Langkah 1: </span>Data akun</span>
          </li>
          <li :class="{ 'is-active': currentStep === 2 }"
            :aria-current="currentStep === 2 ? 'step' : undefined">
            <span class="auth-step-number" aria-hidden="true">2</span>
            <span><span class="auth-sr-only">Langkah 2: </span>Keamanan</span>
          </li>
        </ol>

        <h2 id="register-title" ref="stepTitle" tabindex="-1">
          {{ registrationSuccess ? 'Akunmu siap.' : currentStep === 1 ? 'Buat akun gratis.' : 'Amankan akunmu.' }}
        </h2>
        <p v-if="!registrationSuccess" class="auth-intro">
          {{ currentStep === 1
            ? 'Kenalan dulu, lalu mulai cerita keuanganmu.'
            : 'Satu langkah lagi. Buat kata sandi untuk akunmu.' }}
        </p>

        <div v-if="registrationSuccess" class="auth-signup-success" role="status">
          <span class="auth-success-icon" aria-hidden="true">✓</span>
          <p>
            Hubungi admin yang mengundangmu untuk mengirim ulang undangan ke
            <strong>{{ formData.email }}</strong>. Setelah itu, cek emailmu untuk menerima akses ke perusahaan.
          </p>
          <RouterLink class="auth-submit" :to="{ name: 'login' }">Masuk ke akun <span aria-hidden="true">↗</span></RouterLink>
        </div>

        <template v-else>
          <div v-if="emailReadonly" class="auth-invite-note">
            <span class="auth-invite-label">{{ isInviteFlow ? 'KAMU DIUNDANG' : 'EMAIL PENDAFTARAN' }}</span>
            <p>Email sudah diisi dari tautan pendaftaran dan tidak dapat diubah.</p>
          </div>

          <div v-if="clientSideError || authStore.authError" class="auth-error auth-signup-error" role="alert">
            <span>{{ clientSideError || authStore.authError }}</span>
            <button type="button" aria-label="Tutup pesan kesalahan" @click="clearErrors">×</button>
          </div>

          <form v-if="currentStep === 1" @submit.prevent="goToStep2">
            <div class="auth-field">
              <label for="fullName">Nama lengkap <span class="auth-optional">(opsional)</span></label>
              <input id="fullName" v-model="formData.fullName" name="name" type="text"
                autocomplete="name" placeholder="Nama panggilan juga boleh" />
            </div>
            <div class="auth-field">
              <label for="username">Username</label>
              <input id="username" v-model="formData.username" name="username" type="text"
                autocomplete="username" autocapitalize="none" :spellcheck="false" required
                aria-describedby="username-hint" :aria-invalid="!!usernameError"
                placeholder="Pilih username unikmu" />
              <p id="username-hint" class="auth-field-hint" :class="{ 'is-error': usernameError }">
                {{ usernameError || '4–30 karakter. Gunakan huruf, angka, atau garis bawah (_).' }}
              </p>
            </div>
            <div class="auth-field">
              <label for="email">Email</label>
              <input id="email" v-model="formData.email" name="email" type="email"
                autocomplete="email" autocapitalize="none" :spellcheck="false" required maxlength="100"
                :readonly="emailReadonly" :aria-describedby="emailReadonly ? 'email-hint' : undefined"
                placeholder="nama@email.com" />
              <p v-if="emailReadonly" id="email-hint" class="auth-field-hint">Email dari tautan pendaftaran.</p>
            </div>
            <button type="submit" class="auth-submit">Lanjut ke keamanan <span aria-hidden="true">→</span></button>
          </form>

          <form v-else @submit.prevent="handleRegister" :aria-busy="isSubmitting">
            <div class="auth-account-summary">
              <span>MENDAFTAR SEBAGAI</span>
              <strong>{{ formData.email }}</strong>
            </div>

            <div class="auth-field">
              <label for="password">Kata sandi</label>
              <div class="auth-password">
                <input id="password" v-model="formData.password" name="new-password"
                  :type="showPassword ? 'text' : 'password'" autocomplete="new-password"
                  placeholder="Buat kata sandi yang kuat" required minlength="8" :readonly="isSubmitting"
                  aria-describedby="password-requirements" />
                <button type="button" class="auth-password-toggle" @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                  :aria-pressed="showPassword">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    <path v-if="showPassword" d="m3 3 18 18" />
                  </svg>
                </button>
              </div>
              <ul id="password-requirements" class="auth-password-rules" aria-label="Syarat kata sandi">
                <li v-for="rule in passwordRules" :key="rule.label" :class="{ 'is-met': rule.met }">
                  <span aria-hidden="true">{{ rule.met ? '✓' : '○' }}</span>
                  <span class="auth-sr-only">{{ rule.met ? 'Terpenuhi: ' : 'Belum terpenuhi: ' }}</span>
                  {{ rule.label }}
                </li>
              </ul>
            </div>

            <div class="auth-field">
              <label for="confirmPassword">Konfirmasi kata sandi</label>
              <div class="auth-password">
                <input id="confirmPassword" v-model="formData.confirmPassword" name="confirm-password"
                  :type="showConfirmPassword ? 'text' : 'password'" autocomplete="new-password"
                  placeholder="Ulangi kata sandimu" required :readonly="isSubmitting"
                  :aria-invalid="passwordMismatch" aria-describedby="password-match-hint" />
                <button type="button" class="auth-password-toggle" @click="showConfirmPassword = !showConfirmPassword"
                  :aria-label="showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'"
                  :aria-pressed="showConfirmPassword">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    <path v-if="showConfirmPassword" d="m3 3 18 18" />
                  </svg>
                </button>
              </div>
              <p id="password-match-hint" class="auth-field-hint" :class="{ 'is-error': passwordMismatch }"
                aria-live="polite">
                {{ !formData.confirmPassword ? 'Ketik ulang kata sandi untuk memastikan.'
                  : passwordMismatch ? 'Kata sandi belum cocok.' : 'Kata sandi sudah cocok.' }}
              </p>
            </div>

            <div class="auth-signup-actions">
              <button type="button" class="auth-back" :disabled="isSubmitting" @click="backToAccount">
                <span aria-hidden="true">←</span> Kembali
              </button>
              <button type="submit" class="auth-submit" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="auth-spinner" aria-hidden="true"></span>
                <span>{{ isSubmitting ? 'Membuat akun...' : 'Buat akun gratis' }}</span>
                <span v-if="!isSubmitting" aria-hidden="true">↗</span>
              </button>
            </div>
          </form>

          <p class="auth-register">Sudah punya akun? <RouterLink to="/login">Masuk di sini <span aria-hidden="true">↗</span></RouterLink></p>
        </template>
      </section>
    </main>

    <footer class="auth-footer">
      <span>© {{ new Date().getFullYear() }} Moneytory Ledger</span>
      <span>Keuangan personal &amp; bisnis, lebih tertata.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import '@/assets/auth.css'

const authStore = useAuthStore()
const route = useRoute()
const formData = reactive({ fullName: '', username: '', email: '', password: '', confirmPassword: '' })
const currentStep = ref(1)
const isInviteFlow = computed(() => route.query.ref === 'invite')
const emailReadonly = ref(false)
const registrationSuccess = ref(false)
const isSubmitting = ref(false)
const stepTitle = ref<HTMLElement | null>(null)
const clientSideError = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

onMounted(() => {
  clearErrors()
  if (typeof route.query.email === 'string' && route.query.email.trim()) {
    formData.email = route.query.email.trim()
    emailReadonly.value = true
  }
})

const usernameError = computed(() => {
  const value = formData.username.trim()
  if (!value) return null
  if (value.length < 4) return 'Username minimal 4 karakter.'
  if (value.length > 30) return 'Username maksimal 30 karakter.'
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Gunakan huruf, angka, dan garis bawah (_) saja.'
  return null
})

const passwordRules = computed(() => [
  { label: 'Minimal 8 karakter', met: formData.password.length >= 8 },
  { label: 'Huruf kecil (a–z)', met: /[a-z]/.test(formData.password) },
  { label: 'Huruf besar (A–Z)', met: /[A-Z]/.test(formData.password) },
  { label: 'Angka (0–9)', met: /[0-9]/.test(formData.password) },
  { label: 'Simbol (!@#...)', met: /[^A-Za-z0-9]/.test(formData.password) },
])
const passwordMismatch = computed(
  () => !!formData.confirmPassword && formData.password !== formData.confirmPassword,
)

const clearErrors = () => {
  clientSideError.value = null
  authStore.error = null
}
const focusStepTitle = async () => {
  await nextTick()
  stepTitle.value?.focus()
}
const goToStep2 = async () => {
  clearErrors()
  if (!formData.username.trim() || !formData.email.trim()) {
    clientSideError.value = 'Username dan email wajib diisi.'
    return
  }
  if (usernameError.value) {
    clientSideError.value = usernameError.value
    return
  }
  formData.username = formData.username.trim()
  formData.email = formData.email.trim()
  currentStep.value = 2
  await focusStepTitle()
}
const backToAccount = async () => {
  if (isSubmitting.value) return
  clearErrors()
  currentStep.value = 1
  showPassword.value = false
  showConfirmPassword.value = false
  await focusStepTitle()
}
const handleRegister = async () => {
  if (isSubmitting.value) return
  clearErrors()
  if (!passwordRules.value.every((rule) => rule.met)) {
    clientSideError.value = 'Lengkapi semua syarat kata sandi sebelum melanjutkan.'
    return
  }
  if (formData.password !== formData.confirmPassword) {
    clientSideError.value = 'Kata sandi dan konfirmasi kata sandi belum cocok.'
    return
  }

  isSubmitting.value = true
  try {
    await authStore.register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName.trim() || null,
    }, { skipRedirect: isInviteFlow.value })
    if (isInviteFlow.value) {
      registrationSuccess.value = true
      await focusStepTitle()
    }
  } catch (error: unknown) {
    clientSideError.value =
      (typeof error === 'string' ? error : error instanceof Error ? error.message : '') ||
      authStore.authError || 'Pendaftaran gagal. Silakan coba lagi.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
