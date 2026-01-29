import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/mainLayout.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import AccountsView from '../views/AccountsView.vue'
import AccountCreateView from '../views/AccountCreateView.vue'
import AccountEditView from '../views/AccountEditView.vue'
import AccountDetailView from '../views/AccountDetailView.vue'
import CategoriesView from '@/views/CategoriesView.vue' // Buat file ini jika belum
import TransactionsView from '@/views/TransactionsView.vue' // Buat file ini jika belum
import ProfileView from '@/views/ProfileView.vue'
import NotFoundView from '../views/NotFoundView.vue'

import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresUnauth: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresUnauth: true },
  },
  {
    path: '/app',
    component: MainLayout,
    meta: { requiresAuth: true }, // Proteksi semua rute di bawah /app
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard' },
      },
      {
        path: 'accounts',
        name: 'accounts-list',
        component: AccountsView,
        meta: { title: 'Daftar Akun' },
      },
      {
        path: 'accounts/new',
        name: 'account-create',
        component: AccountCreateView,
        meta: { title: 'Tambah Akun' },
      },
      {
        path: 'accounts/:id',
        name: 'account-detail',
        component: AccountDetailView,
        meta: { title: 'Detail Akun' },
      },
      {
        path: 'accounts/:id/edit',
        name: 'account-edit',
        component: AccountEditView,
        props: true,
        meta: { title: 'Edit Akun' },
      },
      {
        path: 'categories',
        name: 'categories-list',
        component: CategoriesView,
        meta: { title: 'Daftar Kategori' },
      },
      {
        path: 'transactions',
        name: 'transactions-list',
        component: TransactionsView,
        meta: { title: 'Daftar Transaksi' },
      },
      { path: 'profile', name: 'profile', component: ProfileView, meta: { title: 'Profil Saya' } },
      { path: '', redirect: { name: 'dashboard' } },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.authIsLoading && authStore.token && !authStore.user) {
    await authStore.tryAutoLogin()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresUnauth && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
