let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioContextClass =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return null

  if (!audioContext) {
    audioContext = new AudioContextClass()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {})
  }
  return audioContext
}

function playTone(
  ctx: AudioContext,
  startTime: number,
  frequency: number,
  duration: number,
  peakGain: number,
) {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startTime)

  gainNode.gain.setValueAtTime(0.0001, startTime)
  gainNode.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

/**
 * Plays a short two-note chime, synthesized with the Web Audio API (no
 * audio file needed). Used to notify about an inbound chat message.
 */
export function playChatNotificationSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    playTone(ctx, now, 880, 0.3, 0.25) // A5
    playTone(ctx, now + 0.12, 1318.5, 0.3, 0.2) // E6
  } catch (error) {
    console.warn('Failed to play chat notification sound:', error)
  }
}
