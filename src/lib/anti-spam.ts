// src/lib/anti-spam.ts

/**
 * Valida que el campo trampa (honeypot) permanezca vacío.
 * Los bots y scripts de spam completan automáticamente campos ocultos.
 */
export function validateHoneypot(honeypot?: string): boolean {
  return !honeypot || honeypot.trim().length === 0
}

/**
 * Valida que el tiempo transcurrido desde la carga del formulario
 * sea razonable para un usuario humano (mínimo 2.5 segundos por defecto).
 */
export function validateSubmissionSpeed(formLoadedAt?: number, minElapsedSeconds = 2.5): boolean {
  if (!formLoadedAt) return true
  const elapsedSeconds = (Date.now() - formLoadedAt) / 1000
  return elapsedSeconds >= minElapsedSeconds
}
