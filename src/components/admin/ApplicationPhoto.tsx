import { useEffect, useState } from "react";

import { signedPhotoUrl } from "@/services/admin";

/** Shows a private storage photo through a short-lived signed URL (admins only). */
export function ApplicationPhoto({ path, alt }: { path: string | null; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void signedPhotoUrl(path).then((signed) => {
      if (!cancelled) setUrl(signed);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!url) {
    return <div className="h-32 w-24 shrink-0 rounded-md border border-border bg-muted" />;
  }

  return (
    <img
      src={url}
      alt={alt}
      className="h-32 w-24 shrink-0 rounded-md border border-border object-cover"
    />
  );
}
