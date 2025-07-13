import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-green-700">
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
