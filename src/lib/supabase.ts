import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createServerSupabase() {
  const { cookies } = require('next/headers')
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookies().getAll(),
        setAll: (list) =>
          list.forEach(({ name, value, options }) =>
            cookies().set(name, value, options)
          ),
      },
    }
  )
}
