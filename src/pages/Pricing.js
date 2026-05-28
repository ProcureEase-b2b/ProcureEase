// ─── Pricing.js ───────────────────────────────────────────────────────────────
export function Pricing() {
  const free = [["Suppliers","Up to 3"],["Purchase Orders","Up to 5"],["Inventory Items","Up to 10"],["AI Assistant","3 msg/day"],["RFQ & Bidding","No"],["Analytics","No"],["CSV Export","No"],["Invoice Generation","No"],["Email Support","No"]];
  const pro  = [["Suppliers","Unlimited"],["Purchase Orders","Unlimited"],["Inventory Items","Unlimited"],["AI Assistant","Unlimited"],["RFQ & Bidding","Yes"],["Analytics","Yes"],["CSV Export","Yes"],["Invoice Generation","Yes"],["Priority Support","Yes"]];

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#1e293b"}}>
      <Nav active="/pricing"/>
      <div style={{padding:"64px 0"}}>
        <div style={container}>
          <div style={sectionHeader}>
            <h2 style={h2}>Simple, Honest Pricing</h2>
            <p style={subP}>Start free. Upgrade when your business needs more. Cancel anytime.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:640,margin:"0 auto 40px"}}>
            <div style={{background:"#fff",borderRadius:14,padding:28,border:"1.5px solid #e2e8f0"}}>
              <div style={{fontWeight:800,fontSize:19,marginBottom:4}}>Free</div>
              <div style={{fontWeight:800,fontSize:36,marginBottom:4}}>$0<span style={{fontSize:14,fontWeight:400,color:"#94a3b8"}}>/mo</span></div>
              <div style={{fontSize:13,color:"#94a3b8",marginBottom:20}}>Perfect for getting started</div>
              <ul style={{listStyle:"none",marginBottom:24}}>
                {free.map(([f,v])=><li key={f} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f1f5f9",fontSize:13}}><span style={{color:"#64748b"}}>{f}</span><span style={{fontWeight:600,color:v==="No"?"#cbd5e1":"#1e293b"}}>{v}</span></li>)}
              </ul>
              <button onClick={()=>navigate("/signin")} style={{width:"100%",padding:11,background:"transparent",color:"#2563eb",border:"1.5px solid #2563eb",borderRadius:8,fontWeight:700,fontSize:14,cursor:"pointer"}}>Start Free</button>
            </div>
            <div style={{background:"#fff",borderRadius:14,padding:28,border:"2px solid #2563eb",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:14,right:-24,background:"#2563eb",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 36px",transform:"rotate(35deg)"}}>POPULAR</div>
              <div style={{fontWeight:800,fontSize:19,marginBottom:4}}>Pro</div>
              <div style={{fontWeight:800,fontSize:36,marginBottom:4}}>$39<span style={{fontSize:14,fontWeight:400,color:"#94a3b8"}}>/mo</span></div>
              <div style={{fontSize:13,color:"#94a3b8",marginBottom:20}}>For growing businesses</div>
              <ul style={{listStyle:"none",marginBottom:24}}>
                {pro.map(([f,v])=><li key={f} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f1f5f9",fontSize:13}}><span style={{color:"#64748b"}}>{f}</span><span style={{fontWeight:600,color:v==="Yes"?"#16a34a":"#1e293b"}}>{v}</span></li>)}
              </ul>
              <button onClick={()=>navigate("/signin")} style={{width:"100%",padding:11,background:"#2563eb",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:14,cursor:"pointer"}}>Upgrade to Pro — $39/mo</button>
              <div style={{textAlign:"center",fontSize:11,color:"#94a3b8",marginTop:10}}>Secured by Paddle · Cancel anytime</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,maxWidth:720,margin:"0 auto"}}>
            {[["Bank-level Security","All data encrypted at rest and in transit"],["All Cards Accepted","Visa, Mastercard, Amex and local methods"],["Cancel Anytime","No contracts, instant cancellation"],["7-Day Refund","Not satisfied? Full refund guaranteed"]].map(([t,d])=>(
              <div key={t} style={{background:"#f8faff",borderRadius:10,padding:16,border:"1px solid #e2e8f0"}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{t}</div>
                <div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

