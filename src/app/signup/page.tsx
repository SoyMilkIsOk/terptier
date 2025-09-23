import type { Metadata } from "next";
import SignUpPageClient from "./SignUpPageClient";
import { getStaticPageTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: getStaticPageTitle("signup"),
};

export default function SignUpPage() {
  return <SignUpPageClient />;
}
