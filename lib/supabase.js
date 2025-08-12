import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dwzyknpwwqslasxlwuku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3enlrbnB3d3FzbGFzeGx3dWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA2MjksImV4cCI6MjA3MDIwNjYyOX0.omdxqOgVtFVwTclwj2msjorzr9jjsY_hcCnERW51tsM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});