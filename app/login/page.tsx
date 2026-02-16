import LoginForm from "./LoginForm";
import { getCurrentUser } from "../../lib/auth/server";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: { next?: string; pending?: string } | Promise<{ next?: string; pending?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  const params = searchParams ? await searchParams : undefined;
  const rawNext = params?.next;
  const nextPath = rawNext && rawNext.startsWith("/") ? rawNext : "/";
  const notice = params?.pending === "1" ? "สมัครสมาชิกสำเร็จแล้ว กรุณารอ admin อนุมัติก่อนเข้าสู่ระบบ" : "";

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 rounded-3xl border border-cyan-900/20 bg-sky-100/76 p-6 backdrop-blur-md sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-4">
        <h2 className="text-3xl font-semibold text-slate-800">เข้าใช้งาน AURA</h2>
        <p className="max-w-lg text-sm leading-7 text-slate-700">
          ระบบสมาชิกช่วยปกป้องข้อมูลและ workflow ของคุณให้ปลอดภัย พร้อมสิทธิ์การเข้าถึงที่ชัดเจนตามบทบาทผู้ใช้.
        </p>
      </section>
      <section className="flex items-start justify-center lg:justify-end">
        <LoginForm nextPath={nextPath} notice={notice} />
      </section>
    </main>
  );
}





