import { getCurrentUser } from "../lib/auth/server";

const tools = [
  {
    title: "Markdown Studio",
    desc: "เขียน แปลง และส่งออก Markdown เป็น PDF/HTML พร้อมธีม",
    tag: "Core",
    href: "/tools/markdown"
  },
  {
    title: "Media Manager",
    desc: "จัดการไฟล์สื่อจากฐานข้อมูล: ค้นหา แก้ไข และลบ",
    tag: "Utility",
    href: "/tools/media"
  },
  {
    title: "Pandoc Converter",
    desc: "แปลง Word เป็น Markdown พร้อม sync รูปอัตโนมัติ",
    tag: "Core",
    href: "/tools/pandoc"
  },
  {
    title: "Workflow Planner",
    desc: "วาง flow งานและแชร์เทมเพลตให้ทีม",
    tag: "Future"
  },
  {
    title: "AI Assist",
    desc: "ช่วยงานซ้ำและบันทึกสูตรใช้งานต่อ",
    tag: "Future"
  }
];

const roadmap = [
  {
    title: "1) Setup",
    desc: "เลือกเครื่องมือและเริ่มโปรเจกต์ภายในไม่กี่คลิก"
  },
  {
    title: "2) Build",
    desc: "ทำงานกับเอกสาร ไฟล์ และ media ภายใน workflow เดียว"
  },
  {
    title: "3) Share",
    desc: "จัดเก็บงานและส่งต่อให้ทีมได้ทันที"
  }
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
      <nav className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-900/20 bg-sky-100/76 px-4 py-3 backdrop-blur-md sm:px-5">
        <a href="/" className="inline-flex items-center gap-3 rounded-xl border border-cyan-900/20 bg-sky-100/70 px-3 py-2">
          <img src="/icon.svg" alt="AURA Icon" className="h-8 w-8" />
          <span className="text-base font-semibold tracking-wide text-cyan-900">AURA Toolbox</span>
        </a>
        <div className="flex flex-wrap items-center gap-2">
          <a className="button" href="#tools">
            สำรวจเครื่องมือ
          </a>
          {user ? (
            <a className="button primary" href="/member">
              พื้นที่สมาชิก
            </a>
          ) : (
            <>
              <a className="button" href="/login">
                เข้าสู่ระบบ
              </a>
              <a className="button primary" href="/register">
                สมัครสมาชิก
              </a>
            </>
          )}
        </div>
      </nav>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.95fr]">
        <article className="rounded-3xl border border-cyan-900/20 bg-sky-100/64 p-6 shadow-2xl shadow-sky-900/10 backdrop-blur-md sm:p-8">
          <p className="mb-3 inline-flex rounded-full border border-cyan-400/50 bg-cyan-100/80 px-3 py-1 text-xs font-medium tracking-wide text-cyan-700">
            AURA Toolbox
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-slate-800 sm:text-5xl">
            ศูนย์รวมเครื่องมือที่ออกแบบมาเพื่อ workflow จริงของทีม
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
            รวมการเขียนเอกสาร แปลงไฟล์ และจัดการสื่อไว้ในระบบเดียว ใช้ง่าย โทนสบายตา และพร้อมขยายต่อในระดับ production.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 px-4 py-3">
              <p className="text-xs text-slate-600">Tool Packs</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">12+</p>
            </div>
            <div className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 px-4 py-3">
              <p className="text-xs text-slate-600">Active Flows</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">24</p>
            </div>
            <div className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 px-4 py-3">
              <p className="text-xs text-slate-600">Update Cycle</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">Weekly</p>
            </div>
          </div>
        </article>

        <aside className="rounded-3xl border border-cyan-900/20 bg-gradient-to-br from-sky-100/84 to-cyan-100/72 p-6 shadow-2xl shadow-indigo-900/20 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-800">Command Center</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            dashboard กลางสำหรับทีม: ค้นหาเครื่องมือเร็ว, เข้า workflow ที่ใช้บ่อย และตามสถานะงานได้ทันที.
          </p>
          <div className="mt-5 space-y-2 text-sm text-slate-700">
            <p className="rounded-xl border border-cyan-900/20 bg-sky-100/66 px-3 py-2">ล่าสุด: Markdown Exporter</p>
            <p className="rounded-xl border border-cyan-900/20 bg-sky-100/66 px-3 py-2">กำลังพัฒนา: Batch Rename 2.0</p>
          </div>
        </aside>
      </section>

      <section id="tools" className="rounded-3xl border border-cyan-900/20 bg-sky-100/64 p-6 backdrop-blur-md sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">เครื่องมือหลักและแผนถัดไป</h2>
          <span className="rounded-full border border-cyan-900/20 px-3 py-1 text-xs text-slate-700">modular stack</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const available = Boolean(tool.href);
            const content = (
              <article
                className={`h-full rounded-2xl border p-4 transition ${
                  available
                    ? "border-cyan-400/40 bg-sky-100/62 shadow-sm shadow-cyan-900/10 hover:border-cyan-500/70 hover:bg-sky-100/74"
                    : "border-dashed border-cyan-900/20 bg-sky-100/76"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-wide text-slate-600">{tool.tag}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] ${
                      available
                        ? "border border-teal-500 bg-teal-200 text-teal-900 font-semibold shadow-sm"
                        : "border border-cyan-900/20 bg-sky-100/76 text-slate-700"
                    }`}
                  >
                    {available ? "● พร้อมใช้งาน" : "เร็วๆ นี้"}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-800">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{tool.desc}</p>
              </article>
            );

            return available && tool.href ? (
              <a key={tool.title} href={tool.href} aria-label={tool.title}>
                {content}
              </a>
            ) : (
              <div key={tool.title}>{content}</div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-cyan-900/20 bg-sky-100/64 p-6 backdrop-blur-md sm:p-8">
          <h2 className="text-xl font-semibold text-slate-800">Roadmap</h2>
          <div className="mt-4 space-y-3">
            {roadmap.map((item) => (
              <article key={item.title} className="rounded-2xl border border-cyan-900/20 bg-sky-100/62 p-4">
                <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-900/20 bg-gradient-to-br from-sky-100/84 to-cyan-100/72 p-6 text-center backdrop-blur-md sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-800">พร้อมขยายระบบต่อได้ทันที</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-700">
            โครงสร้างถูกวางให้ต่อยอดเครื่องมือใหม่และเชื่อม API ภายนอกได้แบบไม่ต้องรื้อระบบเดิม เหมาะสำหรับทีมที่ต้องการ scale งานจริง.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a className="button" href="/member">
              ไปที่สมาชิก
            </a>
            <a className="button primary" href="/tools/markdown">
              เริ่มใช้เครื่องมือ
            </a>
          </div>
        </div>
      </section>

      <footer className="pb-4 text-center text-xs text-slate-600">© 2026 AURA Toolbox. Designed for focused workflow.</footer>
    </main>
  );
}






