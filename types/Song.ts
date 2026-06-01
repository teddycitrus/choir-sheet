export type Song = {
  _id: string;
  name: string;
  listen?: string;
  chords: string;
  key: string;
  // Retained in the backend but no longer fetched or shown in the UI.
  transpose?: string;
  capo: string;
  bpm: string;
  beat: string;
  type?: string[];
  usage_counter?: number;
  lyrics?: string;
  // Convex storage IDs persisted in the songs table.
  chordsStorageId?: string;
  lyricsStorageId?: string;
  // Server-resolved fields injected by the `list` query (not in the DB).
  chordsFileUrl?: string | null;
  lyricsFileUrl?: string | null;
  chordsFileType?: "pdf" | "docx" | null;
  lyricsFileType?: "pdf" | "docx" | null;
  notes?: string;
}
