import { useI18n, type Language } from "@/i18n";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ta", label: "தமிழ்" },
];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className="inline-flex overflow-hidden rounded-md border border-border"
      role="group"
      aria-label={t("nav.language")}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          aria-pressed={language === option.value}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            language === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
