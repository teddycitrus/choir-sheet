// One-off migration: MongoDB `songs.music` → Convex `songs` table.
//
// Safe to re-run: each insert is idempotent (skipped if a song with the
// same `name` is already in Convex).
//
// Usage:  node scripts/migrate-songs.mjs

import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}
if (!CONVEX_URL) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}

const mongo = new MongoClient(MONGODB_URI);
const convex = new ConvexHttpClient(CONVEX_URL);

// Strip undefined keys so Convex doesn't reject the payload.
function compact(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

await mongo.connect();
console.log("Connected to MongoDB");

try {
  const collection = mongo.db("songs").collection("music");
  const docs = await collection.find({}).toArray();
  console.log(`Found ${docs.length} songs in MongoDB`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of docs) {
    const payload = compact({
      name:          String(doc.name ?? ""),
      listen:        doc.listen != null ? String(doc.listen) : undefined,
      chords:        String(doc.chords ?? ""),
      key:           String(doc.key ?? ""),
      transpose:     String(doc.transpose ?? ""),
      capo:          String(doc.capo ?? ""),
      bpm:           String(doc.bpm ?? ""),
      beat:          String(doc.beat ?? ""),
      type:          Array.isArray(doc.type) ? doc.type.map(String) : undefined,
      usage_counter: typeof doc.usage_counter === "number"
        ? doc.usage_counter
        : (doc.usage_counter != null && !isNaN(Number(doc.usage_counter))
          ? Number(doc.usage_counter)
          : undefined),
      lyrics:        doc.lyrics != null ? String(doc.lyrics) : undefined,
      chordsFile:    doc.chordsFile != null ? String(doc.chordsFile) : undefined,
      lyricsFile:    doc.lyricsFile != null ? String(doc.lyricsFile) : undefined,
      notes:         doc.notes != null ? String(doc.notes) : undefined,
    });

    if (!payload.name) {
      console.warn(`skip (no name): ${doc._id}`);
      failed++;
      continue;
    }

    try {
      const result = await convex.mutation(api.songs.migrateInsert, payload);
      if (result.skipped) {
        skipped++;
        console.log(`skip: ${payload.name}`);
      } else {
        inserted++;
        console.log(`insert: ${payload.name}`);
      }
    } catch (err) {
      failed++;
      console.error(`fail: ${payload.name} —`, err.message ?? err);
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}, Failed: ${failed}`);
} finally {
  await mongo.close();
}
