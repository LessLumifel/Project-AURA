const editingFlow = [
  {
    title: "1) หาไฟล์ให้ถูกก่อน",
    detail: "เปิดโฟลเดอร์ `content/docs` แล้วเลือกไฟล์ `.md` ที่ต้องแก้"
  },
  {
    title: "2) แก้เฉพาะเนื้อหา",
    detail: "อย่าลบส่วนหัว `--- ... ---` ถ้าไม่จำเป็น เพราะเป็นข้อมูลที่ระบบใช้"
  },
  {
    title: "3) บันทึกแล้วเช็กหน้าพรีวิว",
    detail: "ดูหัวข้อ, ลิงก์, รูป, ตาราง ว่ายังแสดงปกติ"
  },
  {
    title: "4) ใช้ checklist ก่อนส่งงาน",
    detail: "เช็กคำผิด, หัวข้อซ้ำ, ลิงก์เสีย, และความสม่ำเสมอของรูปแบบ"
  }
];

const markdownCheats = [
  { use: "หัวข้อใหญ่", input: "# หัวข้อ", output: "หัวข้อระดับ 1" },
  { use: "หัวข้อย่อย", input: "## หัวข้อย่อย", output: "หัวข้อระดับ 2" },
  { use: "ตัวหนา", input: "**ข้อความสำคัญ**", output: "เน้นข้อความสำคัญ" },
  { use: "ตัวเอียง", input: "*คำอธิบาย*", output: "ใช้เน้นเบาๆ" },
  { use: "ลิงก์", input: "[เปิดคู่มือ](/guides/fumadocs)", output: "ลิงก์ไปหน้าอื่น" },
  { use: "ลิสต์หัวข้อ", input: "- ข้อที่ 1", output: "รายการแบบ bullet" },
  { use: "ลำดับขั้น", input: "1. ขั้นแรก", output: "รายการแบบมีลำดับ" },
  { use: "รูปภาพ", input: "![คำอธิบายภาพ](/images/how-to.png)", output: "แทรกรูปในเอกสาร" },
  { use: "โค้ดสั้น", input: "`npm run dev`", output: "แสดงคำสั่งสั้นในบรรทัด" },
  { use: "โค้ดยาว", input: "```bash\\nnpm run dev\\n```", output: "แสดงโค้ดหลายบรรทัด" },
  { use: "ตาราง", input: "| คอลัมน์ | ค่า |", output: "แสดงข้อมูลเป็นตาราง" },
  { use: "อ้างอิง", input: "> หมายเหตุสำคัญ", output: "กล่อง quote/notice" }
];

const commonMistakes = [
  {
    bad: "ลืมเว้นบรรทัดก่อนหัวข้อใหม่",
    good: "เว้น 1 บรรทัดก่อนเขียน `## หัวข้อถัดไป`"
  },
  {
    bad: "ลิงก์เป็นข้อความธรรมดา เช่น /docs/setup",
    good: "เขียนเป็น `[วิธีตั้งค่า](/docs/setup)` เสมอ"
  },
  {
    bad: "รูปใหญ่เกินและไม่มีคำอธิบาย",
    good: "ใช้ `![ภาพขั้นตอนสมัครสมาชิก](/images/signup.png)`"
  },
  {
    bad: "ใช้หัวข้อข้ามระดับ (`#` ไป `###` ทันที)",
    good: "ไล่ระดับหัวข้อทีละชั้นเพื่ออ่านง่าย"
  }
];

const publishChecklist = [
  "ชื่อหน้า (title) ตรงกับเนื้อหา",
  "หัวข้อไม่ซ้ำกัน และเรียงลำดับถูกต้อง",
  "ลิงก์ทุกตัวกดได้จริง",
  "รูปทุกภาพโหลดได้ และมี alt text",
  "ตาราง/ลิสต์ไม่พังบนมือถือ",
  "ไม่มีคำสะกดผิดในหัวข้อหลัก",
  "ไม่มีข้อความ placeholder เช่น TODO, xxx, แก้ทีหลัง"
];

