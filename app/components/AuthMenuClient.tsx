"use client";

import { useEffect, useRef, useState } from "react";
import LogoutAction from "./LogoutAction";

type MenuUser = {
  id: string;
  name: string;
  role: "member" | "admin";
};

type AuthMenuClientProps = {
  user: MenuUser | null;
};

export default function AuthMenuClient({ user }: AuthMenuClientProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const label = user ? user.name : "บัญชี";

  return (
    <div ref={containerRef} className="fixed right-3 top-3 z-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-cyan-900/20 bg-sky-100/80 px-3 py-2 text-sm text-slate-800 shadow-xl backdrop-blur-xl transition hover:border-cyan-900/35"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300/20 text-cyan-700">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <span className="max-w-32 truncate">{label}</span>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} fill="currentColor">
          <path d="M5.7 7.7a1 1 0 0 1 1.4 0L10 10.6l2.9-2.9a1 1 0 1 1 1.4 1.4l-3.6 3.6a1 1 0 0 1-1.4 0L5.7 9.1a1 1 0 0 1 0-1.4z" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-cyan-900/20 bg-sky-100/88 p-2 shadow-2xl backdrop-blur-xl" role="menu">
          {user ? (
            <>
              <div className="mb-2 rounded-xl border border-cyan-900/20 bg-sky-100/76 px-3 py-2">
                <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs uppercase tracking-wide text-cyan-700">{user.role}</p>
              </div>
              <a href="/member" className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-sky-100/76" onClick={() => setOpen(false)}>
                พื้นที่สมาชิก
              </a>
              <a href="/member/profile" className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-sky-100/76" onClick={() => setOpen(false)}>
                ข้อมูลสมาชิก
              </a>
              {user.role === "admin" ? (
                <a href="/member/manage" className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-sky-100/76" onClick={() => setOpen(false)}>
                  จัดการสมาชิก
                </a>
              ) : null}
              <div className="mt-2 border-t border-cyan-900/20 pt-2">
                <LogoutAction className="button w-full" />
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-sky-100/76" onClick={() => setOpen(false)}>
                เข้าสู่ระบบ
              </a>
              <a href="/register" className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-sky-100/76" onClick={() => setOpen(false)}>
                สมัครสมาชิก
              </a>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}




