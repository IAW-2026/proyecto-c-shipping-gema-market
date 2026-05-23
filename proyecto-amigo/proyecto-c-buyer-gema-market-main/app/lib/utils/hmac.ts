import crypto from "crypto";

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex").toUpperCase();
}

export function validateApiKey(request: Request): boolean {
  const received = request.headers.get("x-api-key-hash")?.trim().toUpperCase();
  return received === hashApiKey(process.env.INTERNAL_API_KEY ?? "");
}
