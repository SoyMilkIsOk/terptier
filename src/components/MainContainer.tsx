'use client';
import { usePathname } from 'next/navigation';

export default function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAbout = pathname === '/about';
  const className = isHome ? '' : isAbout ? '' : 'container mx-auto min-h-screen';
  return <main className={className}>{children}</main>;
}
