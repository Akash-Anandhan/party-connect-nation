import { supabase } from "@/integrations/external/client";
import { FIXED_STATE, PHOTO_BUCKET } from "@/lib/constants";
import type { Tables } from "@/integrations/supabase/types";

export type Application = Tables<"membership_applications">;
export type Member = Tables<"members">;
export type MemberCard = Tables<"member_cards">;
export type CardTemplate = Tables<"card_templates">;

export interface EnrollmentInput {
  fullName: string;
  phone: string;
  address: string;
  district: string;
  constituency: string;
  photo: File;
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

/** Anonymous enrollment: upload the photo to the private bucket, then insert a pending application. */
export async function submitEnrollment(input: EnrollmentInput): Promise<void> {
  const path = `applications/${crypto.randomUUID()}.${photoExtension(input.photo)}`;

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, input.photo, { contentType: input.photo.type, upsert: false });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from("membership_applications").insert({
    full_name: input.fullName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    district: input.district,
    state: FIXED_STATE,
    constituency: input.constituency.trim(),
    photo_path: path,
    status: "pending",
  });
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

/** Public URL that streams a member photo through a short-lived signed link. */
export function memberPhotoUrl(token: string): string {
  return `/api/public/photo/${token}`;
}
