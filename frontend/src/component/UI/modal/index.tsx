"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import type { ModalProps } from "./types";
import styles from "./style.module.scss";
export default function Modal({ title, children, onClose, busy }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={styles.modal}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className={styles.heading}>
        <h2 id={id}>{title}</h2>
        <button onClick={onClose} disabled={busy} aria-label="Close dialog">
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
