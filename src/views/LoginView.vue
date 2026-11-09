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
        <span class="auth-eyebrow">CATAT RAPI. LANGKAH PASTI.</span>
        <h1 id="story-title">Uang tertata.<br /> <span>Pikiran lega.</span></h1>
        <p class="auth-story-copy">
          Dari pengeluaran harian sampai keuangan bisnis, semua punya tempat. Mulai lagi dari sini.
        </p>

        <div class="auth-artwork" aria-hidden="true">
          <span class="artwork-label">SEDIKIT CATATAN, BANYAK KETENANGAN.</span>
          <svg viewBox="0 0 480 230" fill="none" focusable="false">
            <ellipse cx="242" cy="208" rx="165" ry="9" fill="#27231d" fill-opacity=".08" />
            <g stroke="#27231d" stroke-width="2.5" stroke-linejoin="round">
              <path d="m84 63 158-26 24 147-158 26Z" fill="#fffcf5" />
              <path d="m101 83 100-16m-96 36 117-19m-113 39 117-19m-113 39 80-13" stroke="#b4a48d" />
              <rect x="163" y="43" width="198" height="151" rx="18" fill="#a780f2" />
              <path d="M164 75h196M184 60h24" />
              <rect x="185" y="94" width="153" height="77" rx="10" fill="#fffcf5" />
              <path d="m201 148 30-18 27 9 29-29 30 8" stroke="#5026a5" stroke-width="4" stroke-linecap="round" />
              <path d="M306 116h12v13" stroke="#5026a5" stroke-width="4" stroke-linecap="round" />
              <rect x="322" y="140" width="63" height="44" rx="12" fill="#ffd962" />
              <circle cx="343" cy="162" r="4" fill="#27231d" />
              <circle cx="124" cy="164" r="31" fill="#c8edc6" />
              <path d="m111 164 9 9 17-19" stroke-width="4" stroke-linecap="round" />
              <path d="m377 38 5 15 15 5-15 5-5 15-5-15-15-5 15-5Z" fill="#ffd962" />
              <path d="m91 25 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#cfb8f5" />
            </g>
          </svg>
          <span class="artwork-note">Satu tempat untuk setiap cerita keuanganmu.</span>
        </div>

        <ul class="auth-features" aria-label="Fitur Moneytory">
          <li><span aria-hidden="true">✓</span> Catat transaksi</li>
          <li><span aria-hidden="true">✓</span> Kelola anggaran</li>
          <li><span aria-hidden="true">✓</span> Pantau laporan</li>
        </ul>
      </section>

      <section class="auth-card" aria-labelledby="login-title">
        <div class="auth-card-heading">
          <span class="auth-eyebrow">RUANG KEUANGANMU</span>
          <span class="auth-card-badge" aria-hidden="true">↗</span>
        </div>
        <h2 id="login-title">Selamat datang<br />kembali.</h2>
        <p class="auth-intro">Masuk untuk melanjutkan cerita keuanganmu.</p>

        <form @submit.prevent="handleLogin" :aria-busy="isLoading">
          <div v-if="errorMessage" class="auth-error" role="alert">
            <span>{{ errorMessage }}</span>
            <button type="button" aria-label="Tutup pesan kesalahan" @click="errorMessage = null">×</button>
          </div>

          <div class="auth-field">
            <label for="login-field">Username atau email</label>
            <input
              id="login-field"
              v-model="loginField"
              name="username"
              type="text"
              autocomplete="username"
              autocapitalize="none"
              :spellcheck="false"
              placeholder="Masukkan username atau email"
              required
              :readonly="isLoading"
            />
          </div>

          <div class="auth-field">
            <div class="auth-label-row">
              <label for="password">Kata sandi</label>
              <RouterLink :to="{ name: 'forgot-password' }">Lupa kata sandi?</RouterLink>
            </div>
            <div class="auth-password">
              <input
                id="password"
                v-model="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Masukkan kata sandi"
                required
                :readonly="isLoading"
              />
              <button
                type="button"
                class="auth-password-toggle"
                :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  <path v-if="showPassword" d="m3 3 18 18" />
                </svg>
              </button>
            </div>
          </div>

          <button class="auth-submit" type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="auth-spinner" aria-hidden="true"></span>
            <span>{{ isLoading ? 'Sedang masuk...' : 'Masuk ke akun' }}</span>
            <span v-if="!isLoading" aria-hidden="true">↗</span>
          </button>
        </form>

        <div class="auth-demo">
          <p>Ingin lihat-lihat dulu?</p>
          <div
            class="auth-demo-help"
            @mouseenter="demoHovered = true"
            @mouseleave="demoHovered = false"
            @focusin="demoFocused = true"
            @focusout="demoFocused = false"
            @keydown.esc.prevent="dismissDemoHint"
          >
            <button
              type="button"
              class="auth-demo-trigger"
              aria-describedby="demo-tooltip"
              @click="openDemoOnClick"
            >
              Coba akun demo <span class="auth-info-icon" aria-hidden="true">i</span>
            </button>
            <div id="demo-tooltip" role="tooltip" class="auth-demo-tooltip" :hidden="!showDemoHint">
              <strong>Akun demo bisnis</strong>
              <p>Gunakan detail berikut untuk masuk dan menjelajahi fitur bisnis.</p>
              <dl>
                <div><dt>Username</dt><dd>demoaccount</dd></div>
                <div><dt>Email</dt><dd>demo@moneytory.id</dd></div>
                <div><dt>Kata sandi</dt><dd>DemoAccount@123</dd></div>
              </dl>
            </div>
          </div>
        </div>

        <p class="auth-register">Baru di Moneytory? <RouterLink to="/register">Buat akun gratis <span aria-hidden="true">↗</span></RouterLink></p>
      </section>
    </main>

    <footer class="auth-footer">
      <span>© {{ new Date().getFullYear() }} Moneytory Ledger</span>
      <span>Keuangan personal &amp; bisnis, lebih tertata.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import '@/assets/auth.css'

const authStore = useAuthStore()
const loginField = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const demoHovered = ref(false)
const demoFocused = ref(false)
const demoHintDismissed = ref(false)
const showDemoHint = computed(
  () => (demoHovered.value || demoFocused.value) && !demoHintDismissed.value,
)

watch([demoHovered, demoFocused], ([hovered, focused]) => {
  if (!hovered && !focused) demoHintDismissed.value = false
})
const openDemoOnClick = (event: MouseEvent) => {
  // Explicit focus also supports touch browsers that do not focus buttons on tap.
  const trigger = event.currentTarget as HTMLButtonElement
  trigger.focus()
  demoFocused.value = true
  demoHintDismissed.value = false
}
const dismissDemoHint = () => {
  demoHintDismissed.value = true
}

const handleLogin = async () => {
  if (isLoading.value) return
  if (!loginField.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Username atau email dan kata sandi tidak boleh kosong.'
    return
  }

  isLoading.value = true
  errorMessage.value = null
  try {
    await authStore.login({ login: loginField.value.trim(), password: password.value })
  } catch (error: unknown) {
    errorMessage.value =
      (typeof error === 'string' ? error : error instanceof Error ? error.message : '') ||
      'Login gagal. Silakan cek kembali username atau email dan kata sandi Anda.'
  } finally {
    isLoading.value = false
  }
}
</script>
