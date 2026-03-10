import { createClient } from '@supabase/supabase-js'

// Client lato SERVER (usa service role — bypassa RLS)
// Da usare SOLO nelle API Route di Next.js, mai nel browser
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )
}

// Client lato CLIENT (anon key — rispetta RLS)
export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
