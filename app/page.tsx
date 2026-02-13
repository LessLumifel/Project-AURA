 "use client";

import { FormEvent, useMemo, useState } from "react";

const tools = [
  {
    title: "แปลงไฟล์อัจฉริยะ",
    desc: "แปลงเอกสาร รูปภาพ เสียง วิดีโอ ด้วยโปรไฟล์ที่ตั้งไว้ล่วงหน้า",
    tag: "Core"
  },
  {
    title: "Markdown Studio",
    desc: "เขียน แปลง และส่งออก Markdown เป็น PDF/HTML พร้อมธีม",
    tag: "Core",
    href: "/tools/markdown"
  },
  {
    title: "ตัวรวมลิงก์",
    desc: "รวมลิงก์เครื่องมือที่ใช้ประจำ พร้อมโน้ตประกอบแบบเร็ว",
    tag: "Utility"
  },
  {
    title: "Media Manager",
    desc: "จัดการรูปและเอกสารจาก database: view, update, delete",
    tag: "Utility",
    href: "/tools/media"
  },
  {
    title: "Workflow Planner",
    desc: "ออกแบบลำดับงาน ทำเทมเพลต และแชร์ให้ทีม",
    tag: "Future"
  },
  {
    title: "AI Assist",
    desc: "ผู้ช่วยอัตโนมัติสำหรับงานซ้ำ ๆ พร้อมบันทึกสูตร",
    tag: "Future"
  }
];

const pipeline = [
  {
    title: "เริ่มต้นด้วยเทมเพลต",
    desc: "เลือกเครื่องมือที่ต้องใช้ แล้วสร้างชุดงานใหม่ในไม่กี่คลิก"
  },
  {
    title: "ปรับแต่งโฟลว์",
    desc: "เพิ่มขั้นตอน, สคริปต์, และตัวแปลงเพื่อให้เหมาะกับงานของคุณ"
  },
  {
    title: "ส่งออกและแชร์",
    desc: "บันทึกเป็นชุดงานส่วนตัว หรือแชร์ให้ทีมใช้งานร่วมกัน"
  }
];

