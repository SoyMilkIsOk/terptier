import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

serve(async (req) => {
  try {
    const { user } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userRow } = await supabase
      .from("User")
      .select("role")
      .eq("id", user.id)
      .single();

    const { data: producers } = await supabase
      .from("ProducerAdmin")
      .select("producerId")
      .eq("userId", user.id);

    const role = userRow?.role || "USER";
    const producer_ids = producers?.map((p) => p.producerId) || [];

    return new Response(JSON.stringify({ role, producer_ids }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("token hook error", err);
    return new Response(JSON.stringify({}), { status: 200 });
  }
});
