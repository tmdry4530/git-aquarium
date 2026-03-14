import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function getSupabaseUrl(): string {
  return (
    process.env['SUPABASE_URL'] ?? process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? ''
  )
}

function getSupabaseAnonKey(): string {
  return (
    process.env['SUPABASE_ANON_KEY'] ??
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ??
    ''
  )
}

function getSupabaseServiceRoleKey(): string {
  return process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? ''
}

function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey())
}

let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey())
  }
  return _supabaseAdmin
}

export {
  getSupabaseAdmin,
  getSupabaseUrl,
  getSupabaseAnonKey,
  isSupabaseConfigured,
}

export function createSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? ''
  const key = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? ''
  if (!url || !key) return null
  return createClient(url, key)
}
