import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { BrandStrip } from "./BrandStrip";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/i18n";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BrandStrip className="no-print" />
      <header className="no-print border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold bg-primary font-display text-lg text-primary-foreground">
              ★
            </span>
            <span>
              <span className="block font-display text-lg leading-tight text-primary">
                {t("app.party")}
              </span>
              <span className="block text-xs text-muted-foreground">{t("app.fullName")}</span>
            </span>
          </Link>
          <nav className="ml-auto flex flex-wrap items-center gap-1 text-sm">
            <HeaderLink to="/">{t("nav.home")}</HeaderLink>
            <HeaderLink to="/enroll">{t("nav.enroll")}</HeaderLink>
            <HeaderLink to="/card">{t("nav.card")}</HeaderLink>
            <span className="ml-2">
              <LanguageSwitcher />
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="no-print mt-16 border-t border-border bg-card">
        <BrandStrip />
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("app.party")} · {t("app.state")}
        </div>
      </footer>
    </div>
  );
}

function HeaderLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted"
      activeProps={{ className: "bg-muted text-primary" }}
      activeOptions={{ exact: to === "/" }}
    >
      {children}
    </Link>
  );
}
