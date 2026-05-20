// 20 different check-in reminder messages
// Rotated daily based on day-of-year so they feel fresh

export const REMINDER_MESSAGES = [
  {
    title: "Your daily scan is waiting",
    body: "2 minutes of awareness now can change the shape of your entire day. How are you actually doing?",
  },
  {
    title: "One check-in. Real clarity.",
    body: "You can't regulate what you don't notice. Take 2 minutes to understand your state before the day takes over.",
  },
  {
    title: "Your system has something to say",
    body: "Before you push through — what is your body actually signaling right now? The scan takes 2 minutes.",
  },
  {
    title: "The day is still shapeable",
    body: "A quick check-in now helps NOVA give you a protocol that fits today — not a generic one. 2 minutes.",
  },
  {
    title: "Awareness before action",
    body: "High performers who check in consistently crash less. Take 2 minutes to read your state.",
  },
  {
    title: "What mode are you in today?",
    body: "Compensation mode? Calm focus? Low capacity? Knowing the difference changes everything. Scan now.",
  },
  {
    title: "Not every day is a push day",
    body: "Some days are stabilize days. Some are focus days. NOVA can tell you which — in 2 minutes.",
  },
  {
    title: "Your body left clues this morning",
    body: "Sleep, energy, tension, cravings — they're all data. Spend 2 minutes turning them into guidance.",
  },
  {
    title: "Small input, big output",
    body: "2 minutes in the morning can prevent a 3-hour afternoon crash. Your state is worth checking.",
  },
  {
    title: "You can't optimize from emptiness",
    body: "Before you plan your day — know your capacity. Your daily scanner is ready.",
  },
  {
    title: "This isn't a habit. It's intelligence.",
    body: "The more you check in, the better NOVA understands your patterns. Today's scan matters.",
  },
  {
    title: "Regulation starts with awareness",
    body: "You can't regulate something you haven't noticed yet. 2 minutes is all it takes.",
  },
  {
    title: "What does your system need today?",
    body: "Not what you planned — what it actually needs. Open your scanner and find out.",
  },
  {
    title: "The check-in that takes 2 minutes",
    body: "Most people spend hours managing symptoms. You can spend 2 minutes understanding the source.",
  },
  {
    title: "Today's data shapes tomorrow's energy",
    body: "Every check-in adds to your pattern picture. NOVA gets smarter the more you show up.",
  },
  {
    title: "Start from reality, not expectation",
    body: "What you think your day will look like vs. what your body can actually support — check the gap.",
  },
  {
    title: "Your scan is the fastest ROI of your morning",
    body: "2 minutes of self-awareness returns hours of better decision-making. Worth it.",
  },
  {
    title: "Tired but wired? Crashing? Unclear?",
    body: "There's a name for what you're feeling — and a response that actually helps. Scan now.",
  },
  {
    title: "Pattern recognition builds over time",
    body: "The more you check in, the clearer your energy patterns become. Today's scan is part of the picture.",
  },
  {
    title: "Your nervous system is already awake",
    body: "Give it 2 minutes of attention and it will give you a clearer, more regulated day in return.",
  },
]

export function getTodayReminderMessage() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  )
  return REMINDER_MESSAGES[dayOfYear % REMINDER_MESSAGES.length]
}

// ─── Browser notification helpers ────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function showBrowserNotification(title: string, body: string, onClick?: () => void) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  const n = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'nova-checkin-reminder',
  })
  if (onClick) n.onclick = onClick
}

// Store/read reminder preference in localStorage
export function getReminderEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('nova_reminder_enabled') === 'true'
}

export function setReminderEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem('nova_reminder_enabled', String(enabled))
}
