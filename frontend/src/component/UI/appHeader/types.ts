import type { User } from "@/types/api";
export type AppHeaderProps = {
  user?: User;
  onLogout?: () => void;
  busy?: boolean;
};
