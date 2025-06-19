// src/lib/supabaseClient.ts
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('🔑 Anon key present?', Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));


export const supabase = createPagesBrowserClient();
