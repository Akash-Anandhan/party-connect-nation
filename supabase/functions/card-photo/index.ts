// Supabase Edge Function: public member-photo proxy
// ---------------------------------------------------------------------------
// The static GitHub Pages build has no server runtime, so it cannot run
// /api/public/photo/:token. This function is the drop-in replacement: it
// resolves an opaque public card token server-side and streams the photo from
// the private `member-photos` bucket.
//
// It exposes exactly the same data as the original server route and nothing
// else — a valid, unrevoked token for an active member yields an image; every
// other case is a 404. The service-role key never reaches the browser.
//
// Deploy:
//   supabase functions deploy card-photo --no-verify-jwt
// No secrets to set: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected
// by the platform by default (and names starting with SUPABASE_ are reserved —
// `supabase secrets set` refuses them on purpose).
// ---------------------------------------------------------------------------

import { createClient } from "npm:@supabase/supabase-js@2";

/** Mirrors the card token format accepted by the server route. */
const TOKEN_PATTERN = /^[A-Za-z0-9]{6,64}$/;

/** Short-lived signed URL lifetime, in seconds. */
const SIGNED_URL_TTL_SECONDS = 300;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

/**
 * Admin key used to read the private bucket and bypass RLS.
 * Prefers the platform-injected legacy `SUPABASE_SERVICE_ROLE_KEY` and falls
 * back to the injected `SUPABASE_SECRET_KEYS` dictionary (new-style projects).
 */
function resolveAdminKey(): string {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;

  const dictionary = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (dictionary) {
    try {
      const keys = JSON.parse(dictionary) as Record<string, string>;
      if (keys["default"]) return keys["default"];
    } catch {
      // malformed dictionary — fall through to the error below
    }
  }
  return "";
}

const SERVICE_ROLE_KEY = resolveAdminKey();

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  // The card renders this via <img>, which needs no CORS, but allow it anyway
  // so the endpoint stays usable from fetch() if a page ever needs it.
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-headers", "authorization, x-client-info, apikey, content-type");
  headers.set("access-control-allow-methods", "GET, OPTIONS");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function notFound(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

function serverError(message: string): Response {
  console.error(`[card-photo] ${message}`);
  return new Response("Unable to load photo", {
    status: 500,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

Deno.serve(async (request) => {
  // Pre-flight support, in case a page ever reads the image via fetch().
  if (request.method === "OPTIONS") {
    return withCors(new Response(null, { status: 204 }));
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return withCors(
      serverError(
        "Missing SUPABASE_URL or admin API key — both are injected by the platform; check the function environment.",
      ),
    );
  }

  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!TOKEN_PATTERN.test(token)) return withCors(notFound());

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: card, error: cardError } = await supabase
    .from("member_cards")
    .select("member_id, revoked_at")
    .eq("public_token", token)
    .maybeSingle();

  if (cardError) return withCors(serverError(`member_cards: ${cardError.message}`));
  if (!card || card.revoked_at) return withCors(notFound());

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("photo_path, is_active")
    .eq("id", card.member_id)
    .maybeSingle();

  if (memberError) return withCors(serverError(`members: ${memberError.message}`));
  if (!member?.is_active || !member.photo_path) return withCors(notFound());

  const { data: signed, error: signError } = await supabase.storage
    .from("member-photos")
    .createSignedUrl(member.photo_path, SIGNED_URL_TTL_SECONDS);

  if (signError) return withCors(serverError(`signing: ${signError.message}`));
  if (!signed?.signedUrl) return withCors(notFound());

  const upstream = await fetch(signed.signedUrl);
  if (!upstream.ok || !upstream.body) return withCors(notFound());

  return withCors(
    new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "image/jpeg",
        // Matches the server route: a signed link is only good for 5 minutes.
        "cache-control": "private, max-age=300",
      },
    }),
  );
});
