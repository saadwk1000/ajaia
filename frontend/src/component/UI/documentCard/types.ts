import type { DocumentSummary } from "@/types/api";
export type DocumentCardProps = {
  document: DocumentSummary;
  onRename: () => void;
  onShare: () => void;
  onDelete: () => void;
};
