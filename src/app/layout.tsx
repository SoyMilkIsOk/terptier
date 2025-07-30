import "../styles/globals.css"; // your tailwind imports
import Navbar from "@/components/Navbar";
import MainContainer from "@/components/MainContainer";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GoogleAnalytics } from '@next/third-parties/google'

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
      <body className="min-h-screen bg-gray-50 flex flex-col pt-20">
        <Navbar />
        <MainContainer>{children}</MainContainer>
        <Footer />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-SVL6LBN7QS" />
      </body>
    </html>
  );
}
