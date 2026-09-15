// src/lib/sound.ts
// Web Audio API chimes for real-time notifications without external audio assets

export function playSalonChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // Tono principal cálido
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    gain1.gain.setValueAtTime(0.2, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.8)

    // Armónico campana de recepción
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.12) // A5
    gain2.gain.setValueAtTime(0.25, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 1.2)
  } catch {
    // Si el navegador requiere interacción previa del usuario
  }
}

export function playSaleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // Arpegio de cobro / caja registradora elegante (C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const startTime = now + idx * 0.08

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.18, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.4)
    })
  } catch {
    // Fallback silencioso
  }
}
