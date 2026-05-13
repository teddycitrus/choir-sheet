// Mirror of lib/auth.ts `verifyToken` for the Convex runtime. Convex
// mutations run in a V8 isolate that exposes Web Crypto (`crypto.subtle`)
// rather than Node's `crypto`, so the HMAC has to be re-implemented here.
//
// The secret must be set in Convex env, NOT just `.env.local`:
//   npx convex env set AUTH_PASS <value-from-.env.local>
//   npx convex env set SESSION_SECRET <value>   # optional
//
// Token format: `${expiresAt}.${hmac_sha256(expiresAt)}`

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time string compare (avoids early-exit timing leaks on hex digests).
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function verifyToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const given = token.slice(dot + 1);

  const secret = process.env.SESSION_SECRET || process.env.AUTH_PASS;
  if (!secret) throw new Error("Convex env missing AUTH_PASS / SESSION_SECRET");

  const expected = await hmacSha256Hex(secret, payload);
  if (!timingSafeEqualStr(given, expected)) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt)) return false;
  if (Date.now() > expiresAt) return false;
  return true;
}

export async function requireAuth(token: string | undefined | null): Promise<void> {
  if (!(await verifyToken(token))) {
    throw new Error("Unauthorized");
  }
}
