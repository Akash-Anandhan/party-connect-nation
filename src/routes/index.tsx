import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import crossedFlags from "@/assets/crossed-flags.png";
import founderPhoto from "@/assets/founder-velmurugan.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import ideologues from "@/assets/ideologues.png";
import leaderCutout from "@/assets/leader-cutout.png";
import { BrandStrip } from "@/components/BrandStrip";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NLCTVS Membership — Tamizhaga Vazhvurimai Katchi" },
      {
        name: "description",
        content:
          "Enroll as a party member in Tamil Nadu, get office approval, and receive a verifiable digital membership card with a QR verification code.",
      },
      { property: "og:title", content: "NLCTVS Membership — Tamizhaga Vazhvurimai Katchi" },
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
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.15fr_0.85fr] md:py-20">
          <div>
            <img
              src={ideologues}
              alt=""
              aria-hidden="true"
              className="h-16 w-auto md:h-20"
            />
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <img
                src={crossedFlags}
                alt=""
                aria-hidden="true"
                className="h-14 w-auto md:h-16"
              />
              <h1 className="font-tamil text-4xl font-bold leading-tight text-primary md:text-5xl">
                {t("app.fullName")}
              </h1>
            </div>
            <p className="mt-4 font-tamil text-lg font-semibold md:text-xl">
              {t("home.heroTagline")
                .split("|")
                .map(
                  (word, index, parts): ReactNode => (
                    <span key={index}>
                      <span className="text-secondary">{word.trim()}</span>
                      {index < parts.length - 1 && (
                        <span className="mx-2 text-gold">|</span>
                      )}
                    </span>
                  ),
                )}
            </p>
            <p className="mt-5 inline-block rounded-md border-y-2 border-gold bg-accent/30 px-4 py-2 font-tamil text-2xl font-bold text-primary">
              {t("home.heroSlogan")}
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t("home.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/enroll"
                className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-opacity hover:opacity-90"
              >
                {t("home.heroCta")} →
              </Link>
              <Link
                to="/card"
                className="rounded-md border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-muted"
              >
                {t("home.secondaryCta")}
              </Link>
            </div>
          </div>

          <figure className="flex flex-col items-center">
            <img
              src={leaderCutout}
              alt={t("about.founderName")}
              className="max-h-96 w-auto object-contain drop-shadow-2xl md:max-h-[520px]"
            />
            <figcaption className="mt-3 text-center">
              <span className="block font-display text-lg text-primary">
                {t("about.founderName")}
              </span>
              <span className="block text-xs uppercase tracking-[0.18em] text-secondary">
                {t("about.founderTitle")}
              </span>
            </figcaption>
          </figure>
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
              {([
                ["about.facts.founded", "about.facts.foundedValue"],
                ["about.facts.ideology", "about.facts.ideologyValue"],
                ["about.facts.headquarters", "about.facts.headquartersValue"],
                ["about.facts.secretary", "about.facts.secretaryValue"],
              ] as [string, string][]).map(([labelKey, valueKey]: [string, string]) => (
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
