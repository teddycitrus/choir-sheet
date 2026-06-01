import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Mirrors types/Song.ts exactly. Numeric-looking fields (transpose, capo,
// bpm) stay as strings because the existing data contains non-numeric
// values like "+2" or "3rd fret".
export default defineSchema({
  songs: defineTable({
    name:          v.string(),
    listen:        v.optional(v.string()),
    chords:        v.string(),
    key:           v.string(),
    // Retained in storage but no longer surfaced in the UI. Kept optional so
    // existing docs stay valid and new songs can omit it. See convex/songs.ts.
    transpose:     v.optional(v.string()),
    capo:          v.string(),
    bpm:           v.string(),
    beat:          v.string(),
    type:          v.optional(v.array(v.string())),
    usage_counter: v.optional(v.number()),
    lyrics:        v.optional(v.string()),
    chordsStorageId: v.optional(v.id("_storage")),
    lyricsStorageId: v.optional(v.id("_storage")),
    notes:         v.optional(v.string()),
  }).index("by_name", ["name"]),
});
