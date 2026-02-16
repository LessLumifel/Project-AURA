"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Register failed");
        return;
      }

      router.push("/login?pending=1");
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
        <p className="mb-2 inline-flex rounded-full border border-indigo-300/60 bg-indigo-100/80 px-3 py-1 text-xs text-indigo-700">
          Member Registration
        </p>
        <h1 className="text-2xl font-semibold text-slate-800">สมัครสมาชิก</h1>
        <p className="mt-2 text-sm text-slate-700">สร้างบัญชีและรอ admin อนุมัติก่อนเข้าสู่ระบบ</p>
      </div>

      <label className="block text-sm text-slate-700">
        ชื่อที่แสดง
        <input
          className="mt-1.5 h-11 w-full rounded-xl border border-cyan-900/20 bg-sky-100/78 px-3 text-slate-800 outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-300/50"
          type="text"
          autoComplete="name"
          minLength={2}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className="block text-sm text-slate-700">
        อีเมล
        <input
          className="mt-1.5 h-11 w-full rounded-xl border border-cyan-900/20 bg-sky-100/78 px-3 text-slate-800 outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-300/50"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="block text-sm text-slate-700">
        รหัสผ่าน (อย่างน้อย 8 ตัว)
        <input
          className="mt-1.5 h-11 w-full rounded-xl border border-cyan-900/20 bg-sky-100/78 px-3 text-slate-800 outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-300/50"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <button className="button primary w-full" type="submit" disabled={loading}>
        {loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
      </button>

      <p className="text-sm text-slate-700">
        มีบัญชีแล้ว?{" "}
        <a className="text-cyan-700 hover:text-cyan-700" href="/login">
          เข้าสู่ระบบ
        </a>
      </p>
    </form>
  );
}





