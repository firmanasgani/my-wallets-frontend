// Thin promise wrapper around the Midtrans Snap popup (window.snap, loaded
// by the <script> in index.html). Used when the backend reports provider
// "midtrans", i.e. Payfest is switched off and checkout falls back to the
// direct Snap flow.
export type SnapOutcome = 'success' | 'pending' | 'error' | 'closed'

interface SnapClient {
  pay: (
    token: string,
    callbacks: { onSuccess: () => void; onPending: () => void; onError: () => void; onClose: () => void },
  ) => void
}

export const payWithSnap = (token: string): Promise<SnapOutcome> => {
  const snap = (window as Window & { snap?: SnapClient }).snap
  if (!snap) {
    return Promise.reject(new Error('Jendela pembayaran belum siap. Muat ulang halaman dan coba lagi.'))
  }
  return new Promise((resolve) => {
    snap.pay(token, {
      onSuccess: () => resolve('success'),
      onPending: () => resolve('pending'),
      onError: () => resolve('error'),
      onClose: () => resolve('closed'),
    })
  })
}
