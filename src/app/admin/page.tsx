import { redirect } from "next/navigation";
import { DEFAULT_STATE_SLUG } from "@/lib/stateConstants";

export default function LegacyAdminRedirect() {
  redirect(`/${DEFAULT_STATE_SLUG}/admin`);
}
