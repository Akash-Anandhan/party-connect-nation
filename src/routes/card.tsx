import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/card")({
  head: () => ({
    meta: [
      { title: "View Your Member Card — NLCTVS" },
      {
        name: "description",
        content:
          "Enter your membership card code to open, verify, print or download your digital party membership card.",
      },
      { property: "og:title", content: "View Your Member Card — NLCTVS" },
      {
        property: "og:description",
        content: "Open and download your digital party membership card using your card code.",
      },
    ],
  }),
  component: CardLookupPage,
});

function CardLookupPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const raw = value.trim();
    // Accept either a bare code or a full /verify/<code> URL.
    const token = raw.split("/").filter(Boolean).pop() ?? "";
    if (!/^[A-Za-z0-9]{6,64}$/.test(token)) {
      setError(t("card.notFound"));
      return;
    }
    void navigate({ to: "/verify/$token", params: { token } });
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-3xl text-primary">{t("card.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("card.subtitle")}</p>

        <form onSubmit={handleSubmit} className="panel mt-8 space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              {t("card.codeLabel")}
            </span>
            <input
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError(null);
              }}
              placeholder={t("card.codePlaceholder")}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {t("card.view")}
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}
