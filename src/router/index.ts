import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/mainLayout.vue'
import LoginView from '../views/LoginView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import PersonalDashboardView from '../views/PersonalDashboardView.vue'
import AccountsView from '../views/AccountsView.vue'
import AccountCreateView from '../views/AccountCreateView.vue'
import AccountEditView from '../views/AccountEditView.vue'
import AccountDetailView from '../views/AccountDetailView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import TransactionsView from '@/views/TransactionsView.vue'
import BudgetSetupView from '@/views/budgets/BudgetSetupView.vue'
import BudgetReportView from '@/views/budgets/BudgetReportView.vue'
import BudgetFormView from '@/views/budgets/BudgetFormView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SettingsView from '@/views/SettingsView.vue'
import NotFoundView from '../views/NotFoundView.vue'

import { useAuthStore } from '@/stores/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: { name: 'login' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresUnauth: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { title: 'Lupa Kata Sandi', requiresUnauth: true },
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
        path: 'personal-dashboard',
        name: 'personal-dashboard',
        component: PersonalDashboardView,
        meta: { title: 'Dashboard Personal' },
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
      {
        path: 'transactions/new',
        name: 'transaction-create',
        component: () => import('@/views/transactions/AddTransactionView.vue'),
        meta: { title: 'Tambah Transaksi' },
      },
      {
        path: 'transactions/:id',
        name: 'transaction-detail',
        component: () => import('@/views/transactions/TransactionDetailView.vue'),
        meta: { title: 'Detail Transaksi' },
      },
      {
        path: 'budgets',
        name: 'budget-setup',
        component: BudgetSetupView,
        meta: { title: 'Pengaturan Anggaran', requiresPremium: true },
      },
      {
        path: 'budgets/new',
        name: 'budget-create',
        component: BudgetFormView,
        meta: { title: 'Buat Anggaran', requiresPremium: true },
      },
      {
        path: 'budgets/:id/edit',
        name: 'budget-edit',
        component: BudgetFormView,
        meta: { title: 'Edit Anggaran', requiresPremium: true },
      },
      {
        path: 'budgets/report',
        name: 'budget-report',
        component: BudgetReportView,
        meta: { title: 'Laporan Anggaran', requiresPremium: true },
      },
      {
        path: 'spending-analysis',
        name: 'spending-analysis',
        component: () => import('@/views/reports/SpendingAnalysisView.vue'),
        meta: { title: 'Spending Analysis', requiresPremium: true },
      },
      { path: 'profile', name: 'profile', component: ProfileView, meta: { title: 'Profil Saya' } },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView,
        meta: { title: 'Pengaturan' },
      },
      {
        path: 'financial-goals',
        name: 'financial-goals-list',
        component: () => import('@/views/financial-goals/FinancialGoalsView.vue'),
        meta: { title: 'Goal Keuangan', requiresPremium: true },
      },
      {
        path: 'financial-goals/:id',
        name: 'financial-goal-detail',
        component: () => import('@/views/financial-goals/GoalDetailView.vue'),
        meta: { title: 'Detail Goal', requiresPremium: true },
      },
      {
        path: 'business/kpi',
        name: 'business-kpi',
        component: () => import('@/views/business/KpiDashboardView.vue'),
        meta: { title: 'KPI Dashboard', requiresBusiness: true },
      },
      {
        path: 'business/settings',
        name: 'business-settings',
        component: () => import('@/views/business/BusinessSettingsView.vue'),
        meta: { title: 'Profil Perusahaan', requiresBusiness: true },
      },
      {
        path: 'business/chart-of-accounts',
        name: 'business-coa',
        component: () => import('@/views/business/ChartOfAccountsView.vue'),
        meta: { title: 'Chart of Accounts', requiresBusiness: true },
      },
      {
        path: 'business/members',
        name: 'business-members',
        component: () => import('@/views/business/MembersView.vue'),
        meta: { title: 'Manajemen Member', requiresBusiness: true },
      },
      {
        path: 'business/contacts',
        name: 'business-contacts',
        component: () => import('@/views/business/ContactsView.vue'),
        meta: { title: 'Kontak', requiresBusiness: true },
      },
      {
        path: 'business/contacts/create',
        name: 'business-contacts-create',
        component: () => import('@/views/business/ContactFormView.vue'),
        meta: { title: 'Tambah Kontak', requiresBusiness: true },
      },
      {
        path: 'business/contacts/:id/edit',
        name: 'business-contacts-edit',
        component: () => import('@/views/business/ContactFormView.vue'),
        meta: { title: 'Edit Kontak', requiresBusiness: true },
      },
      {
        path: 'business/invoices',
        name: 'business-invoices',
        component: () => import('@/views/business/InvoicesView.vue'),
        meta: { title: 'Invoice', requiresBusiness: true },
      },
      {
        path: 'business/invoices/new',
        name: 'invoice-create',
        component: () => import('@/views/business/InvoiceFormView.vue'),
        meta: { title: 'Buat Invoice', requiresBusiness: true },
      },
      {
        path: 'business/invoices/:id',
        name: 'invoice-detail',
        component: () => import('@/views/business/InvoiceDetailView.vue'),
        meta: { title: 'Detail Invoice', requiresBusiness: true },
      },
      {
        path: 'business/invoices/:id/edit',
        name: 'invoice-edit',
        component: () => import('@/views/business/InvoiceFormView.vue'),
        meta: { title: 'Edit Invoice', requiresBusiness: true },
      },
      {
        path: 'business/invoices/:id/export',
        name: 'invoice-export',
        component: () => import('@/views/business/InvoiceExportView.vue'),
        meta: { title: 'Export Invoice', requiresBusiness: true },
      },
      {
        path: 'business/bank-accounts',
        name: 'business-bank-accounts',
        component: () => import('@/views/business/BankAccountsView.vue'),
        meta: { title: 'Rekening Perusahaan', requiresBusiness: true },
      },
      {
        path: 'business/transactions',
        name: 'business-transactions',
        component: () => import('@/views/business/BusinessTransactionsView.vue'),
        meta: { title: 'Transaksi Bisnis', requiresBusiness: true },
      },
      {
        path: 'business/transactions/new',
        name: 'business-transaction-create',
        component: () => import('@/views/business/BusinessTransactionFormView.vue'),
        meta: { title: 'Transaksi Baru', requiresBusiness: true },
      },
      {
        path: 'business/transactions/:id',
        name: 'business-transaction-detail',
        component: () => import('@/views/business/BusinessTransactionDetailView.vue'),
        meta: { title: 'Detail Jurnal', requiresBusiness: true },
      },
      {
        path: 'business/reports/profit-loss',
        name: 'business-report-pl',
        component: () => import('@/views/business/reports/ProfitLossView.vue'),
        meta: { title: 'Laporan Laba Rugi', requiresBusiness: true },
      },
      {
        path: 'business/reports/balance-sheet',
        name: 'business-report-bs',
        component: () => import('@/views/business/reports/BalanceSheetView.vue'),
        meta: { title: 'Neraca Keuangan', requiresBusiness: true },
      },
      {
        path: 'business/reports/cash-flow',
        name: 'business-report-cf',
        component: () => import('@/views/business/reports/CashFlowView.vue'),
        meta: { title: 'Arus Kas', requiresBusiness: true },
      },
      {
        path: 'business/reports/journal',
        name: 'business-report-journal',
        component: () => import('@/views/business/reports/JournalReportView.vue'),
        meta: { title: 'Jurnal Umum', requiresBusiness: true },
      },
      // ── Phase 8 ─────────────────────────────────────────────────────────────
      {
        path: 'business/tax',
        name: 'business-tax',
        component: () => import('@/views/business/TaxConfigView.vue'),
        meta: { title: 'Konfigurasi Pajak', requiresBusiness: true },
      },
      {
        path: 'business/assets',
        name: 'business-assets',
        component: () => import('@/views/business/AssetsView.vue'),
        meta: { title: 'Manajemen Aset', requiresBusiness: true },
      },
      {
        path: 'business/assets/new',
        name: 'business-asset-create',
        component: () => import('@/views/business/AssetFormView.vue'),
        meta: { title: 'Tambah Aset', requiresBusiness: true },
      },
      {
        path: 'business/assets/:id',
        name: 'business-asset-detail',
        component: () => import('@/views/business/AssetDetailView.vue'),
        meta: { title: 'Detail Aset', requiresBusiness: true },
      },
      {
        path: 'business/assets/:id/edit',
        name: 'business-asset-edit',
        component: () => import('@/views/business/AssetFormView.vue'),
        meta: { title: 'Edit Aset', requiresBusiness: true },
      },
      {
        path: 'how-to',
        name: 'how-to',
        component: { render: () => null },
        beforeEnter() {
          window.open(`${import.meta.env.VITE_BASE_URL_COMPRO}/cara-penggunaan`, '_blank')
          return false
        },
      },
      { path: '', redirect: { name: 'dashboard' } },
    ],
  },
  {
    path: '/business/invite/accept',
    name: 'business-invite-accept',
    component: () => import('@/views/business/AcceptInviteView.vue'),
    meta: { title: 'Terima Undangan', requiresAuth: true },
  },
  {
    path: '/payment/finish',
    name: 'payment-finish',
    component: () => import('@/views/payment/PaymentStatusView.vue'),
  },
  {
    path: '/payment/unfinish',
    name: 'payment-unfinish',
    component: () => import('@/views/payment/PaymentStatusView.vue'),
  },
  {
    path: '/payment/error',
    name: 'payment-error',
    component: () => import('@/views/payment/PaymentStatusView.vue'),
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
  scrollBehavior() {
    return { top: 0, behavior: 'instant' }
  },
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (!authStore.authIsLoading && authStore.token && !authStore.user) {
    await authStore.tryAutoLogin()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresUnauth && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else if (to.meta.requiresPremium && authStore.currentUser?.subscriptionPlan === 'FREE') {
    // Redirect FREE users trying to access Premium features
    next({ name: 'settings', query: { upgrade: 'true' } })
  } else if (to.meta.requiresBusiness && !authStore.currentUser?.subscriptionPlan?.startsWith('BUSINESS')) {
    // Redirect non-business users trying to access Business features
    next({ name: 'settings', query: { upgrade: 'true' } })
  } else {
    next()
  }
})

export default router
