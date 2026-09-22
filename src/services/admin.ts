import { supabase } from "@/integrations/supabase/client";
import { PHOTO_BUCKET } from "@/lib/constants";
import type { Application, CardTemplate, Member } from "./membership";

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return Boolean(data);
}

export async function listApplications(status: Application["status"]): Promise<Application[]> {
  const { data, error } = await supabase
    .from("membership_applications")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function approveApplication(id: string) {
  const { data, error } = await supabase.rpc("approve_application", { _application_id: id });
  if (error) throw error;
  return data as unknown as { member_id: string; crf_no: string; public_token: string };
}

export async function rejectApplication(id: string, notes: string | null) {
  const { error } = await supabase.rpc("reject_application", {
    _application_id: id,
    _notes: notes,
  });
  if (error) throw error;
}

export interface MemberWithCard extends Member {
  member_cards: { public_token: string; issued_at: string }[];
}

export async function listMembers(): Promise<MemberWithCard[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*, member_cards(public_token, issued_at)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MemberWithCard[];
}

/** Signed URL for an admin to view a private photo (expires in 5 minutes). */
export async function signedPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 300);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function listTemplates(): Promise<CardTemplate[]> {
  const { data, error } = await supabase
    .from("card_templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTemplate(name: string, html: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("card_templates")
    .insert({ name, html, created_by: userData.user?.id ?? null });
  if (error) throw error;
}

export async function activateTemplate(id: string): Promise<void> {
  const { error: clearError } = await supabase
    .from("card_templates")
    .update({ is_active: false })
    .eq("is_active", true);
  if (clearError) throw clearError;

  const { error } = await supabase.from("card_templates").update({ is_active: true }).eq("id", id);
  if (error) throw error;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("card_templates").delete().eq("id", id);
  if (error) throw error;
}
