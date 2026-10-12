import type { DocumentSummary } from "@/types/api";
export type DocumentAction = {
  kind: "rename" | "delete";
  document: DocumentSummary;
} | null;
