'use client'

export interface Friend {
  id: string
  name: string
  phone: string // international format preferred, e.g. +31612345678
}

const KEY = 'nova_friends'

export function getFriends(): Friend[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch { return [] }
}

export function saveFriends(friends: Friend[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(friends))
}

export function addFriend(friend: Omit<Friend, 'id'>): Friend {
  const friends = getFriends()
  const newFriend: Friend = { ...friend, id: Math.random().toString(36).slice(2) }
  friends.push(newFriend)
  saveFriends(friends)
  return newFriend
}

export function removeFriend(id: string): void {
  saveFriends(getFriends().filter(f => f.id !== id))
}

export function buildSMSLink(phone: string, message: string): string {
  return `sms:${phone}?body=${encodeURIComponent(message)}`
}

export function buildWhatsAppLink(phone: string, message: string): string {
  // Remove + and spaces for WhatsApp
  const clean = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

export const CO_REGULATION_MESSAGE =
  `Hey — I'm going through a tough moment right now and could really use some support. Even a short message or a quick call would help a lot. 💙`
