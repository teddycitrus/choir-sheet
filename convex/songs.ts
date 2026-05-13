import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./auth";

// Shape of a song's data fields. Reused across create/update validators.
const songFields = {
  name:          v.string(),
  listen:        v.optional(v.string()),
  chords:        v.string(),
  key:           v.string(),
  transpose:     v.string(),
  capo:          v.string(),
  bpm:           v.string(),
  beat:          v.string(),
  type:          v.optional(v.array(v.string())),
  usage_counter: v.optional(v.number()),
  lyrics:        v.optional(v.string()),
  chordsStorageId: v.optional(v.id("_storage")),
  lyricsStorageId: v.optional(v.id("_storage")),
  notes:         v.optional(v.string()),
};

// Live, reactive read. Each song is returned with resolved serving URLs
// for any Convex-stored files, so the client can iframe them directly.
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("songs").collect();
    return await Promise.all(rows.map(async (s) => {
      const [chordsUrl, lyricsUrl] = await Promise.all([
        s.chordsStorageId ? ctx.storage.getUrl(s.chordsStorageId) : null,
        s.lyricsStorageId ? ctx.storage.getUrl(s.lyricsStorageId) : null,
      ]);
      const [chordsMeta, lyricsMeta] = await Promise.all([
        s.chordsStorageId ? ctx.db.system.get(s.chordsStorageId) : null,
        s.lyricsStorageId ? ctx.db.system.get(s.lyricsStorageId) : null,
      ]);
      return {
        ...s,
        chordsFileUrl:  chordsUrl,
        lyricsFileUrl:  lyricsUrl,
        chordsFileType: extFromContentType(chordsMeta?.contentType ?? null),
        lyricsFileType: extFromContentType(lyricsMeta?.contentType ?? null),
      };
    }));
  },
});

// Fresh serving URL for a single song's file. Called by the view page on
// open — Convex URLs expire after ~1 hour so we don't want to rely on a
// URL stashed in the list query result from minutes ago.
export const getFileUrl = query({
  args: {
    id: v.id("songs"),
    kind: v.union(v.literal("chords"), v.literal("lyrics")),
  },
  handler: async (ctx, { id, kind }) => {
    const song = await ctx.db.get(id);
    if (!song) return null;
    const storageId = kind === "chords" ? song.chordsStorageId : song.lyricsStorageId;
    if (!storageId) return null;
    const [url, meta] = await Promise.all([
      ctx.storage.getUrl(storageId),
      ctx.db.system.get(storageId),
    ]);
    if (!url) return null;
    return {
      url,
      ext: extFromContentType(meta?.contentType ?? null),
      songName: song.name,
    };
  },
});

function extFromContentType(ct: string | null): "pdf" | "docx" | null {
  if (!ct) return null;
  if (ct.includes("pdf")) return "pdf";
  if (ct.includes("wordprocessingml") || ct.includes("docx")) return "docx";
  return null;
}

export const create = mutation({
  args: { token: v.string(), ...songFields },
  handler: async (ctx, { token, ...song }) => {
    await requireAuth(token);
    return await ctx.db.insert("songs", song);
  },
});

export const update = mutation({
  args: { token: v.string(), id: v.id("songs"), ...songFields },
  handler: async (ctx, { token, id, ...song }) => {
    await requireAuth(token);
    // Find any Convex-stored files being replaced and delete them, so we
    // don't bleed storage when users swap files.
    const existing = await ctx.db.get(id);
    if (existing) {
      if (existing.chordsStorageId && existing.chordsStorageId !== song.chordsStorageId) {
        await ctx.storage.delete(existing.chordsStorageId);
      }
      if (existing.lyricsStorageId && existing.lyricsStorageId !== song.lyricsStorageId) {
        await ctx.storage.delete(existing.lyricsStorageId);
      }
    }
    await ctx.db.replace(id, song);
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("songs") },
  handler: async (ctx, { token, id }) => {
    await requireAuth(token);
    const song = await ctx.db.get(id);
    if (!song) return;
    if (song.chordsStorageId) await ctx.storage.delete(song.chordsStorageId);
    if (song.lyricsStorageId) await ctx.storage.delete(song.lyricsStorageId);
    await ctx.db.delete(id);
  },
});

export const incrementUsage = mutation({
  args: { token: v.string(), ids: v.array(v.id("songs")) },
  handler: async (ctx, { token, ids }) => {
    await requireAuth(token);
    for (const id of ids) {
      const song = await ctx.db.get(id);
      if (song) {
        await ctx.db.patch(id, { usage_counter: (song.usage_counter ?? 0) + 1 });
      }
    }
  },
});

// Returns a short-lived URL for uploading a file into Convex storage.
// Auth-required: matches the existing /api/files/upload route's posture.
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAuth(token);
    return await ctx.storage.generateUploadUrl();
  },
});

// Called from scripts/migrate-files.mjs only. Patches a song's storage ID
// for either chords or lyrics, and clears the legacy B2 filename field.
// Auth-required.
export const attachStorageId = mutation({
  args: {
    token: v.string(),
    id: v.id("songs"),
    kind: v.union(v.literal("chords"), v.literal("lyrics")),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { token, id, kind, storageId }) => {
    await requireAuth(token);
    if (kind === "chords") {
      await ctx.db.patch(id, { chordsStorageId: storageId });
    } else {
      await ctx.db.patch(id, { lyricsStorageId: storageId });
    }
  },
});

// Used only by scripts/migrate-songs.mjs. Idempotent: skipped if a song
// with this name already exists. No auth required (script-only).
export const migrateInsert = mutation({
  args: songFields,
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("songs")
      .withIndex("by_name", q => q.eq("name", args.name))
      .first();
    if (existing) return { id: existing._id, skipped: true };
    const id = await ctx.db.insert("songs", args);
    return { id, skipped: false };
  },
});
