import { navigate } from "../Root";

export default function Footer() {
  const s = {
    footer: { background:"#0f172a", padding:"48px 0 24px", fontFamily:"'Inter',system-ui,sans-serif" },
    inner: { maxWidth:1080, margin:"0 auto", padding:"0 24px" },
    grid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:32, marginBottom:40 },
    brand: { fontWeight:800, fontSize:16, color:"#fff", marginBottom:10 },
    desc: { fontSize:13, color:"#64748b", lineHeight:1.7 },
    email: { fontSize:13, color:"#475569", marginTop:10 },
    colTitle: { fontSize:12, fontWeight:700, color:"#64748b", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.8px" },
    colLink: { display:"block", fontSize:13, color:"#64748b", marginBottom:8, cursor:"pointer", background:"none", border:"none", padding:0, textAlign:"left" },
    bottom: { borderTop:"1px solid #1e293b", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 },
    copy: { fontSize:12, color:"#475569" },
    paddle: { background:"#1e293b", color:"#94a3b8", borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700 },
  };

  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div style={s.grid}>
          <div>
            <div style={s.brand}>ProcureEase</div>
            <div style={s.desc}>B2B procurement made simple for small and medium businesses worldwide.</div>
            <div style={s.email}>procureease@outlook.com</div>
          </div>
          <div>
            <div style={s.colTitle}>Product</div>
            <button style={s.colLink} onClick={()=>navigate("/features")}>Features</button>
            <button style={s.colLink} onClick={()=>navigate("/pricing")}>Pricing</button>
            <button style={s.colLink} onClick={()=>navigate("/app")}>Dashboard</button>
          </div>
          <div>
            <div style={s.colTitle}>Support</div>
            <a style={{...s.colLink, textDecoration:"none"}} href="mailto:procureease@outlook.com">Contact Us</a>
            <button style={s.colLink} onClick={()=>navigate("/faq")}>FAQ</button>
            <a style={{...s.colLink, textDecoration:"none"}} href="mailto:procureease@outlook.com">Report a Bug</a>
          </div>
          <div>
            <div style={s.colTitle}>Legal</div>
            <button style={s.colLink} onClick={()=>navigate("/app")}>Privacy Policy</button>
            <button style={s.colLink} onClick={()=>navigate("/app")}>Terms of Service</button>
            <button style={s.colLink} onClick={()=>navigate("/app")}>GDPR Compliance</button>
          </div>
        </div>
        <div style={s.bottom}>
          <span style={s.copy}>© 2026 ProcureEase. All rights reserved.</span>
          <div style={{display:"flex", gap:12, alignItems:"center"}}>
            <span style={{fontSize:12, color:"#475569"}}>Payments by</span>
            <span style={s.paddle}>PADDLE</span>
            <span style={{fontSize:12, color:"#475569"}}>SSL Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
