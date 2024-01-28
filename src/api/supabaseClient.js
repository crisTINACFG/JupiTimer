import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://alhooxczakrurgymmdwu.supabase.co' 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsaG9veGN6YWtydXJneW1tZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYxODEzNzIsImV4cCI6MjAyMTc1NzM3Mn0.8Wr1ZZA9XJi2zCaP3ahiF8NG_6Ssug6esqkTKVpRFf8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)