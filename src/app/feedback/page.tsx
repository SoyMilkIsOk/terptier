import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getStaticPageTitle } from "@/lib/seo";

const GoogleFormEmbed = dynamic(() => import("@/components/GoogleFormEmbed"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: getStaticPageTitle("feedback"),
};

export default function FeedbackPage() {
  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <h1 className="text-3xl font-bold">Request a Producer</h1>
      <p className="text-center">Missing your favorite producer? Let us know.</p>
      <GoogleFormEmbed />
    </div>
  );
}
