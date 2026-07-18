// src/supabaseClient.js
// ONE shared Supabase connection for the whole app.
// Every component imports THIS — never create a second client.
// Why: the client holds the logged-in user's session (their JWT). If you make
// multiple clients, they don't share that session and auth breaks in confusing
// ways. One client = one source of truth for "who is logged in."

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Keep the app renderable when a new developer has not created a local .env
// file yet. App.tsx displays a clear setup screen instead of a blank page.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null
