
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://pmqufzwarfnryxjotmgd.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcXVmendhcmZucnl4am90bWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5OTM3NzAsImV4cCI6MjA0NjU2OTc3MH0.oUj862z7tguUrEe_APE6vvyVulMBMTG4OIqgSmNLwpQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 