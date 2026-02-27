import RegisterForm from "./RegisterForm";
import { getCurrentUser } from "../../lib/auth/server";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 rounded-3xl border border-slate-300 bg-white p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-4">
        <h2 className="text-3xl font-semibold text-slate-800">เริ่มต้นใช้งาน AURA</h2>
        <p className="max-w-lg text-sm leading-7 text-slate-700">
          สมัครบัญชีเพื่อเปิดใช้งานระบบสมาชิกและเข้าถึงเครื่องมือทั้งหมดภายใต้พื้นที่ทำงานเดียว.
        </p>
      </section>
      <section className="flex items-start justify-center lg:justify-end">
        <RegisterForm />
      </section>
    </main>
  );
}





