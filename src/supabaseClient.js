// src/supabaseClient.js
// ONE shared Supabase connection for the whole app.
// Every component imports THIS — never create a second client.
// Why: the client holds the logged-in user's session (their JWT). If you make
// multiple clients, they don't share that session and auth breaks in confusing
// ways. One client = one source of truth for "who is logged in."

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fail loudly if the .env vars are missing, instead of a cryptic error later.
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase env vars. Check your .env has VITE_SUPABASE_URL and ' +
    'VITE_SUPABASE_ANON_KEY, and RESTART the dev server after editing .env.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
