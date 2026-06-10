import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ogtttmzgmbrwymftdvwk.supabase.co'
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndHR0bXpnbWJyd3ltZnRkdndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDA2NTksImV4cCI6MjA5NjY3NjY1OX0.zuiBzNNIj0IVthFMHojuclt-xQR94bjDYuLuBe0z3FI'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
