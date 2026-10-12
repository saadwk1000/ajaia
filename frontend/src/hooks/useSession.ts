"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, errorMessage } from "@/lib/api";
import type { User } from "@/types/api";
export function useSession() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    api<User>("/auth/me", { signal: controller.signal })
      .then(setUser)
      .catch((e) => {
        if (controller.signal.aborted) return;
        if (e instanceof ApiError && e.status === 401) router.replace("/login");
        else setError(errorMessage(e));
      });
    const expired = () => {
      setUser(null);
      router.replace("/login");
    };
    window.addEventListener("ajaia:session-expired", expired);
    return () => {
      controller.abort();
      window.removeEventListener("ajaia:session-expired", expired);
    };
  }, [router]);
  const logout = async () => {
    await api("/auth/logout", { method: "POST" });
    try {
      for (const key of Object.keys(sessionStorage))
        if (key.startsWith("ajaia:draft:")) sessionStorage.removeItem(key);
    } catch {}
    setUser(null);
    router.replace("/login");
  };
  return { user, error, logout };
}
