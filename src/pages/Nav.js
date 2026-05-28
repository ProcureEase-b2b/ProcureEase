import { navigate } from "../Root";

export default function Nav({ active }) {
  const s = {
    nav: { position:"sticky", top:0, zIndex:100, background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"14px 0", fontFamily:"'Inter',system-ui,sans-serif" },
    inner: { maxWidth:1080, margin:"0 auto", padding:"0 24px", display:"flex", justifyContent:"space-between", alignItems:"center" },
    logo: { fontWeight:800, fontSize:18, color:"#1e293b", cursor:"pointer" },
    links: { display:"flex", alignItems:"center", gap:24 },
    link: { fontSize:14, color:"#64748b", fontWeight:500, cursor:"pointer", background:"none", border:"none", padding:0 },
    linkActive: { fontSize:14, color:"#2563eb", fontWeight:600, cursor:"pointer", background:"none", border:"none", padding:0 },
    btnOutline: { fontSize:14, color:"#2563eb", fontWeight:700, cursor:"pointer", background:"transparent", border:"1.5px solid #2563eb", borderRadius:8, padding:"7px 18px" },
    btnPrimary: { fontSize:14, color:"#fff", fontWeight:700, cursor:"pointer", background:"#2563eb", border:"none", borderRadius:8, padding:"7px 18px" },
  };

  const links = [
    { label:"Features", path:"/features" },
    { label:"Pricing",  path:"/pricing"  },
    { label:"FAQ",      path:"/faq"      },
    { label:"Contact",  path:"/contact"  },
  ];

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        <div style={s.logo} onClick={()=>navigate("/")}>ProcureEase</div>
        <div style={s.links}>
          {links.map(l=>(
            <button key={l.path} style={active===l.path?s.linkActive:s.link} onClick={()=>navigate(l.path)}>{l.label}</button>
          ))}
          <button style={s.btnOutline} onClick={()=>navigate("/signin")}>Sign In</button>
          <button style={s.btnPrimary} onClick={()=>navigate("/signin")}>Start Free</button>
        </div>
      </div>
    </nav>
  );
}
