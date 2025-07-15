'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const year = new Date().getFullYear();
  const isHome = usePathname() === '/';
  return (
    <footer className="bg-green-700 {isHome ? '' : 'absolute bottom-0 left-0 right-0'}">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-white space-y-2">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/faq" className="hover:underline">
            FAQ
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
        <p>&copy; {year} TerpTier</p>
      </div>
    </footer>
  );
}
