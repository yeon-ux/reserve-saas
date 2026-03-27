import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sagmcmfputhcfisvglbx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_eV_eT3ojdX5jGIHfh3qJQA_jcoi-tKs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
