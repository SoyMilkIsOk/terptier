import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import MainContainer from "@/components/MainContainer";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Providers } from "./providers";
import { createServerSupabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "TerpTier",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        {/* You could pass session to a context here if needed */}
        <Providers>
          <Navbar />
          <MainContainer>{children}</MainContainer>
          <Footer />
          <Analytics />
          <SpeedInsights />
          <GoogleAnalytics gaId="G-SVL6LBN7QS" />
        </Providers>
      </body>
    </html>
  );
}
