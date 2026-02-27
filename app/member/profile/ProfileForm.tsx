"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  initialName: string;
  email: string;
  role: "member" | "admin";
};

export default function ProfileForm({ initialName, email, role }: ProfileFormProps) {
  const router = useRouter();
  const [savedName, setSavedName] = useState(initialName);
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const payload: { name?: string; password?: string } = {};
    if (name.trim() !== savedName) payload.name = name.trim();
    if (password.trim()) payload.password = password;

    if (!payload.name && !payload.password) {
      setError("ยังไม่มีข้อมูลที่เปลี่ยนแปลง");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/member/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "อัปเดตข้อมูลไม่สำเร็จ");
        return;
      }

      setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
      setPassword("");
      if (data.user?.name) {
        setSavedName(data.user.name);
        setName(data.user.name);
      }
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-2xl space-y-4 rounded-3xl border border-slate-300 bg-white p-6 sm:p-8" onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold text-slate-800">แก้ไขข้อมูลสมาชิก</h2>
      <p className="text-sm text-slate-700">แก้ไขชื่อแสดงผลหรือรีเซ็ตรหัสผ่านของบัญชีนี้</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
          <p className="text-xs text-slate-600">Email</p>
          <p className="mt-2 break-all text-sm text-slate-800">{email}</p>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
          <p className="text-xs text-slate-600">Role</p>
          <p className="mt-2 text-sm text-slate-800">{role}</p>
        </div>
      </div>

      <label className="block text-sm text-slate-700">
        ชื่อที่แสดง
        <input
          className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-800 outline-none ring-0 focus:border-slate-400"
          value={name}
          minLength={2}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>

      <label className="block text-sm text-slate-700">
        รหัสผ่านใหม่ (ไม่กรอก = ไม่เปลี่ยน)
        <input
          className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-800 outline-none ring-0 focus:border-slate-400"
          type="password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-2 flex flex-wrap gap-2">
        <button className="button primary" type="submit" disabled={loading}>
          {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
        <a className="button" href="/member">
          กลับหน้าสมาชิก
        </a>
      </div>
    </form>
  );
}




