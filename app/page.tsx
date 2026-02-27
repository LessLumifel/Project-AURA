import { getCurrentUser } from "../lib/auth/server";

const tools = [
  {
    title: "Markdown Studio",
    desc: "เขียนและจัดการเอกสารแบบครบ flow พร้อม export",
    href: "/tools/markdown",
    status: "พร้อมใช้งาน",
    accent: "from-sky-500/15 to-blue-500/10"
  },
  {
    title: "Media Manager",
    desc: "ค้นหา แก้ไข และจัดระเบียบไฟล์สื่ออย่างเป็นระบบ",
    href: "/tools/media",
    status: "พร้อมใช้งาน",
    accent: "from-emerald-500/15 to-teal-500/10"
  },
  {
    title: "Pandoc Converter",
    desc: "แปลงไฟล์ Word เป็น Markdown และ sync รูปอัตโนมัติ",
    href: "/tools/pandoc",
    status: "พร้อมใช้งาน",
    accent: "from-amber-500/15 to-orange-500/10"
  },
  {
    title: "Fumadocs Guide",
    desc: "คู่มือทีละขั้นสำหรับเริ่มทำ docs แบบมือใหม่",
    href: "/guides/fumadocs",
    status: "คู่มือ",
    accent: "from-slate-500/15 to-zinc-500/10"
  },
  {
    title: "Workflow Planner",
    desc: "ออกแบบขั้นตอนงานร่วมกันแบบทีม",
    status: "เร็วๆ นี้",
    accent: "from-slate-400/12 to-slate-300/8"
  },
  {
    title: "AI Assist",
    desc: "ช่วยงานซ้ำและสรุปงานอัตโนมัติ",
    status: "เร็วๆ นี้",
    accent: "from-violet-500/12 to-indigo-500/10"
  }
];

const stats = [
  { label: "Active Tools", value: "3", helper: "พร้อมใช้งานทันที" },
  { label: "Primary Workflow", value: "Docs + Media", helper: "โฟกัสงานจริงของทีม" },
  { label: "Update Rhythm", value: "Weekly", helper: "ปรับปรุงต่อเนื่อง" }
];

const timeline = [
  {
    title: "เริ่มงานเร็ว",
    desc: "เลือกเครื่องมือหลักและเริ่มทำงานได้ทันที",
    step: "01"
  },
  {
    title: "ลงมือสร้างงาน",
    desc: "เขียน แปลง และจัดการไฟล์ใน workspace เดียว",
    step: "02"
  },
  {
    title: "ส่งต่อและขยาย",
    desc: "แชร์งานให้ทีม และต่อยอด flow ได้ต่อเนื่อง",
    step: "03"
  }
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
      <nav className="flex items-center justify-between rounded-2xl border border-slate-300/80 bg-white px-4 py-3 sm:px-5">
        <a href="/" className="inline-flex items-center gap-2.5">
          <img src="/icon.svg" alt="AURA Icon" className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-wide text-slate-800 sm:text-base">AURA Toolbox</span>
        </a>
        <div className="flex items-center gap-2">
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

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-slate-300/80 bg-white p-6 sm:p-8">
          <p className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium tracking-wide text-slate-600">
            AURA WORKSPACE
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            Modern tools
            <br />
            สำหรับงานเอกสารและไฟล์
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
            โครงสร้างหน้าออกแบบให้เห็นเส้นทางใช้งานชัดตั้งแต่แรก พร้อมลำดับความสำคัญของข้อมูลที่อ่านง่ายและตัดสินใจได้เร็ว
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a className="button primary" href="/tools/markdown">
              เริ่มใช้เครื่องมือหลัก
            </a>
            <a className="button" href="#timeline">
              ดู workflow
            </a>
          </div>
        </article>

        <aside className="rounded-3xl border border-slate-300/80 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500">Core Stats</h2>
          <div className="mt-3 space-y-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs text-slate-600">{item.helper}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section id="tools" className="mt-6 rounded-3xl border border-slate-300/80 bg-white p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">เครื่องมือ</h2>
          <span className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600">Core + Future</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const available = Boolean(tool.href);
            const content = (
              <article
                className={`group relative h-full rounded-2xl border p-4 transition ${
                  available
                    ? "border-slate-300 bg-white hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm"
                    : "border-dashed border-slate-300 bg-slate-50"
                }`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tool.accent}`} />
                <div className="relative">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-900">{tool.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] ${
                        available
                          ? "border border-emerald-300 bg-emerald-100 text-emerald-800"
                          : "border border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      {tool.status}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-700">{tool.desc}</p>
                </div>
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

      <section id="timeline" className="mt-6 rounded-3xl border border-slate-300/80 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Workflow Timeline</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {timeline.map((item, index) => (
            <article key={item.step} className="relative rounded-2xl border border-slate-300 bg-slate-50 p-4">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-700">
                {item.step}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.desc}</p>
              {index < timeline.length - 1 ? (
                <div className="pointer-events-none absolute -right-2 top-7 hidden h-px w-4 bg-slate-300 md:block" />
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-300/80 bg-white p-6 text-center sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">พร้อมเริ่มใช้งาน</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
          เริ่มจากเครื่องมือหลัก แล้วค่อยขยาย workflow ตามทีมโดยไม่ต้องเปลี่ยนวิธีใช้งานใหม่ทั้งหมด
        </p>
      </section>

      <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-24px)] max-w-xl -translate-x-1/2 rounded-2xl border border-slate-300 bg-white/95 p-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-600 sm:text-sm">เริ่มที่เครื่องมือที่ใช้บ่อยที่สุดของทีม</p>
          <a className="button primary" href="/tools/markdown">
            เริ่มเลย
          </a>
        </div>
      </div>

      <footer className="pb-2 pt-8 text-center text-xs text-slate-500">© 2026 AURA Toolbox</footer>
    </main>
  );
}
