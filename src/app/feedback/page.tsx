import type { Metadata } from "next";

import { getStaticPageTitle } from "@/lib/seo";

import { FeedbackPageClient } from "./FeedbackPageClient";

export const metadata: Metadata = {
  title: getStaticPageTitle("feedback"),
};

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
