import { createFileRoute, Link } from "@tanstack/react-router";

import founderPhoto from "@/assets/founder-velmurugan.jpg";
import { BrandStrip } from "@/components/BrandStrip";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Party Membership Portal — Enroll & Verify Members" },
      {
        name: "description",
        content:
          "Enroll as a party member in Tamil Nadu, get office approval, and receive a verifiable digital membership card with a QR verification code.",
      },
      { property: "og:title", content: "Party Membership Portal — Enroll & Verify Members" },
      {
        property: "og:description",
        content:
          "Enroll as a party member in Tamil Nadu and receive a verifiable digital membership card.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t } = useI18n();

  return (
    <SiteLayout>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:items-center md:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              {t("home.eyebrow")}
            </p>
            <h1 className="mt-4 text-4xl leading-tight text-primary md:text-5xl">
              {t("home.title")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t("home.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/enroll"
                className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-opacity hover:opacity-90"
              >
                {t("home.cta")}
              </Link>
              <Link
                to="/card"
                className="rounded-md border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-muted"
              >
                {t("home.secondaryCta")}
              </Link>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <BrandStrip />
            <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-gold bg-primary font-display text-4xl text-primary-foreground">
                ★
              </span>
              <p className="font-display text-2xl text-primary">{t("app.party")}</p>
              <p className="text-sm font-medium text-foreground">{t("app.fullName")}</p>
              <p className="text-sm text-muted-foreground">{t("app.state")}</p>
            </div>
            <BrandStrip />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl text-foreground">{t("home.steps.title")}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { n: "1", title: t("home.steps.one"), body: t("home.steps.oneBody") },
            { n: "2", title: t("home.steps.two"), body: t("home.steps.twoBody") },
            { n: "3", title: t("home.steps.three"), body: t("home.steps.threeBody") },
          ].map((step) => (
            <article key={step.n} className="panel p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold font-display text-gold-foreground">
                {step.n}
              </span>
              <h3 className="mt-4 text-lg text-primary">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1fr_1.3fr]">
          <div className="panel overflow-hidden">
            <BrandStrip />
            <div className="p-6 text-center">
              <img
                src={founderPhoto}
                alt={t("about.founderName")}
                className="mx-auto h-36 w-36 rounded-full border-4 border-gold object-cover"
              />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                {t("about.founderTitle")}
              </p>
              <h3 className="mt-1 font-display text-xl text-primary">{t("about.founderName")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("about.founderBody")}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl text-foreground">{t("about.title")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("about.body")}</p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["about.facts.founded", "about.facts.foundedValue"],
                ["about.facts.ideology", "about.facts.ideologyValue"],
                ["about.facts.headquarters", "about.facts.headquartersValue"],
                ["about.facts.secretary", "about.facts.secretaryValue"],
              ].map(([labelKey, valueKey]) => (
                <div key={labelKey} className="panel p-4">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t(labelKey)}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{t(valueKey)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
