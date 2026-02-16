import { SessionUser } from "../../lib/auth/session";

type MemberShellProps = {
  user: SessionUser;
  active: "home" | "profile" | "manage";
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

function tabClass(active: boolean) {
  return active
    ? "rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
    : "rounded-full border border-cyan-900/20 bg-sky-100/76 px-4 py-2 text-sm text-slate-700 transition hover:border-cyan-900/35";
}

export default function MemberShell({ user, active, title, subtitle, children }: MemberShellProps) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-5">
      <header className="rounded-3xl border border-cyan-900/20 bg-sky-100/64 p-6 backdrop-blur-md sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-700">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-900/20 bg-sky-100/76 px-3 py-1.5 text-xs text-slate-700">{user.name}</span>
            <span className="rounded-full border border-cyan-400/50 bg-cyan-100/80 px-3 py-1.5 text-xs uppercase tracking-wide text-cyan-700">
              {user.role}
            </span>
          </div>
        </div>

        <nav className="mt-5 flex flex-wrap gap-2" aria-label="Member navigation">
          <a className={tabClass(active === "home")} href="/member">
            ภาพรวม
          </a>
          <a className={tabClass(active === "profile")} href="/member/profile">
            ข้อมูลสมาชิก
          </a>
          {user.role === "admin" ? (
            <a className={tabClass(active === "manage")} href="/member/manage">
              จัดการสมาชิก
            </a>
          ) : null}
        </nav>
      </header>

      <section>{children}</section>
    </main>
  );
}





