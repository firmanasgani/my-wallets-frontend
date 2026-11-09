import { describe, expect, it } from 'vitest'
import { accountDeletionError, buildPasswordPayload, isDemoProfile, passwordProblem, profileError, profileInitials, validateProfilePhoto } from '../profile'

describe('profile controls', () => {
  it('uses stable initials and recognizes the existing demo restriction', () => {
    expect(profileInitials('  Nama Lengkap Pengguna ', 'user')).toBe('NL')
    expect(profileInitials('', 'firma')).toBe('F')
    expect(profileInitials(null, '')).toBe('M')
    expect(isDemoProfile(' DEMO@MONEYTORY.ID ')).toBe(true)
    expect(isDemoProfile('user@moneytory.id')).toBe(false)
  })
  it('accepts supported photos through the inclusive 5 MB limit', () => {
    validateProfilePhoto({ type: 'image/jpeg', size: 5 * 1024 * 1024 })
    validateProfilePhoto({ type: 'image/png', size: 1 })
    validateProfilePhoto({ type: 'image/webp', size: 1 })
    expect(() => validateProfilePhoto({ type: 'image/svg+xml', size: 100 })).toThrow('JPG')
    expect(() => validateProfilePhoto({ type: 'image/png', size: 0 })).toThrow('kosong')
    expect(() => validateProfilePhoto({ type: 'image/png', size: 5 * 1024 * 1024 + 1 })).toThrow('5 MB')
  })
  it('validates the API password requirements without trimming passwords', () => {
    expect(passwordProblem({ currentPassword: '', newPassword: 'secret', confirmNewPassword: 'secret' })).toBe('Masukkan kata sandi saat ini.')
    expect(() => buildPasswordPayload({ currentPassword: 'oldsecret', newPassword: 'short', confirmNewPassword: 'short' })).toThrow('6 karakter')
    expect(() => buildPasswordPayload({ currentPassword: 'secret', newPassword: 'secret', confirmNewPassword: 'secret' })).toThrow('berbeda')
    expect(() => buildPasswordPayload({ currentPassword: 'oldsecret', newPassword: 'newsecret', confirmNewPassword: 'different' })).toThrow('Konfirmasi')
    expect(buildPasswordPayload({ currentPassword: ' oldsecret ', newPassword: ' newsecret ', confirmNewPassword: ' newsecret ' })).toEqual({ currentPassword: ' oldsecret ', newPassword: ' newsecret ' })
  })
  it('normalizes API validation errors and preserves useful server messages', () => {
    expect(profileError({ response: { data: { message: ['First', 'Second'] } } }, 'Fallback')).toBe('First, Second')
    expect(profileError(new Error('Network issue'), 'Fallback')).toBe('Network issue')
    expect(profileError(null, 'Fallback')).toBe('Fallback')
  })
  it('explains company restrictions without claiming that account deletion succeeded', () => {
    expect(accountDeletionError(new Error('Cannot delete account while you are a member of a company.')).includes('keanggotaan')).toBe(true)
    expect(accountDeletionError(new Error('Cannot delete account while you own a company.')).includes('memiliki perusahaan')).toBe(true)
    expect(accountDeletionError(new Error('Service unavailable'))).toBe('Service unavailable')
  })
})
