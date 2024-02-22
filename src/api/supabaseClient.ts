import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xiedcxdcgfgrlilvdmmp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZWRjeGRjZ2ZncmxpbHZkbW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDczMTYyMzgsImV4cCI6MjAyMjg5MjIzOH0.3UfnoCZJloUzy6IqQkPN4IjcUSm7Up3c1TcNtNQKR90'

export const logout = async () => {
  await supabase.auth.signOut({ scope: 'local' })
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
