import { createBrowserClient, createServerClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Supabase environment variables are missing')
}

export function createBrowserSupabase() {
  return createBrowserClient(url, key)
}

export function createServerSupabase() {
  const { cookies } = (eval('require') as NodeRequire)('next/headers')
  return createServerClient(
    url,
    key,
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
