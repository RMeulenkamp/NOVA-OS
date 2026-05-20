import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ─── Supabase client (singleton) ──────────────────────────────────────────────
// Returns null if env vars are not set — app continues to work via localStorage.

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null

  if (!_client) {
    _client = createClient(url, key)
  }

  return _client
}

export const supabase = typeof window !== 'undefined' ? getSupabase() : null
