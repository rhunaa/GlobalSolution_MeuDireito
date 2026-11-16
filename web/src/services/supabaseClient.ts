import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const chaveAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** true quando as variáveis de ambiente do Supabase estão configuradas. */
export const temSupabase = Boolean(url && chaveAnon)

export const supabase: SupabaseClient | null = temSupabase
  ? createClient(url!, chaveAnon!, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 20 } },
    })
  : null
