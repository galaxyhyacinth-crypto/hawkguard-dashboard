import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("supabaseUrl or supabaseKey is required.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