export default function HomePage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  const lengthWarning = useMemo(() => {
    if (password.length >= 1 && password.length <= 7) return "ให้ใส่รหัสผ่าน 8 หลัก";
    return "";
  }, [password.length]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === "12345") {
      setUnlocked(true);
      setError("");
      return;
    }

    if (password.length !== 8) {
      setError("ให้ใส่รหัสผ่าน 8 หลัก");
      return;
    }

    setError("รหัสผ่านไม่ถูกต้อง");
  };

  return (
    <main>
      {!unlocked && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(8, 13, 30, 0.78)",
            display: "grid",
            placeItems: "center",
            padding: 16
          }}
        >
          <form
            onSubmit={onSubmit}
            style={{
              width: "min(480px, 100%)",
              background: "rgba(14, 22, 46, 0.96)",
              border: "1px solid rgba(130, 170, 255, 0.35)",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 24px 70px rgba(2, 7, 22, 0.55)",
              color: "var(--ink-0)"
            }}
          >
            <h2 style={{ margin: 0, marginBottom: 8 }}>ยืนยันการเข้าใช้งาน</h2>
            <p style={{ margin: 0, marginBottom: 14, color: "var(--ink-1)" }}>กรุณาใส่รหัสผ่าน 8 ตัว</p>
            <input
              value={password}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 8);
                setPassword(digitsOnly);
                setError("");
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="รหัสผ่าน 8 หลัก"
              autoFocus
              style={{
                width: "100%",
                height: 44,
                borderRadius: 10,
                border: "1px solid rgba(130, 170, 255, 0.45)",
                background: "rgba(255, 255, 255, 0.95)",
                padding: "0 12px",
                fontSize: 16
              }}
            />
            <div style={{ minHeight: 22, marginTop: 8, color: "#ffc2c2", fontSize: 14 }}>
              {error || lengthWarning}
            </div>
            <button className="button primary" type="submit" style={{ marginTop: 8 }}>
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      )}
      <div className="container">
        <nav className="nav">
          <div className="brand">
            <div className="brand-mark">AU</div>
            <div>
              <div>AURA Toolbox</div>
              <small style={{ color: "var(--ink-2)", fontFamily: "DM Mono, monospace" }}>
                one hub, infinite utilities
              </small>
            </div>
          </div>
          <div className="nav-actions">
            <a className="button" href="#tools">
              สำรวจเครื่องมือ
            </a>
            <a className="button primary" href="#start">
              เริ่มต้นใช้งาน
            </a>
          </div>
        </nav>
      </div>

      <section className="container hero">
        <div>
          <h1 className="hero-title">ศูนย์รวมเครื่องมืออเนกประสงค์ที่ออกแบบเพื่อโฟลว์ของคุณ</h1>
          <p className="hero-sub">
            แปลงไฟล์ ทำ Markdown จัดการลิงก์ และเพิ่มเครื่องมือใหม่ได้ตลอดเวลา ทุกอย่างอยู่ในพื้นที่เดียวที่ปรับแต่งได้
            พร้อมโทนสีเย็นสบายตา
          </p>
          <div className="hero-metrics">
            <div className="metric">
              <span>Tool Packs</span>
              <strong>12+</strong>
            </div>
            <div className="metric">
              <span>Active Flows</span>
              <strong>24</strong>
            </div>
            <div className="metric">
              <span>New Ideas</span>
              <strong>Weekly</strong>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <span className="badge">New</span>
          <h2 style={{ marginTop: 0 }}>AURA Command Center</h2>
          <p style={{ color: "var(--ink-1)", lineHeight: 1.6 }}>
            ที่รวมงานทั้งหมดไว้ในแดชบอร์ดเดียว ตั้งแต่แปลงไฟล์จนถึงสร้างเอกสาร พร้อมระบบบันทึกสูตรงานแบบโปร
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span className="button" style={{ fontFamily: "DM Mono, monospace" }}>
              ล่าสุด: Markdown Exporter
            </span>
            <span className="button" style={{ fontFamily: "DM Mono, monospace" }}>
              กำลังพัฒนา: Batch Rename 2.0
            </span>
          </div>
        </div>
      </section>

      <section id="tools" className="container">
        <div className="section-title">เครื่องมือหลักและแผนในอนาคต</div>
        <div className="tool-grid">
          {tools.map((tool) => {
            const available = Boolean(tool.href);
            const Card = (
              <article
                className="tool-card"
                style={{
                  opacity: available ? 1 : 0.72,
                  border: available ? undefined : "1px dashed rgba(148, 163, 184, 0.45)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--ice-2)", textTransform: "uppercase" }}>
                    {tool.tag}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      letterSpacing: "0.02em",
                      color: available ? "#79ffd0" : "var(--ink-2)",
                      border: available ? "1px solid rgba(121, 255, 208, 0.45)" : "1px solid rgba(148, 163, 184, 0.35)",
                      borderRadius: 999,
                      padding: "2px 8px"
                    }}
                  >
                    {available ? "พร้อมใช้งาน" : "เร็วๆ นี้"}
                  </span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
              </article>
            );

            if (!tool.href) return <div key={tool.title}>{Card}</div>;

            return (
              <a key={tool.title} href={tool.href} className="tool-card-link" aria-label={tool.title}>
                {Card}
              </a>
            );
          })}
        </div>
      </section>

      <section id="start" className="container">
        <div className="section-title">ขั้นตอนการใช้งานในอนาคต</div>
        <div className="pipeline">
          {pipeline.map((step) => (
            <div key={step.title} className="pipeline-step">
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="hero-card" style={{ textAlign: "center" }}>
          <h2 style={{ marginTop: 0 }}>พร้อมเพิ่มเครื่องมือใหม่เมื่อไหร่ก็ได้</h2>
          <p style={{ color: "var(--ink-1)", lineHeight: 1.6 }}>
            AURA ถูกออกแบบให้ขยายต่อเนื่องได้ คุณสามารถเพิ่มเครื่องมือใหม่หรือรวม API ภายนอก เพื่อให้เว็บนี้เป็นศูนย์กลางการทำงานของคุณ
          </p>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="button">เพิ่มเครื่องมือใหม่</span>
            <span className="button primary">ดูแผนพัฒนา</span>
          </div>
        </div>
      </section>

      <footer className="container footer">
        © 2026 AURA Toolbox. Crafted for multi-utility workflows.
      </footer>
    </main>
  );
}
