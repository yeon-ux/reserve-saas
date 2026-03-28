import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTables() {
  const tables = ['schedules', 'breaks', 'holidays', 'events', 'partners']
  console.log('--- Table Status Check ---')
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      if (error.code === '42P01') {
        console.log(`❌ ${table}: Not Found`)
      } else {
        console.log(`⚠️ ${table}: Error (${error.message})`)
      }
    } else {
      console.log(`✅ ${table}: Exists`)
    }
  }
}

checkTables()
