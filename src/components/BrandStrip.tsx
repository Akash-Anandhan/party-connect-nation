export function BrandStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`brand-strip ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}
