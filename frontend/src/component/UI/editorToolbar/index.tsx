"use client";
import { useEditorState } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo2,
  Redo2,
} from "lucide-react";
import type { EditorToolbarProps } from "./types";
import styles from "./style.module.scss";
export default function EditorToolbar({
  editor,
  readOnly,
}: EditorToolbarProps) {
  useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            h1: editor.isActive("heading", { level: 1 }),
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            undo: editor.can().undo(),
            redo: editor.can().redo(),
          }
        : null,
  });
  const commands = [
    {
      label: "Bold",
      icon: Bold,
      active: editor?.isActive("bold"),
      run: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: editor?.isActive("italic"),
      run: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      label: "Underline",
      icon: Underline,
      active: editor?.isActive("underline"),
      run: () => editor?.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Heading 1",
      icon: Heading1,
      active: editor?.isActive("heading", { level: 1 }),
      run: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Heading 2",
      icon: Heading2,
      active: editor?.isActive("heading", { level: 2 }),
      run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3",
      icon: Heading3,
      active: editor?.isActive("heading", { level: 3 }),
      run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bulleted list",
      icon: List,
      active: editor?.isActive("bulletList"),
      run: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: editor?.isActive("orderedList"),
      run: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Undo",
      icon: Undo2,
      unavailable: !editor?.can().undo(),
      run: () => editor?.chain().focus().undo().run(),
    },
    {
      label: "Redo",
      icon: Redo2,
      unavailable: !editor?.can().redo(),
      run: () => editor?.chain().focus().redo().run(),
    },
  ];
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
      {commands.map(
        ({ label, icon: Icon, active, unavailable, run }, index) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={index < 8 ? !!active : undefined}
            disabled={!editor || readOnly || unavailable}
            className={`${styles.tool} ${active ? styles.active : ""} ${[3, 6, 8].includes(index) ? styles.group : ""}`}
            onClick={run}
          >
            <Icon size={18} />
          </button>
        ),
      )}
      <span className={styles.hint}>
        {readOnly ? "Read-only" : "Changes save automatically"}
      </span>
    </div>
  );
}
