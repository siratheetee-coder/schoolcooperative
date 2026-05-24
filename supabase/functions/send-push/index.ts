// Supabase Edge Function: send-push
// Deploy: supabase functions deploy send-push --no-verify-jwt
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@school.ac.th";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PushBody {
  audience: "teachers" | "students" | "member" | "all";
  member_id?: number;
  exclude_member_id?: number;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body: PushBody = await req.json();
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Query subscriptions by audience
    let q = sb.from("push_subscriptions").select("*");
    if (body.audience === "teachers") q = q.eq("role", "teacher");
    else if (body.audience === "students") q = q.eq("role", "student");
    else if (body.audience === "member") {
      if (!body.member_id) throw new Error("member_id required");
      q = q.eq("member_id", body.member_id);
    }
    if (body.exclude_member_id) q = q.neq("member_id", body.exclude_member_id);

    const { data: subs, error } = await q;
    if (error) throw error;
    if (!subs || !subs.length) {
      return new Response(JSON.stringify({ sent: 0, total: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({
      title: body.title,
      body: body.body,
      url: body.url || "/",
      tag: body.tag || "coop",
      icon: body.icon || "/logo-no-bg.png",
    });

    // urgency: 'high' บอก push service ให้ส่งทันทีแม้เครื่องหลับ
    // TTL 24h: เก็บไว้รอส่งถ้าเครื่องออฟไลน์
    const pushOptions = {
      TTL: 86400,
      urgency: 'high' as const,
      headers: { 'Topic': body.tag || 'coop' },
    };
    const results = await Promise.allSettled(subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload,
        pushOptions
      )
    ));

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed: number[] = [];
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const reason = (r as PromiseRejectedResult).reason;
        // 410 Gone or 404 = subscription expired
        if (reason?.statusCode === 410 || reason?.statusCode === 404) {
          failed.push(subs[i].id);
        }
      }
    });

    // Cleanup expired subs
    if (failed.length) {
      await sb.from("push_subscriptions").delete().in("id", failed);
    }

    return new Response(JSON.stringify({ sent, total: subs.length, expired: failed.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
