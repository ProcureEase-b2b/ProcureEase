// ─── Contact.js ───────────────────────────────────────────────────────────────
export function Contact() {
  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#1e293b"}}>
      <Nav active="/contact"/>
      <div style={{padding:"64px 0"}}>
        <div style={container}>
          <div style={{maxWidth:600,margin:"0 auto"}}>
            <div style={{...sectionHeader,marginBottom:32}}>
              <h2 style={h2}>Get in Touch</h2>
              <p style={subP}>We respond to all enquiries within 24 hours on business days.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:32}}>
              {[["Email Support","procureease@outlook.com","For general questions and account help."],["Bug Reports","procureease@outlook.com","Found an issue? Let us know and we will fix it."]].map(([t,e,d])=>(
                <div key={t} style={{background:"#f8faff",borderRadius:12,padding:24,border:"1px solid #e2e8f0"}}>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{t}</div>
                  <a href={`mailto:${e}`} style={{fontSize:14,color:"#2563eb",fontWeight:600,display:"block",marginBottom:8}}>{e}</a>
                  <div style={{fontSize:13,color:"#64748b"}}>{d}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",borderRadius:12,padding:28,border:"1px solid #e2e8f0",marginBottom:24}}>
              <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Send us a message</div>
              <div style={{fontSize:13,color:"#94a3b8",marginBottom:20}}>Fill this out and we will reply to your email within 24 hours.</div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:600,color:"#64748b",marginBottom:5}}>Your Name</div>
                <input style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box"}} placeholder="Your name"/>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:600,color:"#64748b",marginBottom:5}}>Email Address</div>
                <input style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box"}} type="email" placeholder="you@company.com"/>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:600,color:"#64748b",marginBottom:5}}>Subject</div>
                <input style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box"}} placeholder="How can we help?"/>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:600,color:"#64748b",marginBottom:5}}>Message</div>
                <textarea style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box",minHeight:120,resize:"vertical"}} placeholder="Tell us more..."/>
              </div>
              <a href="mailto:procureease@outlook.com" style={{display:"block",width:"100%",padding:11,background:"#2563eb",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:14,cursor:"pointer",textAlign:"center",textDecoration:"none",boxSizing:"border-box"}}>Send Message</a>
              <div style={{fontSize:12,color:"#94a3b8",textAlign:"center",marginTop:10}}>Clicking this opens your email app with our address pre-filled.</div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default Features;
