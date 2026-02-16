"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  nextPath: string;
  notice?: string;
};

export default function LoginForm({ nextPath, notice = "" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="w-full max-w-lg space-y-4 rounded-3xl border border-cyan-900/20 bg-sky-100/66 p-6 shadow-2xl backdrop-blur-md sm:p-8"
      onSubmit={onSubmit}
    >
      <div>
        <p className="mb-2 inline-flex rounded-full border border-cyan-400/50 bg-cyan-100/80 px-3 py-1 text-xs text-cyan-700">
          Secure Login
        </p>
        <h1 className="text-2xl font-semibold text-slate-800">เข้าสู่ระบบ</h1>
        <p className="mt-2 text-sm text-slate-700">ล็อกอินเพื่อเข้าพื้นที่สมาชิกและเครื่องมือทั้งหมด</p>
      </div>

      <label className="block text-sm text-slate-700">
        อีเมล
        <input
          className="mt-1.5 h-11 w-full rounded-xl border border-cyan-900/20 bg-sky-100/78 px-3 text-slate-800 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-300/50"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="block text-sm text-slate-700">
        รหัสผ่าน
        <input
          className="mt-1.5 h-11 w-full rounded-xl border border-cyan-900/20 bg-sky-100/78 px-3 text-slate-800 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-300/50"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {!error && notice ? <p className="text-sm text-cyan-700">{notice}</p> : null}

      <button className="button primary w-full" type="submit" disabled={loading}>
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      <p className="text-sm text-slate-700">
        ยังไม่มีบัญชี?{" "}
        <a className="text-cyan-700 hover:text-cyan-700" href="/register">
          สมัครสมาชิก
        </a>
      </p>
    </form>
  );
}





