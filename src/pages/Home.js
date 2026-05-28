import Nav from "./Nav";
import Footer from "./Footer";
import { navigate } from "../Root";

export default function Home() {
  const s = {
    page: { fontFamily:"'Inter',system-ui,sans-serif", color:"#1e293b" },
    hero: { padding:"80px 0 64px", textAlign:"center", background:"linear-gradient(180deg,#f8faff 0%,#fff 100%)" },
    container: { maxWidth:1080, margin:"0 auto", padding:"0 24px" },
    badge: { display:"inline-block", background:"#dbeafe", color:"#1d4ed8", borderRadius:20, padding:"5px 16px", fontSize:13, fontWeight:600, marginBottom:20 },
    h1: { fontSize:48, fontWeight:800, lineHeight:1.15, color:"#0f172a", marginBottom:18, letterSpacing:"-1px" },
    h1span: { color:"#2563eb" },
    heroP: { fontSize:18, color:"#64748b", maxWidth:560, margin:"0 auto 36px", lineHeight:1.7 },
    actions: { display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" },
    btnPrimary: { background:"#2563eb", color:"#fff", border:"none", borderRadius:8, padding:"13px 32px", fontWeight:700, fontSize:15, cursor:"pointer" },
    btnOutline: { background:"transparent", color:"#2563eb", border:"1.5px solid #2563eb", borderRadius:8, padding:"13px 32px", fontWeight:700, fontSize:15, cursor:"pointer" },
    trust: { marginTop:32, display:"flex", gap:24, justifyContent:"center", flexWrap:"wrap" },
    trustItem: { fontSize:13, color:"#94a3b8", fontWeight:500 },
    proofBar: { padding:"18px 0", borderTop:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9", background:"#fafafa" },
    proofInner: { display:"flex", gap:40, justifyContent:"center", flexWrap:"wrap" },
    proofItem: { fontSize:13, color:"#94a3b8", fontWeight:600 },
    section: { padding:"64px 0" },
    sectionAlt: { padding:"64px 0", background:"#f8faff" },
    sectionHeader: { textAlign:"center", marginBottom:48 },
    h2: { fontSize:32, fontWeight:800, color:"#0f172a", marginBottom:10, letterSpacing:"-0.5px" },
    sectionP: { fontSize:16, color:"#64748b", maxWidth:480, margin:"0 auto" },
    statsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:24 },
    statCard: { textAlign:"center", padding:"28px 20px", background:"#f8faff", borderRadius:12 },
    statNum: { fontSize:36, fontWeight:800, color:"#2563eb", marginBottom:6 },
    statLbl: { fontSize:14, color:"#64748b" },
    featGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 },
    featCard: { background:"#fff", borderRadius:12, padding:24, border:"1px solid #e2e8f0" },
    featIcon: { width:40, height:40, borderRadius:10, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 },
    featH3: { fontSize:15, fontWeight:700, color:"#1e293b", marginBottom:8 },
    featP: { fontSize:14, color:"#64748b", lineHeight:1.6 },
    proBadge: { display:"inline-block", background:"#dbeafe", color:"#1d4ed8", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, marginLeft:7, verticalAlign:"middle" },
    steps: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:24 },
    step: { textAlign:"center", padding:"0 12px" },
    stepNum: { width:48, height:48, borderRadius:"50%", background:"#2563eb", color:"#fff", fontSize:20, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" },
    stepH3: { fontSize:15, fontWeight:700, color:"#1e293b", marginBottom:8 },
    stepP: { fontSize:14, color:"#64748b", lineHeight:1.6 },
    testiGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 },
    testi: { background:"#f8faff", borderRadius:12, padding:24, border:"1px solid #e2e8f0" },
    testiText: { fontSize:14, color:"#475569", lineHeight:1.7, marginBottom:16, fontStyle:"italic" },
    testiAuthor: { display:"flex", alignItems:"center", gap:12 },
    avatar: { width:40, height:40, borderRadius:"50%", background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, color:"#2563eb", flexShrink:0 },
    authorName: { fontSize:14, fontWeight:700, color:"#1e293b" },
    authorRole: { fontSize:12, color:"#94a3b8" },
    cta: { padding:"80px 0", background:"#0f172a", textAlign:"center" },
    ctaH2: { fontSize:34, fontWeight:800, color:"#fff", marginBottom:12, letterSpacing:"-0.5px" },
    ctaP: { fontSize:16, color:"#94a3b8", marginBottom:32 },
    btnWhite: { background:"#fff", color:"#1e293b", border:"none", borderRadius:8, padding:"13px 32px", fontWeight:700, fontSize:15, cursor:"pointer" },
    btnGhost: { background:"transparent", color:"#94a3b8", border:"1.5px solid #334155", borderRadius:8, padding:"13px 32px", fontWeight:600, fontSize:15, cursor:"pointer" },
  };

  const features = [
    { icon:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10", title:"Supplier Management", desc:"Store all your supplier contacts, ratings, and performance history in one place.", pro:false },
    { icon:"M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0120 9.414V19a2 2 0 01-2 2z", title:"Purchase Orders", desc:"Create and track purchase orders through every stage — draft to delivered.", pro:false },
    { icon:"M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8v4h8V3z", title:"Inventory Tracking", desc:"Monitor stock levels in real time. Get automatic alerts at reorder points.", pro:false },
    { icon:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", title:"RFQ & Price Comparison", desc:"Request quotes from multiple suppliers and compare prices side by side.", pro:true },
    { icon:"M18 20V10 M12 20V4 M6 20v-6", title:"Analytics & Reports", desc:"Understand your spending and make smarter purchasing decisions with real data.", pro:true },
    { icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", title:"AI Procurement Assistant", desc:"Ask your data questions in plain language. Get instant answers about your business.", pro:false },
  ];

  return (
    <div style={s.page}>
      <Nav active="/"/>

      <section style={s.hero}>
        <div style={s.container}>
          <div style={s.badge}>Trusted by 500+ businesses worldwide</div>
          <h1 style={s.h1}>Procurement made simple<br/>for <span style={s.h1span}>growing businesses</span></h1>
          <p style={s.heroP}>Manage suppliers, purchase orders, inventory and get AI-powered insights — all in one place. No enterprise complexity, no enterprise price.</p>
          <div style={s.actions}>
            <button style={s.btnPrimary} onClick={()=>navigate("/signin")}>Start for Free</button>
            <button style={s.btnOutline} onClick={()=>navigate("/features")}>See Features</button>
          </div>
          <div style={s.trust}>
            {["No credit card required","Free plan available","Cancel anytime","SSL secured"].map(t=>(
              <span key={t} style={s.trustItem}>✓ {t}</span>
            ))}
          </div>
        </div>
      </section>

      <div style={s.proofBar}>
        <div style={s.container}>
          <div style={s.proofInner}>
            {["500+ businesses","$2M+ orders managed","98% satisfaction rate","Used in 40+ countries","Payments by Paddle"].map(t=>(
              <span key={t} style={s.proofItem}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <section style={s.section}>
        <div style={s.container}>
          <div style={s.statsGrid}>
            {[["500+","Businesses using ProcureEase"],["$2M+","Purchase orders managed"],["98%","Customer satisfaction rate"],["40+","Countries served"]].map(([n,l])=>(
              <div key={l} style={s.statCard}><div style={s.statNum}>{n}</div><div style={s.statLbl}>{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section style={s.sectionAlt}>
        <div style={s.container}>
          <div style={s.sectionHeader}>
            <h2 style={s.h2}>Everything your business needs</h2>
            <p style={s.sectionP}>All your procurement tools in one place. No spreadsheets, no confusion.</p>
          </div>
          <div style={s.featGrid}>
            {features.map(f=>(
              <div key={f.title} style={s.featCard}>
                <div style={s.featIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon}/>
                  </svg>
                </div>
                <div style={s.featH3}>{f.title}{f.pro&&<span style={s.proBadge}>Pro</span>}</div>
                <div style={s.featP}>{f.desc}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:28}}>
            <button style={s.btnOutline} onClick={()=>navigate("/features")}>See all features</button>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.container}>
          <div style={s.sectionHeader}>
            <h2 style={s.h2}>Up and running in minutes</h2>
            <p style={s.sectionP}>No setup fees, no IT team, no training required.</p>
          </div>
          <div style={s.steps}>
            {[["1","Create your free account","Sign up in seconds. No credit card needed. Start with the free plan immediately."],["2","Add your suppliers","Add your existing suppliers, contacts, and product catalog in minutes."],["3","Manage everything","Create purchase orders, track inventory, compare prices, and get AI-powered answers."],["4","Grow your business","Save hours every week, reduce costs, and make better supplier decisions."]].map(([n,t,d])=>(
              <div key={n} style={s.step}>
                <div style={s.stepNum}>{n}</div>
                <div style={s.stepH3}>{t}</div>
                <div style={s.stepP}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={s.sectionAlt}>
        <div style={s.container}>
          <div style={s.sectionHeader}>
            <h2 style={s.h2}>Trusted by businesses worldwide</h2>
            <p style={s.sectionP}>What our customers say about ProcureEase.</p>
          </div>
          <div style={s.testiGrid}>
            {[["JM","James M.","Operations Manager, UK","ProcureEase replaced three spreadsheets we were using. Our team saves at least 5 hours a week on procurement tasks."],["SR","Sara R.","Procurement Lead, Canada","The AI assistant is incredible. I ask which supplier has the best delivery rate and it tells me instantly."],["AK","Ahmed K.","Business Owner, UAE","As a small business owner I could never afford SAP or Oracle. ProcureEase gives me the same features at a price that makes sense."]].map(([av,n,r,t])=>(
              <div key={n} style={s.testi}>
                <div style={s.testiText}>"{t}"</div>
                <div style={s.testiAuthor}><div style={s.avatar}>{av}</div><div><div style={s.authorName}>{n}</div><div style={s.authorRole}>{r}</div></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <div style={s.container}>
          <h2 style={s.ctaH2}>Ready to streamline your procurement?</h2>
          <p style={s.ctaP}>Join 500+ businesses already saving time and money with ProcureEase.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button style={s.btnWhite} onClick={()=>navigate("/signin")}>Start for Free — No Card Required</button>
            <button style={s.btnGhost} onClick={()=>navigate("/contact")}>Contact Us</button>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}
