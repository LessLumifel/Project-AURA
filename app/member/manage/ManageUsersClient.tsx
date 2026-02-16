"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type UserRole = "member" | "admin";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

type ManageUsersClientProps = {
  currentUserId: string;
};

type CreateFormState = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  approved: boolean;
};

type EditFormState = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approved: boolean;
  password: string;
};

const emptyCreateForm: CreateFormState = {
  name: "",
  email: "",
  password: "",
  role: "member",
  approved: true
};

export default function ManageUsersClient({ currentUserId }: ManageUsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm);
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState<EditFormState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "โหลดรายชื่อสมาชิกไม่สำเร็จ");
        return;
      }
      setUsers(data.users || []);
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const totals = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    const pending = users.filter((user) => !user.approved).length;
    return { all: users.length, admins, members: users.length - admins, pending };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized) ||
        user.role.includes(normalized) ||
        (user.approved ? "approved" : "pending").includes(normalized)
    );
  }, [query, users]);

  const onCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setCreating(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เพิ่มสมาชิกไม่สำเร็จ");
        return;
      }

      setUsers((prev) => [...prev, data.user]);
      setCreateForm(emptyCreateForm);
      setNotice("เพิ่มสมาชิกเรียบร้อยแล้ว");
      await loadUsers();
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (user: UserItem) => {
    setError("");
    setNotice("");
    setEditing({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      password: ""
    });
  };

  const onSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;

    const original = users.find((item) => item.id === editing.id);
    if (!original) {
      setError("ไม่พบสมาชิก");
      return;
    }

    const payload: Partial<EditFormState> = {};
    if (editing.name.trim() !== original.name) payload.name = editing.name.trim();
    if (editing.email.trim().toLowerCase() !== original.email.toLowerCase()) payload.email = editing.email.trim();
    if (editing.role !== original.role) payload.role = editing.role;
    if (editing.approved !== original.approved) payload.approved = editing.approved;
    if (editing.password.trim()) payload.password = editing.password;

    if (Object.keys(payload).length === 0) {
      setError("ยังไม่มีข้อมูลที่เปลี่ยนแปลง");
      return;
    }

    setSavingEdit(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "อัปเดตสมาชิกไม่สำเร็จ");
        return;
      }

      setUsers((prev) => prev.map((item) => (item.id === editing.id ? data.user : item)));
      setEditing(null);
      setNotice("อัปเดตสมาชิกเรียบร้อยแล้ว");
      await loadUsers();
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setSavingEdit(false);
    }
  };

  const onDeleteUser = async (user: UserItem) => {
    if (user.id === currentUserId) return;

    const ok = window.confirm(`ยืนยันลบสมาชิก ${user.email} ?`);
    if (!ok) return;

    setBusyUserId(user.id);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ลบสมาชิกไม่สำเร็จ");
        return;
      }

      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setNotice("ลบสมาชิกเรียบร้อยแล้ว");
      await loadUsers();
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setBusyUserId(null);
    }
  };

  const onQuickApprove = async (user: UserItem) => {
    setBusyUserId(user.id);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "อนุมัติสมาชิกไม่สำเร็จ");
        return;
      }

      setUsers((prev) => prev.map((item) => (item.id === user.id ? data.user : item)));
      setNotice(`อนุมัติ ${user.email} เรียบร้อยแล้ว`);
      await loadUsers();
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-cyan-900/20 bg-sky-100/62 p-6 backdrop-blur-md sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">จัดการสมาชิก</h2>
        <p className="mt-2 text-sm text-slate-700">admin สามารถเพิ่ม แก้ไข ลบ และรีเซ็ตรหัสผ่านสมาชิกได้จากหน้านี้</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 p-4">
          <p className="text-xs text-slate-600">สมาชิกทั้งหมด</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{totals.all}</p>
        </div>
        <div className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 p-4">
          <p className="text-xs text-slate-600">Admin</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{totals.admins}</p>
        </div>
        <div className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 p-4">
          <p className="text-xs text-slate-600">Member</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{totals.members}</p>
        </div>
        <div className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 p-4 sm:col-span-3">
          <p className="text-xs text-slate-600">รออนุมัติ</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{totals.pending}</p>
        </div>
      </div>

      <form onSubmit={onCreateUser} className="grid gap-3 rounded-2xl border border-cyan-900/20 bg-sky-100/60 p-4 sm:grid-cols-2">
        <h3 className="sm:col-span-2 text-sm font-semibold text-slate-800">เพิ่มสมาชิกใหม่</h3>
        <label className="block text-sm text-slate-700">
          ชื่อ
          <input
            className="mt-1.5 h-10 w-full rounded-xl border border-cyan-900/20 bg-sky-100/72 px-3 text-slate-800 outline-none focus:border-cyan-300/60"
            required
            minLength={2}
            value={createForm.name}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>
        <label className="block text-sm text-slate-700">
          อีเมล
          <input
            className="mt-1.5 h-10 w-full rounded-xl border border-cyan-900/20 bg-sky-100/72 px-3 text-slate-800 outline-none focus:border-cyan-300/60"
            type="email"
            required
            value={createForm.email}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>
        <label className="block text-sm text-slate-700">
          รหัสผ่าน
          <input
            className="mt-1.5 h-10 w-full rounded-xl border border-cyan-900/20 bg-sky-100/72 px-3 text-slate-800 outline-none focus:border-cyan-300/60"
            type="password"
            minLength={8}
            required
            value={createForm.password}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>
        <label className="block text-sm text-slate-700">
          Role
          <select
            className="mt-1.5 h-10 w-full rounded-xl border border-cyan-900/20 bg-sky-100/72 px-3 text-slate-800 outline-none focus:border-cyan-300/60"
            value={createForm.role}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
          >
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-cyan-900/20 bg-sky-100/72 accent-cyan-600"
            checked={createForm.approved}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, approved: event.target.checked }))}
          />
          อนุมัติบัญชีทันที
        </label>
        <div className="sm:col-span-2">
          <button className="button primary" type="submit" disabled={creating}>
            {creating ? "กำลังเพิ่ม..." : "เพิ่มสมาชิก"}
          </button>
        </div>
      </form>

      <label className="block text-sm text-slate-700">
        ค้นหาสมาชิก
        <input
          className="mt-1.5 h-11 w-full max-w-xl rounded-xl border border-cyan-900/20 bg-sky-100/70 px-3 text-slate-800 outline-none focus:border-cyan-300/60"
          placeholder="พิมพ์ชื่อ, อีเมล หรือ role"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}

      {editing ? (
        <form onSubmit={onSaveEdit} className="grid gap-3 rounded-2xl border border-cyan-300/60 bg-cyan-50/80 p-4 sm:grid-cols-2">
          <h3 className="sm:col-span-2 text-sm font-semibold text-cyan-700">แก้ไขสมาชิก</h3>
          <label className="block text-sm text-slate-700">
            ชื่อ
            <input
              className="mt-1.5 h-10 w-full rounded-xl border border-cyan-900/20 bg-sky-100/72 px-3 text-slate-800 outline-none focus:border-cyan-300/60"
              minLength={2}
              required
              value={editing.name}
              onChange={(event) => setEditing((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
            />
          </label>
          <label className="block text-sm text-slate-700">
            อีเมล
            <input
              className="mt-1.5 h-10 w-full rounded-xl border border-cyan-900/20 bg-sky-100/72 px-3 text-slate-800 outline-none focus:border-cyan-300/60"
              type="email"
              required
              value={editing.email}
              onChange={(event) => setEditing((prev) => (prev ? { ...prev, email: event.target.value } : prev))}
            />
          </label>
          <label className="block text-sm text-slate-700">
            Role
            <select
              className="mt-1.5 h-10 w-full rounded-xl border border-cyan-900/20 bg-sky-100/72 px-3 text-slate-800 outline-none focus:border-cyan-300/60"
              value={editing.role}
              onChange={(event) => setEditing((prev) => (prev ? { ...prev, role: event.target.value as UserRole } : prev))}
              disabled={editing.id === currentUserId}
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label className="block text-sm text-slate-700">
            สถานะบัญชี
            <select
              className="mt-1.5 h-10 w-full rounded-xl border border-cyan-900/20 bg-sky-100/72 px-3 text-slate-800 outline-none focus:border-cyan-300/60"
              value={editing.approved ? "approved" : "pending"}
              onChange={(event) =>
                setEditing((prev) => (prev ? { ...prev, approved: event.target.value === "approved" } : prev))
              }
            >
              <option value="approved">approved</option>
              <option value="pending">pending approval</option>
            </select>
          </label>
          <label className="block text-sm text-slate-700">
            รหัสผ่านใหม่ (ไม่กรอก = ไม่เปลี่ยน)
            <input
              className="mt-1.5 h-10 w-full rounded-xl border border-cyan-900/20 bg-sky-100/72 px-3 text-slate-800 outline-none focus:border-cyan-300/60"
              type="password"
              minLength={8}
              value={editing.password}
              onChange={(event) => setEditing((prev) => (prev ? { ...prev, password: event.target.value } : prev))}
            />
          </label>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button className="button primary" type="submit" disabled={savingEdit}>
              {savingEdit ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
            <button className="button" type="button" onClick={() => setEditing(null)}>
              ยกเลิก
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-700">กำลังโหลดข้อมูล...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cyan-900/20">
          <table className="min-w-full text-sm">
            <thead className="bg-sky-100/66 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ชื่อ</th>
                <th className="px-4 py-3 text-left font-medium">อีเมล</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                <th className="px-4 py-3 text-left font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/60 bg-sky-100/768">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-slate-800/70">
                    ไม่พบสมาชิกตามคำค้นหา
                  </td>
                </tr>
              ) : null}
              {filteredUsers.map((user) => (
                <tr key={user.id} className="text-slate-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{user.name}</span>
                      {user.id === currentUserId ? (
                        <span className="rounded-full border border-cyan-400/50 bg-cyan-100/80 px-2 py-0.5 text-[11px] text-cyan-700">
                          คุณ
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">
                    {user.approved ? (
                      <span className="rounded-full border border-emerald-300/70 bg-emerald-100/80 px-2 py-0.5 text-[11px] text-emerald-700">
                        approved
                      </span>
                    ) : (
                      <span className="rounded-full border border-amber-300/70 bg-amber-100/80 px-2 py-0.5 text-[11px] text-amber-700">
                        pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!user.approved ? (
                        <button
                          className="button primary"
                          type="button"
                          onClick={() => void onQuickApprove(user)}
                          disabled={busyUserId === user.id}
                        >
                          อนุมัติ
                        </button>
                      ) : null}
                      <button className="button" type="button" onClick={() => openEdit(user)}>
                        แก้ไข
                      </button>
                      <button
                        className="button"
                        type="button"
                        onClick={() => void onDeleteUser(user)}
                        disabled={busyUserId === user.id || user.id === currentUserId}
                      >
                        {busyUserId === user.id ? "กำลังลบ..." : "ลบ"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button className="button" type="button" onClick={() => void loadUsers()}>
          รีโหลด
        </button>
        <a className="button" href="/member">
          กลับหน้าสมาชิก
        </a>
      </div>
    </section>
  );
}


