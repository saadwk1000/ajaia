import Link from "next/link";
import { FileText, LogOut } from "lucide-react";
import Button from "../button";
import type { AppHeaderProps } from "./types";
import styles from "./style.module.scss";
export default function AppHeader({ user, onLogout, busy }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <span className={styles.logo}>
          <FileText size={21} />
        </span>
        Ajaia <span className={styles.docs}>Docs</span>
      </Link>
      <div className={styles.account}>
        <span className={styles.demo}>Demo workspace</span>
        {user && (
          <>
            <span className={styles.avatar}>{user.name[0]}</span>
            <span className={styles.name}>{user.name}</span>
            <Button
              variant="ghost"
              onClick={onLogout}
              disabled={busy}
              aria-label="Log out"
            >
              <LogOut size={17} />
              <span className={styles.logout}>Log out</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
