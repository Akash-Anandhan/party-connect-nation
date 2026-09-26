import { supabase } from "@/integrations/external/client";
import { FIXED_STATE, PHOTO_BUCKET } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";

type ApplicationTables = Database["public"]["Tables"]["membership_applications"];

/**
 * The generated Database types predate the date_of_birth migration on the
 * live database, so patch the application shape here until they regenerate.
 */
export type Application = Omit<ApplicationTables["Row"], "date_of_birth"> & {
  date_of_birth: string | null;
};
export type ApplicationInsert = Omit<ApplicationTables["Insert"], "date_of_birth"> & {
  date_of_birth: string | null;
};
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type MemberCard = Database["public"]["Tables"]["member_cards"]["Row"];
export type CardTemplate = Database["public"]["Tables"]["card_templates"]["Row"];

export interface EnrollmentInput {
  fullName: string;
  phone: string;
  address: string;
  district: string;
  constituency: string;
  /** ISO date (yyyy-mm-dd), required — applicants must be 18 or older. */
  dateOfBirth: string;
  photo: File;
}

/** Thrown when a phone number already has a pending/approved application. */
export class PhoneTakenError extends Error {
  constructor() {
    super("phone already has an active application");
    this.name = "PhoneTakenError";
  }
}

/** Result of the public `track_application` RPC, keyed by phone number. */
export type TrackingResult =
  | { status: "not_found" }
  | {
      status: "member";
      fullName: string;
      crfNo: string | null;
      district: string;
      constituency: string;
      joinedAt: string;
      publicToken: string | null;
    };

/** The tracking result for an existing member (status narrowed to "member"). */
export type MemberResult = Extract<TrackingResult, { status: "member" }>;

interface TrackRpcPayload {
  status?: string;
  full_name?: string | null;
  crf_no?: string | null;
  district?: string | null;
  constituency?: string | null;
  joined_at?: string | null;
  public_token?: string | null;
}

/**
 * Public card tracking by the member's mobile number. Membership is instant,
 * so every tracked number belongs to an existing member; the result carries
 * the card's public token so the existing /verify/<token> links and QR codes
 * stay undisturbed.
 */
export async function trackApplication(phone: string): Promise<TrackingResult> {
  const { data, error } = await supabase.rpc("track_application", { _phone: phone.trim() });
  if (error) throw error;
  const p = (data ?? {}) as TrackRpcPayload;
  if (p.status !== "member") {
    return { status: "not_found" };
  }
  return {
    status: "member",
    fullName: p.full_name ?? "",
    crfNo: p.crf_no ?? null,
    district: p.district ?? "",
    constituency: p.constituency ?? "",
    joinedAt: p.joined_at ?? "",
    publicToken: p.public_token ?? null,
  };
}

/**
 * True when the phone number is not a member yet. Used by the enroll form for
 * an instant "number already enrolled" message before any upload happens.
 */
export async function phoneCanApply(phone: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("phone_can_apply", { _phone: phone.trim() });
  if (error) throw error;
  return data === true;
}

/** Public verification payload — deliberately minimal (no phone, no address). */
export interface CardVerification {
  valid: boolean;
  full_name: string;
  crf_no: string;
  district: string;
  state: string;
  constituency: string;
  photo_path: string | null;
  issued_at: string;
  public_token: string;
}

function photoExtension(file: File): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

/** The newly created member identity, returned by an instant enrollment. */
export interface EnrollmentResult {
  crfNo: string;
  publicToken: string;
}

/**
 * Anonymous instant enrollment: upload the photo to the private bucket, then
 * create member + CRF number + card token in one database transaction. The
 * unique phone constraint makes duplicate submissions impossible, so the card
 * can be shown immediately — there is no review step.
 */
export async function submitEnrollment(input: EnrollmentInput): Promise<EnrollmentResult> {
  const path = `applications/${crypto.randomUUID()}.${photoExtension(input.photo)}`;

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, input.photo, { contentType: input.photo.type, upsert: false });
  if (uploadError) throw uploadError;

  // Generated client types do not know the date_of_birth column yet.
  const payload = {
    full_name: input.fullName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    district: input.district,
    state: FIXED_STATE,
    constituency: input.constituency.trim(),
    date_of_birth: input.dateOfBirth,
    photo_path: path,
    status: "pending",
  } satisfies ApplicationInsert;

  const { error } = await supabase
    .from("membership_applications")
    .insert(payload as unknown as never);
  if (error) throw error;
}

/** Public, unauthenticated card verification by opaque token. */
export async function verifyCard(token: string): Promise<CardVerification | null> {
  const { data, error } = await supabase.rpc("verify_card", { _token: token });
  if (error) throw error;
  return (data as unknown as CardVerification | null) ?? null;
}

/** The currently active card template (readable by anyone). */
export async function fetchActiveTemplate(): Promise<CardTemplate | null> {
  const { data, error } = await supabase
    .from("card_templates")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Public URL that streams a member photo through a short-lived signed link.
 *
 * Always resolves via the `card-photo` Supabase Edge Function: it works on a
 * static host (GitHub Pages), in local dev, and in server builds alike — and
 * it never needs `SUPABASE_SERVICE_ROLE_KEY` in the app's environment, because
 * the platform injects that into the function itself. The legacy server route
 * `/api/public/photo/:token` still exists but is no longer used by the app.
 */
export function memberPhotoUrl(token: string): string {
  // Always go through the `card-photo` Edge Function, in every build mode:
  // it needs no server runtime (GitHub Pages), and the service-role key stays
  // inside Supabase instead of having to live in the server's environment.
  //
  // Build the origin from the project id so photo URLs always hit the
  // project's own `supabase.co` domain, whatever shape `VITE_SUPABASE_URL`
  // has (direct URL, proxy, custom domain).
  const origin = `https://${import.meta.env["VITE_SUPABASE_PROJECT_ID"]}.supabase.co`;
  const query = `?token=${encodeURIComponent(token)}`;
  return `${origin}/functions/v1/card-photo${query}`;
}
