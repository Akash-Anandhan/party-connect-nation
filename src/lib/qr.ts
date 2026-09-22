import QRCode from "qrcode";

/** Build the public, unauthenticated verification URL for a card token. */
export function verificationUrl(token: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/verify/${token}`;
}

/** Render a QR code pointing at the public verification URL as a data URL. */
export async function verificationQrDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(verificationUrl(token), {
    margin: 1,
    width: 320,
    color: { dark: "#261611", light: "#FFFFFF" },
  });
}
