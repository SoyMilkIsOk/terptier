import "../styles/globals.css";  // your tailwind imports
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "CO Grower Rank",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
