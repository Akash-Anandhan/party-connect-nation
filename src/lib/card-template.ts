/**
 * Membership card template system.
 *
 * A card template is a plain HTML fragment containing `{{placeholder}}` tokens.
 * At render time every token is replaced with the member's data. Unknown tokens
 * are replaced with an empty string so a card never shows raw `{{...}}` text.
 */
export const CARD_PLACEHOLDERS = [
  "name",
  "crf_no",
  "phone",
  "address",
  "district",
  "state",
  "constituency",
  "photo",
  "qr_code",
] as const;

export type CardPlaceholder = (typeof CARD_PLACEHOLDERS)[number];
export type CardValues = Partial<Record<CardPlaceholder, string>>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Replace every `{{placeholder}}` in the template with escaped member data. */
export function renderCardTemplate(html: string, values: CardValues): string {
  return html.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_match, rawKey: string) => {
    const key = rawKey.toLowerCase() as CardPlaceholder;
    const value = values[key];
    return value ? escapeHtml(value) : "";
  });
}

/** Sample data used for admin template previews. */
export const PREVIEW_VALUES: CardValues = {
  name: "Preview Member",
  crf_no: "CRF-2026-001001",
  phone: "9000000000",
  address: "12, Gandhi Street, Anna Nagar",
  district: "Madurai",
  state: "Tamil Nadu",
  constituency: "Madurai Central",
  photo: "https://placehold.co/240x300/790604/F3F0C8?text=PHOTO",
  qr_code: "https://placehold.co/200x200/261611/FFFFFF?text=QR",
};
