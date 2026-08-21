const STORAGE_KEY = 'kitcreator_daily_credits'
export const DAILY_LIMIT = 5

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function getLocalCredits() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (raw && raw.date === todayKey()) return raw.count
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return DAILY_LIMIT
}

export function consumeLocalCredits(amount) {
  const current = getLocalCredits()
  if (current < amount) {
    throw new Error(
      'Free daily limit reached! Upgrade to PRO for unlimited generations.',
    )
  }
  const remaining = current - amount
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: todayKey(), count: remaining }),
  )
  return remaining
}
