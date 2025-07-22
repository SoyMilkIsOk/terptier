import { createServerSupabase } from '@/lib/supabase'

export default async function HomePage() {
  const supabase = createServerSupabase()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <main className="p-8">
      {session ? (
        <p>Logged in as {session.user.email}</p>
      ) : (
        <a href="/api/auth/signin">Sign in</a>
      )}
    </main>
  )
}
