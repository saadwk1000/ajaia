import type { JSONContent } from "@tiptap/react";
export type Permission = "OWNER" | "VIEW" | "EDIT";
export type User = { id: string; name: string; email: string };
export type DocumentSummary = {
  id: string;
  title: string;
  ownerId: string;
  owner: User;
  permission: Permission;
  version: number;
  updatedAt: string;
  createdAt: string;
};
export type DocumentRecord = DocumentSummary & { content: JSONContent };
export type Share = {
  id: string;
  userId: string;
  permission: "VIEW" | "EDIT";
  user: User;
};
export type SaveResult = { version: number; updatedAt: string };
