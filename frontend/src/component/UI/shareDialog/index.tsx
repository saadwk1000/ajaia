"use client";
import { useCallback, useEffect, useState } from "react";
import { api, json, errorMessage } from "@/lib/api";
import type { User, Share } from "@/types/api";
import Button from "../button";
import Modal from "../modal";
import type { ShareDialogProps } from "./types";
import styles from "./style.module.scss";
export default function ShareDialog({ document, onClose }: ShareDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [selected, setSelected] = useState("");
  const [permission, setPermission] = useState<"VIEW" | "EDIT">("VIEW");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    return Promise.all([
      api<User[]>("/users"),
      api<Share[]>(`/documents/${document.id}/shares`),
    ]);
  }, [document.id]);
  useEffect(() => {
    let active = true;
    load()
      .then(([u, s]) => {
        if (active) {
          setUsers(u);
          setShares(s);
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);
  const mutate = async (path: string, method: string, body?: unknown) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(`/documents/${document.id}/shares${path}`, {
        method,
        ...(body ? { body: json(body) } : {}),
      });
      const [u, s] = await load();
      setUsers(u);
      setShares(s);
      setNotice("Access updated.");
      setSelected("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const eligible = users.filter(
    (u) =>
      !shares.some((s) => s.userId === u.id) &&
      `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Modal title="Share document" onClose={onClose} busy={busy}>
      <p className={styles.title}>{document.title}</p>
      <p className={styles.caption}>
        Only invited demo accounts can access this document.
      </p>
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
      {loading ? (
        <p role="status">Loading access…</p>
      ) : (
        <>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              void mutate("", "POST", { userId: selected, permission });
            }}
          >
            <label>
              Find a demo user
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email"
              />
            </label>
            <div className={styles.invite}>
              <select
                aria-label="User to share with"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                required
                disabled={busy}
              >
                <option value="">Select a person</option>
                {eligible.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {u.email}
                  </option>
                ))}
              </select>
              <select
                aria-label="New share permission"
                value={permission}
                onChange={(e) =>
                  setPermission(e.target.value as "VIEW" | "EDIT")
                }
                disabled={busy}
              >
                <option value="VIEW">Viewer</option>
                <option value="EDIT">Editor</option>
              </select>
            </div>
            <Button
              variant="primary"
              type="submit"
              disabled={busy || !selected}
            >
              Grant access
            </Button>
          </form>
          <h3 className={styles.people}>People with access</h3>
          <div className={styles.person}>
            <div>
              <strong>{document.owner.name}</strong>
              <small>{document.owner.email}</small>
            </div>
            <span>Owner</span>
          </div>
          {shares.map((share) => (
            <div className={styles.person} key={share.id}>
              <div>
                <strong>{share.user.name}</strong>
                <small>{share.user.email}</small>
              </div>
              <div className={styles.actions}>
                <select
                  aria-label={`Permission for ${share.user.name}`}
                  value={share.permission}
                  disabled={busy}
                  onChange={(e) =>
                    void mutate(`/${share.id}`, "PATCH", {
                      permission: e.target.value,
                    })
                  }
                >
                  <option value="VIEW">Viewer</option>
                  <option value="EDIT">Editor</option>
                </select>
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void mutate(`/${share.id}`, "DELETE")}
                  aria-label={`Revoke ${share.user.name}`}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {!shares.length && (
            <p className={styles.caption}>
              This document is private. Invite someone to collaborate.
            </p>
          )}
        </>
      )}
    </Modal>
  );
}
