import Link from "next/link";
import { FileText, Pencil, Share2, Trash2, ArrowUpRight } from "lucide-react";
import type { DocumentCardProps } from "./types";
import styles from "./style.module.scss";
export default function DocumentCard({
  document,
  onRename,
  onShare,
  onDelete,
}: DocumentCardProps) {
  return (
    <article className={styles.card}>
      <Link
        href={`/documents/${document.id}`}
        className={styles.open}
        aria-label={`Open ${document.title}`}
      >
        <div className={styles.top}>
          <span className={styles.icon}>
            <FileText size={24} strokeWidth={1.5} />
          </span>
          <ArrowUpRight size={17} className={styles.arrow} />
        </div>
        <h3>{document.title}</h3>
        <p>
          {document.permission === "OWNER"
            ? "Owned by you"
            : `By ${document.owner.name} · ${document.permission === "VIEW" ? "Viewer" : "Editor"}`}
        </p>
      </Link>
      <div className={styles.footer}>
        <time dateTime={document.updatedAt}>
          {new Date(document.updatedAt).toLocaleDateString("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>
        {document.permission === "OWNER" && (
          <div className={styles.actions}>
            <button
              onClick={onRename}
              aria-label={`Rename ${document.title}`}
              title="Rename"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onShare}
              aria-label={`Share ${document.title}`}
              title="Share"
            >
              <Share2 size={15} />
            </button>
            <button
              onClick={onDelete}
              aria-label={`Delete ${document.title}`}
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
