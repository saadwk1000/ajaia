"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, FileText, Users, Search, RefreshCw } from "lucide-react";
import AppHeader from "@/component/UI/appHeader";
import Button from "@/component/UI/button";
import DocumentCard from "@/component/UI/documentCard";
import ShareDialog from "@/component/UI/shareDialog";
import ImportDialog from "@/component/UI/importDialog";
import Modal from "@/component/UI/modal";
import { useSession } from "@/hooks/useSession";
import { api, json, errorMessage } from "@/lib/api";
import type { DocumentSummary, DocumentRecord } from "@/types/api";
import type { DocumentAction } from "./types";
import styles from "./style.module.scss";
export default function DashboardPage() {
  const router = useRouter();
  const { user, error: sessionError, logout } = useSession();
  const [owned, setOwned] = useState<DocumentSummary[]>([]);
  const [shared, setShared] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [share, setShare] = useState<DocumentSummary | null>(null);
  const [importing, setImporting] = useState(false);
  const [action, setAction] = useState<DocumentAction>(null);
  const [title, setTitle] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [o, s] = await Promise.all([
        api<DocumentSummary[]>("/documents?scope=owned"),
        api<DocumentSummary[]>("/documents?scope=shared"),
      ]);
      setOwned(o);
      setShared(s);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (user) void load();
  }, [user, load]);
  const run = async (operation: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await operation();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const create = () =>
    run(async () => {
      const doc = await api<DocumentRecord>("/documents", { method: "POST" });
      router.push(`/documents/${doc.id}`);
    });
  const complete = () =>
    run(async () => {
      if (!action) return;
      await api(
        `/documents/${action.document.id}${action.kind === "rename" ? "/title" : ""}`,
        {
          method: action.kind === "rename" ? "PATCH" : "DELETE",
          ...(action.kind === "rename" ? { body: json({ title }) } : {}),
        },
      );
      setAction(null);
      await load();
      setNotice(
        action.kind === "rename" ? "Document renamed." : "Document deleted.",
      );
    });
  const matches = (d: DocumentSummary) =>
    d.title.toLowerCase().includes(query.toLowerCase());
  const section = (
    label: string,
    items: DocumentSummary[],
    isShared: boolean,
  ) => (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <h2>
          {isShared ? <Users size={18} /> : <FileText size={18} />}
          {label}
          <span>{items.length}</span>
        </h2>
      </div>
      {loading ? (
        <p role="status" className={styles.empty}>
          Loading documents…
        </p>
      ) : items.filter(matches).length ? (
        <div className={styles.grid}>
          {items.filter(matches).map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onShare={() => setShare(doc)}
              onRename={() => {
                setAction({ kind: "rename", document: doc });
                setTitle(doc.title);
              }}
              onDelete={() => setAction({ kind: "delete", document: doc })}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          {isShared ? <Users size={27} /> : <FileText size={27} />}
          <h3>
            {query
              ? "No matching documents"
              : isShared
                ? "Great work happens together"
                : "Your next idea starts here"}
          </h3>
          <p>
            {query
              ? "Try a different search."
              : isShared
                ? "Documents shared with you will appear here."
                : "Create a document or import your existing notes."}
          </p>
          {!isShared && !query && (
            <Button onClick={() => void create()} disabled={busy}>
              Create your first document
              <Plus size={15} />
            </Button>
          )}
        </div>
      )}
    </section>
  );
  if (!user)
    return (
      <>
        <AppHeader />
        <main className={styles.main}>
          <p role={sessionError ? "alert" : "status"}>
            {sessionError || "Opening your workspace…"}
          </p>
          {sessionError && (
            <Button onClick={() => window.location.reload()}>Retry</Button>
          )}
        </main>
      </>
    );
  return (
    <>
      <AppHeader user={user} busy={busy} onLogout={() => void run(logout)} />
      <main className={styles.main}>
        <div className={styles.welcome}>
          <div>
            <p className={styles.eyebrow}>YOUR WORKSPACE</p>
            <h1>Your ideas, all in one place.</h1>
            <p>Welcome back, {user.name}. Pick up where you left off.</p>
          </div>
          <div className={styles.actions}>
            <Button onClick={() => setImporting(true)} disabled={busy}>
              <Upload size={16} />
              Import
            </Button>
            <Button
              variant="primary"
              onClick={() => void create()}
              disabled={busy}
            >
              <Plus size={18} />
              {busy ? "Working…" : "New document"}
            </Button>
          </div>
        </div>
        <div className={styles.searchRow}>
          <label className={styles.search}>
            <Search size={17} />
            <input
              aria-label="Search documents"
              placeholder="Search your documents…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <Button
            variant="ghost"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </Button>
        </div>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className={styles.notice}>
            {notice}
          </p>
        )}
        {section("Owned documents", owned, false)}
        {section("Shared with me", shared, true)}
        <footer className={styles.footer}>
          Ajaia Docs · A little space for big ideas.
        </footer>
      </main>
      {share && <ShareDialog document={share} onClose={() => setShare(null)} />}
      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onImported={(id) => router.push(`/documents/${id}`)}
        />
      )}
      {action && (
        <Modal
          title={
            action.kind === "rename" ? "Rename document" : "Delete document?"
          }
          onClose={() => setAction(null)}
          busy={busy}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void complete();
            }}
          >
            {action.kind === "rename" ? (
              <label className={styles.titleLabel}>
                Document title
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={150}
                />
              </label>
            ) : (
              <p>
                “{action.document.title}” and all its shared access will be
                permanently removed.
              </p>
            )}
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <div className={styles.dialogActions}>
              <Button onClick={() => setAction(null)} disabled={busy}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={action.kind === "delete" ? "danger" : "primary"}
                disabled={busy || (action.kind === "rename" && !title.trim())}
              >
                {busy
                  ? "Working…"
                  : action.kind === "rename"
                    ? "Save title"
                    : "Delete document"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
