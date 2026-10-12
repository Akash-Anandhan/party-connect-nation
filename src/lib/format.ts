export function formatDate(value: string | null | undefined, language: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(language === "ta" ? "ta-IN" : "en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Card-only formatter. The card template renders {{date_of_birth}} with the
 * member’s stored value (an ISO yyyy-mm-dd string from Postgres `date`). The
 * client asked for card display in dd-mm-yyyy, so convert the ISO string into
 * that display format here rather than touching the DB column or the enrollment
 * form (which still collects yyyy-mm-dd).
 */
export function formatDateOfBirthForCard(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
