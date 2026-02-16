import { requireCurrentUser } from "../../lib/auth/server";
import LogoutAction from "../components/LogoutAction";
import MemberShell from "./MemberShell";

export default async function MemberPage() {
  const user = await requireCurrentUser();

  return (
    <MemberShell user={user} active="home" title="Member Area" subtitle="ภาพรวมบัญชีและทางลัดสำหรับการทำงาน">
      <div className="rounded-3xl border border-cyan-900/20 bg-sky-100/64 p-6 backdrop-blur-md sm:p-8">
        <h2 className="text-xl font-semibold text-slate-800">ยินดีต้อนรับ {user.name}</h2>
        <p className="mt-2 text-sm text-slate-700">ข้อมูลบัญชีปัจจุบัน</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 p-4">
            <p className="text-xs text-slate-600">User ID</p>
            <p className="mt-2 break-all text-sm text-slate-800">{user.id}</p>
          </div>
          <div className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 p-4">
            <p className="text-xs text-slate-600">Email</p>
            <p className="mt-2 break-all text-sm text-slate-800">{user.email}</p>
          </div>
          <div className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 p-4">
            <p className="text-xs text-slate-600">Role</p>
            <p className="mt-2 text-sm text-slate-800">{user.role}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <a className="button" href="/member/profile">
            ข้อมูลสมาชิก
          </a>
          {user.role === "admin" ? (
            <a className="button" href="/member/manage">
              จัดการสมาชิก
            </a>
          ) : null}
          <a className="button primary" href="/tools/markdown">
            ไปที่เครื่องมือ
          </a>
          <LogoutAction className="button" />
        </div>
      </div>
    </MemberShell>
  );
}




