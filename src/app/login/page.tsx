import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";
import { getStaticPageTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: getStaticPageTitle("login"),
};

export default function LoginPage() {
  return <LoginPageClient />;
}
