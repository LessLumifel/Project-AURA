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
    title: "ชุดจัดการไฟล์",
    desc: "ย่อ/ขยาย แยก รวม เปลี่ยนชื่อไฟล์แบบเป็นชุด",
    tag: "Utility"
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
  return (
    <main>
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
            const Card = (
              <article key={tool.title} className="tool-card">
                <span style={{ fontSize: "0.75rem", color: "var(--ice-2)", textTransform: "uppercase" }}>
                  {tool.tag}
                </span>
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
              </article>
            );

            if (!tool.href) return Card;

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
