import { createBrowserClient, createServerClient } from '@supabase/ssr'

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createServerSupabase() {
  const { cookies } = (eval('require') as NodeRequire)('next/headers')
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
