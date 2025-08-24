'use client';
import { usePathname } from 'next/navigation';

export default function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAbout = pathname === '/about';
  const isDrops = pathname === '/drops';
  const className = isHome ? '' : isAbout ? '' : isDrops ? '' : 'bg-white';
  return <main className={className}>{children}</main>;
}
