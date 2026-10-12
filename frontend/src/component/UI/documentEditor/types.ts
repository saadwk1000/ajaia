import type { JSONContent } from "@tiptap/react";
import type { DocumentRecord } from "@/types/api";
export type SaveStatus =
  "Saved" | "Saving…" | "Unsaved changes" | "Save failed" | "Version conflict";
export type Draft = { content: JSONContent; expectedVersion: number };
export type DocumentEditorProps = {
  document: DocumentRecord;
  userId: string;
  onReload: () => void;
  onDirtyChange: (dirty: boolean) => void;
};
