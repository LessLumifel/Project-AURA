"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LogoutActionProps = {
  className?: string;
};

export default function LogoutAction({ className }: LogoutActionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <button className={className || "button"} type="button" onClick={onLogout} disabled={loading}>
      {loading ? "กำลังออก..." : "ออกจากระบบ"}
    </button>
  );
}
