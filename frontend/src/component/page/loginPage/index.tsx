"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import AppHeader from "@/component/UI/appHeader";
import Button from "@/component/UI/button";
import { api, json, errorMessage, ApiError } from "@/lib/api";
import type { User } from "@/types/api";
import type { LoginState } from "./types";
import styles from "./style.module.scss";
export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [state, setState] = useState<LoginState>({
    selectedId: "",
    busy: false,
    error: "",
  });
  useEffect(() => {
    const controller = new AbortController();
    api<User[]>("/auth/demo-users", { signal: controller.signal })
      .then(setUsers)
      .catch((e) => {
        if (!controller.signal.aborted)
          setState((s) => ({ ...s, error: errorMessage(e) }));
      });
    api<User>("/auth/me", { signal: controller.signal })
      .then(() => router.replace("/"))
      .catch((e) => {
        if (
          !controller.signal.aborted &&
          !(e instanceof ApiError && e.status === 401)
        )
          setState((s) => ({ ...s, error: errorMessage(e) }));
      });
    return () => controller.abort();
  }, [router]);
  const login = async () => {
    setState((s) => ({ ...s, busy: true, error: "" }));
    try {
      await api<User>("/auth/demo-login", {
        method: "POST",
        body: json({ userId: state.selectedId }),
      });
      router.replace("/");
    } catch (e) {
      setState((s) => ({ ...s, busy: false, error: errorMessage(e) }));
    }
  };
  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.symbol}>
            <FileText size={29} />
          </span>
          <p className={styles.eyebrow}>SPACE FOR YOUR NEXT IDEA</p>
          <h1>
            Good work starts
            <br />
            with a blank page.
          </h1>
          <p>
            Write, organize, and share your documents.
            <br />A little less friction. A lot more focus.
          </p>
        </div>
        <section className={styles.panel}>
          <h2>Welcome to Ajaia</h2>
          <p className={styles.caption}>
            Choose a demo account to explore your workspace.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void login();
            }}
          >
            <fieldset disabled={state.busy}>
              <legend className={styles.legend}>Demo accounts</legend>
              {users.map((user) => (
                <label
                  key={user.id}
                  className={`${styles.account} ${state.selectedId === user.id ? styles.selected : ""}`}
                >
                  <input
                    type="radio"
                    name="account"
                    value={user.id}
                    checked={state.selectedId === user.id}
                    onChange={() =>
                      setState((s) => ({ ...s, selectedId: user.id }))
                    }
                    required
                  />
                  <span className={styles.avatar}>{user.name[0]}</span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            {!users.length && !state.error && (
              <p role="status">Loading demo accounts…</p>
            )}
            {state.error && (
              <p role="alert" className={styles.error}>
                {state.error}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={state.busy || !state.selectedId}
              className={styles.continue}
            >
              {state.busy ? "Signing in…" : "Continue to workspace"}
              <ArrowRight size={17} />
            </Button>
          </form>
          <p className={styles.disclaimer}>
            <ShieldCheck size={16} />
            Demonstration accounts only. Everyone can access these identities.
            Please don’t store sensitive information.
          </p>
        </section>
      </main>
      <footer className={styles.footer}>A focused place for your words.</footer>
    </>
  );
}