const pageTemplate = `---
title: คู่มือการใช้งานระบบ
description: สำหรับพนักงานใหม่และทีมปฏิบัติการ
---

# ภาพรวม

อธิบายว่าเอกสารนี้ช่วยเรื่องอะไร และใครควรอ่าน

## ขั้นตอนใช้งาน

1. เข้าสู่ระบบ
2. ไปที่เมนูที่เกี่ยวข้อง
3. ทำตามขั้นตอนด้านล่าง

## คำถามที่พบบ่อย

### ลืมรหัสผ่านต้องทำอย่างไร

ติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน
`;

const beforeAfter = {
  before: `# วิธีใช้งาน
กดเข้าไปแล้วทำตามขั้นตอน
- อย่างแรกให้เช็กข้อมูล
- ต่อไปทำรายการ
ดูเพิ่มที่ /docs/help`,
  after: `# วิธีใช้งานระบบ

เอกสารนี้สรุปขั้นตอนสำหรับเจ้าหน้าที่ใหม่

## ขั้นตอนหลัก

1. เข้าหน้า Dashboard
2. ตรวจสอบข้อมูลก่อนเริ่มรายการ
3. กดบันทึกและตรวจผลลัพธ์

## เอกสารที่เกี่ยวข้อง

- [คู่มือช่วยเหลือ](/docs/help)`
};

export default function FumadocsGuidePage(): React.ReactElement {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-14 pt-6 sm:px-6">
      <section className="rounded-3xl border border-slate-300 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              Fumadocs Usage Manual
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              คู่มือแก้ไฟล์ `.md` ใน Fumadocs สำหรับคนไม่เขียนโค้ด
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700 sm:text-base">
              หน้านี้เน้น “การใช้งานจริง” ตั้งแต่เริ่มแก้เอกสารจนพร้อมส่งงาน โดยไม่สอนติดตั้งระบบ เหมาะสำหรับสอนทีมที่ไม่มีพื้นฐาน coding
            </p>
          </div>
          <a className="button" href="/">
            กลับหน้าแรก
          </a>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-300 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">โฟลว์ทำงาน 4 ขั้น (ใช้ทุกวัน)</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {editingFlow.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-300 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">โครงไฟล์ `.md` ที่ควรรู้</h2>
        <p className="mt-2 text-sm text-slate-700">เอกสารส่วนใหญ่จะมี 2 ส่วน: ส่วนหัว (metadata) และเนื้อหา</p>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-slate-300 bg-slate-50 p-4 text-xs text-slate-800">
          <code>{pageTemplate}</code>
        </pre>
        <p className="mt-3 text-sm text-slate-700">
          ถ้าไม่แน่ใจ อย่าแก้บรรทัดในส่วน `--- ... ---` นอกจาก `title` และ `description`
        </p>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-300 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Markdown Cheat Sheet (ฉบับใช้งานจริง)</h2>
        <div className="mt-4 grid gap-3">
          {markdownCheats.map((item) => (
            <article key={item.use} className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{item.use}</p>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800">
                <code>{item.input}</code>
              </pre>
              <p className="mt-2 text-sm text-slate-700">{item.output}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-300 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">ตัวอย่างแก้เอกสารก่อน-หลัง (สำคัญมาก)</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">ก่อนแก้ (อ่านยาก)</p>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-rose-200 bg-white p-3 text-xs text-slate-800">
              <code>{beforeAfter.before}</code>
            </pre>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">หลังแก้ (อ่านง่าย)</p>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-emerald-200 bg-white p-3 text-xs text-slate-800">
              <code>{beforeAfter.after}</code>
            </pre>
          </article>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-300 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">ข้อผิดพลาดที่เจอบ่อย และวิธีแก้ทันที</h2>
        <div className="mt-4 grid gap-3">
          {commonMistakes.map((item, index) => (
            <article key={index.toString()} className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
              <p className="text-sm text-rose-700">ผิด: {item.bad}</p>
              <p className="mt-2 text-sm text-emerald-700">ถูก: {item.good}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-300 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Checklist ก่อนส่งงาน</h2>
        <div className="mt-4 grid gap-2">
          {publishChecklist.map((item) => (
            <div key={item} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              - {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
