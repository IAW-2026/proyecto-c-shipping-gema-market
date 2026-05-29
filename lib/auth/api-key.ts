import crypto from "crypto";

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex").toUpperCase();
}

const expectedHash = hashApiKey(process.env.INTERNAL_API_KEY ?? "");

export function validateApiKey(request: Request): boolean {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected) {
    console.error("[AUTH] INTERNAL_API_KEY no configurada");
    return false;
  }
  const received = request.headers.get("x-api-key-hash")?.trim().toUpperCase();
  if (!received) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(received, "hex"),
      Buffer.from(expectedHash, "hex")
    );
  } catch {
    return false;
  }
}
