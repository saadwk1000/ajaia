"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Check, Cloud, AlertCircle, Download } from "lucide-react";
import { api, json, ApiError, errorMessage } from "@/lib/api";
import type { SaveResult } from "@/types/api";
import Button from "../button";
import EditorToolbar from "../editorToolbar";
import type { DocumentEditorProps, Draft, SaveStatus } from "./types";
import styles from "./style.module.scss";
export default function DocumentEditor({
  document,
  userId,
  onReload,
  onDirtyChange,
}: DocumentEditorProps) {
  const readOnly = document.permission === "VIEW";
  const [status, setStatus] = useState<SaveStatus>("Saved");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(() => {
    if (typeof window === "undefined" || readOnly) return null;
    try {
      const raw = sessionStorage.getItem(
        `ajaia:draft:${userId}:${document.id}`,
      );
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Draft;
      return parsed.content?.type === "doc" &&
        Number.isInteger(parsed.expectedVersion)
        ? parsed
        : null;
    } catch {
      return null;
    }
  });
  const version = useRef(document.version);
  const latest = useRef<JSONContent>(document.content);
  const saved = useRef(json(document.content));
  const inFlight = useRef(false);
  const dirty = useRef(false);
  const blocked = useRef(false);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef<() => Promise<void>>(async () => {});
  const draftKey = `ajaia:draft:${userId}:${document.id}`;
  const persistDraft = useCallback(
    (content: JSONContent, expectedVersion: number) => {
      try {
        sessionStorage.setItem(draftKey, json({ content, expectedVersion }));
      } catch {
        /* Navigation warning still protects changes if storage is unavailable. */
      }
    },
    [draftKey],
  );
  const updateDirty = useCallback(
    (value: boolean) => {
      dirty.current = value;
      onDirtyChange(value);
    },
    [onDirtyChange],
  );
  const change = useCallback(
    (content: JSONContent) => {
      latest.current = content;
      const isDirty = json(content) !== saved.current;
      updateDirty(isDirty);
      if (timer.current) clearTimeout(timer.current);
      if (!isDirty) {
        if (!inFlight.current && !blocked.current) setStatus("Saved");
        try {
          sessionStorage.removeItem(draftKey);
        } catch {}
        return;
      }
      persistDraft(content, version.current);
      if (!blocked.current) {
        setStatus(inFlight.current ? "Saving…" : "Unsaved changes");
        timer.current = setTimeout(() => void saveRef.current(), 1000);
      }
    },
    [draftKey, persistDraft, updateDirty],
  );
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        trailingNode: false,
      }),
    ],
    content: document.content,
    immediatelyRender: false,
    editable: !readOnly,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Document content",
        "aria-multiline": "true",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => change(editor.getJSON()),
  });
  const save = useCallback(async () => {
    if (readOnly || inFlight.current || !dirty.current || blocked.current)
      return;
    inFlight.current = true;
    setStatus("Saving…");
    setError("");
    const snapshot = latest.current;
    try {
      const result = await api<SaveResult>(
        `/documents/${document.id}/content`,
        {
          method: "PATCH",
          body: json({ content: snapshot, expectedVersion: version.current }),
        },
      );
      version.current = result.version;
      saved.current = json(snapshot);
      const remaining = json(latest.current) !== saved.current;
      dirty.current = remaining;
      if (remaining && mounted.current)
        persistDraft(latest.current, version.current);
      else if (!remaining) {
        try {
          const stored = sessionStorage.getItem(draftKey);
          if (
            stored &&
            json((JSON.parse(stored) as Draft).content) === saved.current
          )
            sessionStorage.removeItem(draftKey);
        } catch {}
      }
      if (mounted.current) {
        onDirtyChange(remaining);
        setStatus(remaining ? "Unsaved changes" : "Saved");
      }
      if (remaining && mounted.current)
        timer.current = setTimeout(() => void saveRef.current(), 1000);
    } catch (e) {
      blocked.current = true;
      if (mounted.current) persistDraft(latest.current, version.current);
      if (mounted.current) {
        setStatus(
          e instanceof ApiError && e.status === 409
            ? "Version conflict"
            : "Save failed",
        );
        setError(errorMessage(e));
      }
    } finally {
      inFlight.current = false;
    }
  }, [readOnly, document.id, draftKey, persistDraft, onDirtyChange]);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  useEffect(() => {
    mounted.current = true;
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty.current || inFlight.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("beforeunload", unload);
    };
  }, [draftKey, readOnly]);
  const restore = () => {
    if (!draft || !editor) return;
    version.current = draft.expectedVersion;
    editor.commands.setContent(draft.content, { emitUpdate: false });
    change(draft.content);
    setDraft(null);
  };
  const discard = () => {
    try {
      sessionStorage.removeItem(draftKey);
    } catch {}
    setDraft(null);
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(latest.current, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = "ajaia-unsaved-content.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className={styles.editor}>
      <EditorToolbar editor={editor} readOnly={readOnly} />
      <div className={styles.status} role="status">
        {status === "Saved" ? (
          <Check size={14} />
        ) : status === "Save failed" || status === "Version conflict" ? (
          <AlertCircle size={14} />
        ) : (
          <Cloud size={14} />
        )}
        {readOnly ? "Read-only · Viewer access" : status}
      </div>
      {draft && (
        <div className={styles.banner}>
          <p>An unsaved draft from this browser tab is available.</p>
          <Button onClick={restore}>Restore draft</Button>
          <Button variant="ghost" onClick={discard}>
            Discard draft
          </Button>
        </div>
      )}
      {error && (
        <div className={styles.banner} role="alert">
          <p>{error}</p>
          {status !== "Version conflict" && (
            <Button
              onClick={() => {
                blocked.current = false;
                void save();
              }}
            >
              Retry save
            </Button>
          )}
          <Button
            onClick={() => {
              if (
                window.confirm(
                  "Reload the latest saved version? Your current changes remain available as a recoverable draft.",
                )
              ) {
                onDirtyChange(false);
                onReload();
              }
            }}
          >
            Reload latest
          </Button>
          <Button variant="ghost" onClick={download}>
            <Download size={15} />
            Export local changes
          </Button>
        </div>
      )}
      <div className={styles.canvas}>
        <div className={styles.paper}>
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <p role="status">Preparing your document…</p>
          )}
        </div>
      </div>
      <footer className={styles.footer}>
        <span>
          {document.owner.name} ·{" "}
          {readOnly
            ? "Viewer"
            : document.permission === "OWNER"
              ? "Owner"
              : "Editor"}
        </span>
        <span>Shared access · Changes are not merged in real time</span>
      </footer>
    </div>
  );
}
