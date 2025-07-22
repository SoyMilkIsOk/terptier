'use client'
import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase'

export function Providers({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createBrowserSupabase())
  const router = useRouter()

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh()
      }
    })
    return () => sub.unsubscribe()
  }, [supabase, router])

  return <>{children}</>
}
