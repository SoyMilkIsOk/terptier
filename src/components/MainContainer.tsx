'use client';
import { usePathname } from 'next/navigation';

export default function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const className = isHome ? '' : 'container mx-auto px-4 py-6';
  return <main className={className}>{children}</main>;
}
