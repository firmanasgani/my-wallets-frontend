export function profileInitials(name?: string | null, username?: string | null) {
  const words = (name?.trim() || username?.trim() || 'Moneytory').split(/\s+/)
  return words.slice(0, 2).map((word) => Array.from(word)[0] || '').join('').toLocaleUpperCase('id-ID')
}
export const isDemoProfile = (email?: string | null) => email?.trim().toLowerCase() === 'demo@moneytory.id'
export function validateProfilePhoto(file: Pick<File, 'type' | 'size'>) {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) throw new Error('Pilih foto JPG, PNG, atau WebP.')
  if (file.size <= 0) throw new Error('File foto kosong. Pilih foto lain.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran foto maksimal 5 MB.')
}
export function profileError(failure: unknown, fallback: string) {
  const error = failure as { response?: { data?: { message?: unknown } }; message?: unknown } | null
  const message = error?.response?.data?.message ?? error?.message
  if (Array.isArray(message)) return message.filter((item) => typeof item === 'string').join(', ') || fallback
  return typeof message === 'string' && message.trim() ? message : fallback
}
export function accountDeletionError(failure: unknown) {
  const message = profileError(failure, 'Akun belum berhasil dihapus. Silakan coba lagi.')
  if (message.toLowerCase().includes('member of a company')) return 'Akun masih terhubung sebagai anggota perusahaan. Hubungi pemilik perusahaan untuk melepas keanggotaan terlebih dahulu.'
  if (message.toLowerCase().includes('own a company')) return 'Akun masih memiliki perusahaan. Kelola atau hapus perusahaan terlebih dahulu sebelum menghapus akun.'
  return message
}
export interface PasswordDraft { currentPassword: string; newPassword: string; confirmNewPassword: string }
export function passwordProblem(draft: PasswordDraft) {
  if (!draft.currentPassword) return 'Masukkan kata sandi saat ini.'
  if (draft.newPassword.length < 6) return 'Kata sandi baru minimal 6 karakter.'
  if (draft.newPassword === draft.currentPassword) return 'Kata sandi baru harus berbeda dari kata sandi saat ini.'
  if (draft.confirmNewPassword !== draft.newPassword) return 'Konfirmasi kata sandi belum cocok.'
  return ''
}
export function buildPasswordPayload(draft: PasswordDraft) {
  const problem = passwordProblem(draft)
  if (problem) throw new Error(problem)
  return { currentPassword: draft.currentPassword, newPassword: draft.newPassword }
}
