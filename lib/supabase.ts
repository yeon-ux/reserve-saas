import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '') || 'https://placeholder.supabase.co'
const supabaseAnonKey = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '') || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
