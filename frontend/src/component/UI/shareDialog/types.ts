import type { DocumentSummary } from "@/types/api";
export type ShareDialogProps = {
  document: DocumentSummary;
  onClose: () => void;
};
