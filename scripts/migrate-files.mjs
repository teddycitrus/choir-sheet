// One-off file migration: Backblaze B2 → Convex storage.
//
// For each song with a B2 filename (chordsFile / lyricsFile) and no
// matching storageId, this script:
//   1. Downloads the file via the existing /api/files/[kind]/[id] route
//      (so Next dev server or prod must be reachable).
//   2. Uploads it into Convex storage.
//   3. Patches the song with the new storageId and clears the legacy
//      filename.
//
// Safe to re-run — songs that already have a storageId are skipped.
//
// Usage:
//   node scripts/migrate-files.mjs
//
// Optional env:
//   MIGRATION_APP_URL  — defaults to http://localhost:3000

import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

// Mirror Next.js's env loading: .env.local takes priority over .env.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const APP_URL = process.env.MIGRATION_APP_URL ?? "http://localhost:3000";
const AUTH_PASS = process.env.AUTH_PASS;

if (!CONVEX_URL) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}
if (!AUTH_PASS) {
  console.error("Missing AUTH_PASS in .env.local (needed to mint a session token)");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

// Mint a real session token by hitting the existing /api/checkAuth route.
async function getToken() {
  const res = await fetch(`${APP_URL}/api/checkAuth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: AUTH_PASS }),
  });
  if (!res.ok) throw new Error(`checkAuth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  if (!data.ok || typeof data.token !== "string") {
    throw new Error("checkAuth returned no token");
  }
  return data.token;
}

async function migrateFile(token, songId, kind, fileName) {
  // 1. Download the file bytes from the existing B2-backed route.
  const fileUrl = `${APP_URL}/api/files/${kind}/${encodeURIComponent(fileName)}`;
  const dlRes = await fetch(fileUrl);
  if (!dlRes.ok) {
    throw new Error(`download ${fileUrl}: ${dlRes.status}`);
  }
  const bytes = await dlRes.arrayBuffer();
  const contentType = dlRes.headers.get("content-type") ?? "application/octet-stream";

  // 2. Get a Convex upload URL.
  const uploadUrl = await convex.mutation(api.songs.generateUploadUrl, { token });

  // 3. POST the bytes to it.
  const upRes = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: bytes,
  });
  if (!upRes.ok) {
    throw new Error(`convex upload: ${upRes.status} ${await upRes.text()}`);
  }
  const { storageId } = await upRes.json();

  // 4. Attach to the song; clears the legacy filename.
  await convex.mutation(api.songs.attachStorageId, { token, id: songId, kind, storageId });
}

console.log(`App URL: ${APP_URL}`);
console.log(`Convex:  ${CONVEX_URL}`);

const token = await getToken();
console.log("Got auth token");

const songs = await convex.query(api.songs.list, {});
console.log(`${songs.length} songs in Convex`);

let migrated = 0;
let skipped = 0;
let failed = 0;

for (const song of songs) {
  for (const kind of /** @type {const} */ (["chords", "lyrics"])) {
    const fileNameField = kind === "chords" ? "chordsFile" : "lyricsFile";
    const storageIdField = kind === "chords" ? "chordsStorageId" : "lyricsStorageId";
    const fileName = song[fileNameField];
    const storageId = song[storageIdField];

    if (!fileName) continue;             // nothing to migrate for this kind
    if (storageId) {                     // already migrated
      skipped++;
      console.log(`skip ${kind}: ${song.name}`);
      continue;
    }

    try {
      console.log(`${kind}: ${song.name} (${fileName})`);
      await migrateFile(token, song._id, kind, fileName);
      migrated++;
    } catch (err) {
      failed++;
      console.error(`FAIL ${kind} for ${song.name}:`, err.message ?? err);
    }
  }
}

console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`);
