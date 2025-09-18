import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

serve(async (req) => {
  try {
    const { to, subject, text, html } = await req.json();
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("MAIL_FROM");
    if (!apiKey || !from) {
      console.error("Missing Resend configuration");
      return new Response("Server misconfiguration", { status: 500 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text, ...(html ? { html } : {}) }),
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error("Resend error", res.status, msg);
      return new Response("Failed to send", { status: 500 });
    }

    return new Response("OK");
  } catch (err) {
    console.error("send-email error", err);
    return new Response("Bad request", { status: 400 });
  }
});
