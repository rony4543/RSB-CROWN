import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ydnmibzxpdcosnrzgzfq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fhK-IsNavbyuiRAqBy-B1Q_o1SfV_8x';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
