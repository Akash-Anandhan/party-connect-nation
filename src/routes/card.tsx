import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/i18n";
import { formatDate } from "@/lib/format";
import { trackApplication, type TrackingResult } from "@/services/membership";

export const Route = createFileRoute("/card")({
  head: () => ({
    meta: [
      { title: "Track Your Membership — NLCTVS" },
      {
        name: "description",
        content:
          "Track your party membership with the mobile number you enrolled with: see whether your application is pending or rejected, and open your digital membership card once approved.",
      },
      { property: "og:title", content: "Track Your Membership — NLCTVS" },
      {
        property: "og:description",
        content:
          "Enter the mobile number you enrolled with to see your application status and open your membership card.",
      },
    ],
  }),
  component: CardLookupPage,
});

const inputClass =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25";

function CardLookupPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-16">
        <TrackingForm />
      </div>
    </SiteLayout>
  );
}

function TrackingForm() {
  const { t } = useI18n();
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const digits = phone.trim();
    if (!/^[0-9]{10}$/.test(digits)) {
      setError(t("card.errors.phone"));
      return;
    }

    setLoading(true);
    try {
      const tracked = await trackApplication(digits);
      setResult(tracked);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  if (
    result &&
    (result.status === "pending" || result.status === "rejected" || result.status === "approved")
  ) {
    return <TrackingStatus result={result} onBack={() => setResult(null)} />;
  }

  return (
    <div>
      <h1 className="text-3xl text-primary">{t("card.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("card.subtitle")}</p>

      <form onSubmit={handleSubmit} className="panel mt-8 space-y-4 p-6" noValidate>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            {t("card.phoneLabel")}
          </span>
          <input
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setError(null);
            }}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder={t("card.phonePlaceholder")}
            className={inputClass}
            autoComplete="tel-national"
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {result?.status === "not_found" ? (
          <p className="text-sm text-destructive">{t("card.errors.notFound")}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? t("common.loading") : t("card.track")}
        </button>
      </form>
    </div>
  );
}

function TrackingStatus({ result, onBack }: { result: TrackingResult; onBack: () => void }) {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  if (result.status === "invalid" || result.status === "not_found") return null;

  if (result.status === "approved") {
    // Approved — link through to the existing verification page;
    // /verify/<token> links and printed QR codes are unaffected by this flow.
    const { publicToken } = result;
    return (
      <div className="panel p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success text-2xl text-success-foreground">
          ✓
        </span>
        <h1 className="mt-5 text-2xl text-primary">{t("card.status.approved")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("card.status.approvedBody")}</p>
        <dl className="mt-6 space-y-2 text-left text-sm">
          <Row label={t("common.name")} value={result.fullName} />
          {result.crfNo ? <Row label={t("admin.members.crf")} value={result.crfNo} /> : null}
          <Row
            label={t("card.status.districtLabel")}
            value={`${result.district} · ${result.constituency}`}
          />
        </dl>
        {publicToken ? (
          <button
            type="button"
            onClick={() =>
              void navigate({ to: "/verify/$token", params: { token: publicToken } })
            }
            className="mt-7 w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {t("card.status.viewCard")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onBack}
          className="mt-3 w-full rounded-md border border-border px-6 py-2.5 text-sm text-foreground hover:bg-muted"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  const rejected = result.status === "rejected";
  return (
    <div className="panel p-8 text-center">
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
          rejected ? "bg-destructive text-destructive-foreground" : "bg-gold/20 text-gold"
        }`}
      >
        {rejected ? "✕" : "⏳"}
      </span>
      <h1 className={`mt-5 text-2xl ${rejected ? "text-destructive" : "text-primary"}`}>
        {rejected ? t("card.status.rejected") : t("card.status.pending")}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {rejected ? t("card.status.rejectedBody") : t("card.status.pendingBody")}
      </p>
      <dl className="mt-6 space-y-2 text-left text-sm">
        <Row label={t("common.name")} value={result.fullName} />
        <Row
          label={t("card.status.districtLabel")}
          value={`${result.district} · ${result.constituency}`}
        />
        <Row label={t("card.status.submitted")} value={formatDate(result.submittedAt, language)} />
      </dl>
      {rejected ? (
        <button
          type="button"
          onClick={() => void navigate({ to: "/enroll" })}
          className="mt-7 w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {t("card.status.enrollAgain")}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onBack}
        className="mt-3 w-full rounded-md border border-border px-6 py-2.5 text-sm text-foreground hover:bg-muted"
      >
        {t("common.back")}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
