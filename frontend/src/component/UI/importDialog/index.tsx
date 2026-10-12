"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import type { DocumentRecord } from "@/types/api";
import Button from "../button";
import Modal from "../modal";
import type { ImportDialogProps } from "./types";
import styles from "./style.module.scss";
export default function ImportDialog({
  onClose,
  onImported,
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const upload = async () => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("The maximum file size is 2 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const doc = await api<DocumentRecord>("/documents/import", {
        method: "POST",
        body,
      });
      onImported(doc.id);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };
  return (
    <Modal title="Import a document" onClose={onClose} busy={busy}>
      <p className={styles.caption}>
        Bring your notes into Ajaia. TXT and Markdown files, up to 2 MB.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void upload();
        }}
      >
        <label className={styles.file}>
          <Upload size={30} />
          <span>Choose a text or Markdown file</span>
          <input
            type="file"
            accept=".txt,.md"
            disabled={busy}
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError("");
            }}
            required
          />
        </label>
        <p className={styles.caption}>
          Headings, bold, italic and lists are supported. Links, images and code
          are imported as text.
        </p>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div className={styles.actions}>
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={busy || !file}>
            {busy ? "Importing…" : "Import document"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
