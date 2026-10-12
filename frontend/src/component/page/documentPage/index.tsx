"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, Lock, Pencil } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { api, json, errorMessage } from "@/lib/api";
import type { DocumentRecord } from "@/types/api";
import Button from "@/component/UI/button";
import Modal from "@/component/UI/modal";
import ShareDialog from "@/component/UI/shareDialog";
import DocumentEditor from "@/component/UI/documentEditor";
import type { DocumentPageState } from "./types";
import styles from "./style.module.scss";
export default function DocumentPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const router = useRouter();
  const { user, error: sessionError } = useSession();
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [state, setState] = useState<DocumentPageState>({
    loading: true,
    error: "",
  });
  const [share, setShare] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [generation, setGeneration] = useState(0);
  const dirty = useRef(false);
  const markDirty = useCallback((value: boolean) => {
    dirty.current = value;
  }, []);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    api<DocumentRecord>(`/documents/${documentId}`, {
      signal: controller.signal,
    })
      .then((doc) => {
        setDocument(doc);
        setState({ loading: false, error: "" });
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setState({ loading: false, error: errorMessage(e) });
      });
    return () => controller.abort();
  }, [user, documentId, generation]);
  const reload = () => {
    setDocument(null);
    setState({ loading: true, error: "" });
    setGeneration((g) => g + 1);
  };
  const back = () => {
    if (
      !dirty.current ||
      window.confirm(
        "You have unsaved changes. Leave the editor? A draft will be retained in this browser tab.",
      )
    )
      router.push("/");
  };
  const rename = async () => {
    if (!document) return;
    setBusy(true);
    setRenameError("");
    try {
      const updated = await api<DocumentRecord>(
        `/documents/${document.id}/title`,
        { method: "PATCH", body: json({ title }) },
      );
      setDocument((d) =>
        d ? { ...d, title: updated.title, updatedAt: updated.updatedAt } : d,
      );
      setRenaming(false);
    } catch (e) {
      setRenameError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  if (sessionError || state.error)
    return (
      <main className={styles.errorPage}>
        <h1>Unable to open document</h1>
        <p role="alert">{sessionError || state.error}</p>
        <Button onClick={reload}>Try again</Button>
        <Button onClick={() => router.push("/")}>Back to workspace</Button>
      </main>
    );
  if (!document || !user || state.loading)
    return (
      <main className={styles.errorPage}>
        <p role="status">Opening your document…</p>
      </main>
    );
  return (
    <>
      <header className={styles.header}>
        <Button variant="ghost" onClick={back} aria-label="Back to dashboard">
          <ArrowLeft size={20} />
        </Button>
        <div className={styles.identity}>
          <div className={styles.title}>
            <h1>{document.title}</h1>
            {document.permission === "OWNER" && (
              <button
                aria-label="Rename document"
                title="Rename document"
                onClick={() => {
                  setTitle(document.title);
                  setRenaming(true);
                }}
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
          <p>
            {document.owner.name}
            <span>·</span>
            {document.permission === "OWNER"
              ? "Your document"
              : document.permission === "VIEW"
                ? "Viewer access · Read-only"
                : "Editor access"}
          </p>
        </div>
        <div className={styles.actions}>
          {document.permission === "OWNER" ? (
            <Button variant="primary" onClick={() => setShare(true)}>
              <Share2 size={16} />
              Share
            </Button>
          ) : (
            <span className={styles.permission}>
              <Lock size={14} />
              {document.permission === "VIEW" ? "Read-only" : "Can edit"}
            </span>
          )}
          <span className={styles.avatar} title={`Signed in as ${user.name}`}>
            {user.name[0]}
          </span>
        </div>
      </header>
      <DocumentEditor
        key={`${document.id}:${generation}`}
        document={document}
        userId={user.id}
        onReload={reload}
        onDirtyChange={markDirty}
      />
      {share && (
        <ShareDialog document={document} onClose={() => setShare(false)} />
      )}
      {renaming && (
        <Modal
          title="Rename document"
          onClose={() => setRenaming(false)}
          busy={busy}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void rename();
            }}
          >
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
            {renameError && (
              <p className={styles.error} role="alert">
                {renameError}
              </p>
            )}
            <div className={styles.dialogActions}>
              <Button onClick={() => setRenaming(false)} disabled={busy}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={busy || !title.trim()}
              >
                {busy ? "Saving…" : "Save title"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
