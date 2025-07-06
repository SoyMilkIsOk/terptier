import "../styles/globals.css"; // your tailwind imports
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TerpTier",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto max-w-none px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
