import { useState, useEffect } from "react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const light = { primary:"#2563eb",success:"#16a34a",warning:"#d97706",danger:"#dc2626",bg:"#f1f5f9",card:"#ffffff",text:"#1e293b",muted:"#64748b",border:"#e2e8f0",navBg:"#ffffff",headerBg:"#1e293b",headerText:"#ffffff",inputBg:"#ffffff" };
const dark  = { primary:"#3b82f6",success:"#22c55e",warning:"#f59e0b",danger:"#ef4444",bg:"#0f172a",card:"#1e293b",text:"#f1f5f9",muted:"#94a3b8",border:"#334155",navBg:"#1e293b",headerBg:"#0f172a",headerText:"#f1f5f9",inputBg:"#0f172a" };
const CURRENCIES = { USD:"$",EUR:"€",GBP:"£",BDT:"৳",INR:"₹",JPY:"¥",AED:"د.إ" };

// ─── Config — change price here and it updates everywhere ─────────────────────
const PRO_MONTHLY = 39;
const PRO_LABEL = `$${PRO_MONTHLY}/mo`;
const PADDLE_TOKEN = "live_0af9b4d05c79ed2d89b5a366047";
const PADDLE_PRICE_ID = "pri_01ksh7n4mjee9rk6m0fwm7j2k1";
const AI_URL = process.env.REACT_APP_AI_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = process.env.REACT_APP_GROQ_KEY || "";
const FREE_LIMITS = { suppliers:3, orders:5, inventory:10, aiMessages:3 };

// ─── Empty defaults for real users ───────────────────────────────────────────
const SEED_SUPPLIERS = [];
const SEED_ORDERS = [];
const SEED_RFQS = [];
const SEED_INVENTORY = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0,10);
const isOverdue = o => o.status !== "Delivered" && o.status !== "Draft" && o.due < today;

function usePersist(key, def) {
  const [v, set] = useState(() => { try { const s = localStorage.getItem("pe2_"+key); return s ? JSON.parse(s) : def; } catch { return def; } });
  useEffect(() => { try { localStorage.setItem("pe2_"+key, JSON.stringify(v)); } catch {} }, [v]);
  return [v, set];
}

function exportCSV(rows, name) {
  if (!rows.length) return;
  const k = Object.keys(rows[0]);
  const csv = [k.join(","), ...rows.map(r => k.map(x => `"${String(r[x]||"").replace(/"/g,'""')}"`).join(","))].join("\n");
  const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download = name; a.click();
}

const statusColors = (s, C) => ({
  Active:{bg:"#dcfce7",color:C.success}, Inactive:{bg:"#fee2e2",color:C.danger},
  Delivered:{bg:"#dcfce7",color:C.success}, Approved:{bg:"#dbeafe",color:C.primary},
  Sent:{bg:"#fef9c3",color:C.warning}, Draft:{bg:"#f1f5f9",color:C.muted},
}[s] || {bg:"#f1f5f9",color:C.muted});

// ─── Base components ──────────────────────────────────────────────────────────
const Badge = ({s,C}) => { const c = statusColors(s,C); return <span style={{background:c.bg,color:c.color,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600}}>{s}</span>; };

const Card = ({children,style={},C}) => (
  <div style={{background:C.card,borderRadius:12,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:`1px solid ${C.border}`,...style}}>{children}</div>
);

const Btn = ({children,onClick,color,outline=false,sm=false,style={},C}) => {
  const col = color||C.primary;
  return <button onClick={onClick} style={{background:outline?"transparent":col,color:outline?col:"#fff",border:`1.5px solid ${col}`,borderRadius:7,padding:sm?"4px 10px":"8px 16px",fontWeight:600,fontSize:sm?12:14,cursor:"pointer",...style}}>{children}</button>;
};

const ProBtn = ({onClick,label,C}) => (
  <button onClick={onClick} style={{background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",fontWeight:700,fontSize:14,cursor:"pointer"}}>
    {label || `Upgrade to Pro — ${PRO_LABEL}`}
  </button>
);

const Field = ({label,value,onChange,type="text",placeholder="",C}) => (
  <div style={{marginBottom:12}}>
    {label && <div style={{fontSize:13,fontWeight:600,color:C.muted,marginBottom:4}}>{label}</div>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,boxSizing:"border-box",outline:"none",background:C.inputBg,color:C.text}}/>
  </div>
);

const Dropdown = ({label,value,onChange,options,C}) => (
  <div style={{marginBottom:12}}>
    {label && <div style={{fontSize:13,fontWeight:600,color:C.muted,marginBottom:4}}>{label}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,background:C.inputBg,color:C.text,boxSizing:"border-box"}}>
      {options.map(o=><option key={o}>{o}</option>)}
    </select>
  </div>
);

const Dialog = ({title,onClose,children,C,wide=false}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:C.card,color:C.text,borderRadius:14,padding:28,width:wide?780:480,maxWidth:"95vw",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontWeight:700,fontSize:17}}>{title}</div>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const SearchInput = ({value,onChange,placeholder,C}) => (
  <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Search..."}
    style={{padding:"8px 14px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",background:C.inputBg,color:C.text,width:240}}/>
);

const LimitBanner = ({used,max,label,onUpgrade,C}) => {
  if (used < max) return null;
  return (
    <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:10,padding:"10px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:13,color:"#92400e",fontWeight:600}}>Free limit of {max} {label} reached.</div>
      <button onClick={onUpgrade} style={{background:"#d97706",color:"#fff",border:"none",borderRadius:7,padding:"5px 12px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Upgrade</button>
    </div>
  );
};

const ProGate = ({feature,onUpgrade,C}) => (
  <div style={{borderRadius:12,border:`1px solid ${C.border}`,padding:48,textAlign:"center"}}>
    <div style={{fontWeight:700,fontSize:18,color:C.text,marginBottom:8}}>{feature}</div>
    <div style={{color:C.muted,fontSize:14,maxWidth:340,margin:"0 auto 20px"}}>This feature is available on the Pro plan. Upgrade to unlock {feature}, unlimited records, CSV export, invoices, and priority support.</div>
    <ProBtn onClick={onUpgrade} C={C}/>
    <div style={{fontSize:12,color:C.muted,marginTop:10}}>Secured by Paddle · Cancel anytime · No hidden fees</div>
  </div>
);

// ─── Trust bar ────────────────────────────────────────────────────────────────
const TrustBar = ({C}) => (
  <div style={{display:"flex",gap:24,flexWrap:"wrap",padding:"10px 0",borderBottom:`1px solid ${C.border}`,marginBottom:24}}>
    {["SSL Secured","Paddle Payments","Cancel Anytime","Privacy Protected","99.9% Uptime"].map(l=>(
      <div key={l} style={{fontSize:12,color:C.muted,fontWeight:600}}>✓ {l}</div>
    ))}
  </div>
);

// ─── Legal dialogs ────────────────────────────────────────────────────────────
const PrivacyModal = ({onClose,C}) => (
  <Dialog title="Privacy Policy" onClose={onClose} C={C} wide>
    <p style={{color:C.muted,fontSize:13,marginBottom:16}}>Last updated: May 27, 2026</p>
    {[["1. Information We Collect","ProcureEase collects information you provide directly, including business name, email address, and procurement data such as supplier details, purchase orders, and inventory records."],
      ["2. How We Use Your Information","We use your information to provide and improve ProcureEase services, process payments securely through Paddle, and provide customer support. We never sell your personal data."],
      ["3. Payment Processing","All payments are processed by Paddle. ProcureEase never stores credit card information. Paddle is PCI-DSS compliant."],
              ["4. Your Rights","You may access, correct, or delete your data at any time. Contact procureease@outlook.com."],
      ["5. Contact","procureease@outlook.com"]
    ].map(([h,b])=>(
      <div key={h} style={{marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:4,color:C.text}}>{h}</div>
        <div style={{color:C.muted,fontSize:13,lineHeight:1.7}}>{b}</div>
      </div>
    ))}
  </Dialog>
);

const TermsModal = ({onClose,C}) => (
  <Dialog title="Terms of Service" onClose={onClose} C={C} wide>
    <p style={{color:C.muted,fontSize:13,marginBottom:16}}>Last updated: May 27, 2026</p>
    {[["1. Acceptance","By using ProcureEase, you agree to these Terms. If you do not agree, please do not use our service."],
      ["2. Plans & Pricing",`The Free plan includes limited records. The Pro plan costs ${PRO_LABEL} billed monthly through Paddle.`],
      ["3. Cancellation","You may cancel at any time. Contact procureease@outlook.com within 7 days of a charge for a full refund."],
      ["4. Acceptable Use","You agree not to use ProcureEase for unlawful purposes or to attempt unauthorized access to our systems."],
      ["5. Contact","procureease@outlook.com"]
    ].map(([h,b])=>(
      <div key={h} style={{marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:4,color:C.text}}>{h}</div>
        <div style={{color:C.muted,fontSize:13,lineHeight:1.7}}>{b}</div>
      </div>
    ))}
  </Dialog>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = ({setLegal,C}) => (
  <div style={{background:C.navBg,borderTop:`1px solid ${C.border}`,padding:"32px 24px",marginTop:48}}>
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:24,marginBottom:28}}>
        <div>
          <div style={{fontWeight:800,fontSize:15,marginBottom:8,color:C.text}}>ProcureEase</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>B2B procurement for small and medium businesses worldwide.</div>
          <div style={{marginTop:10,display:"flex",gap:6}}>
            <span style={{background:"#dcfce7",color:"#15803d",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>SOC2 Ready</span>
            <span style={{background:"#dbeafe",color:"#1d4ed8",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>GDPR</span>
          </div>
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:C.text}}>Product</div>
          {["Features","Pricing","Changelog","Roadmap"].map(l=><div key={l} style={{fontSize:13,color:C.muted,marginBottom:6}}>{l}</div>)}
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:C.text}}>Support</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:6}}>procureease@outlook.com</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:6}}>Documentation</div>
          <div style={{fontSize:13,color:C.muted}}>Report a Bug</div>
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:C.text}}>Legal</div>
          <div onClick={()=>setLegal("privacy")} style={{fontSize:13,color:C.muted,marginBottom:6,cursor:"pointer",textDecoration:"underline"}}>Privacy Policy</div>
          <div onClick={()=>setLegal("terms")} style={{fontSize:13,color:C.muted,marginBottom:6,cursor:"pointer",textDecoration:"underline"}}>Terms of Service</div>
          <div style={{fontSize:13,color:C.muted}}>GDPR Compliance</div>
        </div>
      </div>
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:12,color:C.muted}}>© 2026 ProcureEase. All rights reserved.</div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:12,color:C.muted}}>Payments by</span>
          <span style={{background:"#1a1a2e",color:"#fff",borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:700}}>PADDLE</span>
          <span style={{fontSize:12,color:C.muted}}>SSL Encrypted</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── Notifications panel ──────────────────────────────────────────────────────
const NotifPanel = ({notifs,setNotifs,onClose,C}) => (
  <div style={{position:"fixed",top:56,right:16,width:310,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:"0 8px 28px rgba(0,0,0,0.14)",zIndex:999}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{fontWeight:700,fontSize:14,color:C.text}}>Notifications</div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))} style={{fontSize:12,color:C.primary,background:"none",border:"none",cursor:"pointer"}}>Mark all read</button>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.muted}}>×</button>
      </div>
    </div>
    {notifs.slice(0,8).map(n=>(
      <div key={n.id} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))}
        style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,background:n.read?"transparent":C.bg,cursor:"pointer",display:"flex",gap:10,alignItems:"flex-start"}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:n.read?"transparent":C.primary,marginTop:6,flexShrink:0}}/>
        <div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.5}}>{n.msg}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{n.time}</div>
        </div>
      </div>
    ))}
  </div>
);

// ─── AI Assistant ─────────────────────────────────────────────────────────────
function AIAssistant({suppliers,orders,inventory,rfqs,isPro,onUpgrade,C}) {
  const [msgs,setMsgs] = usePersist("aiMsgs",[{role:"assistant",text:"Hello! I'm your procurement assistant. Ask me anything about your suppliers, orders, inventory, or cost-saving ideas."}]);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [usage,setUsage] = usePersist("aiUsage",{});
  const used = usage[today]||0;
  const canSend = isPro || used < FREE_LIMITS.aiMessages;

  const send = async () => {
    if (!input.trim() || !canSend) return;
    const msg = input.trim(); setInput("");
    setMsgs(m=>[...m,{role:"user",text:msg}]);
    if (!isPro) setUsage(u=>({...u,[today]:(u[today]||0)+1}));
    setLoading(true);
    const sys = `You are a helpful procurement assistant for ProcureEase. Current data:\nSuppliers:${JSON.stringify(suppliers)}\nOrders:${JSON.stringify(orders)}\nInventory:${JSON.stringify(inventory)}\nRFQs:${JSON.stringify(rfqs)}\nBe concise and professional. Use bullet points when listing.`;
    try {
      const res = await fetch(AI_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:sys,messages:[{role:"user",content:msg}]})});
      const data = await res.json();
      setMsgs(m=>[...m,{role:"assistant",text:data.content?.map(b=>b.text||"").join("")||"Unable to process that request."}]);
    } catch {
      setMsgs(m=>[...m,{role:"assistant",text:"Connection error. Please try again."}]);
    }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:380}}>
      {!isPro && (
        <div style={{background:"#fef9c3",border:"1px solid #fcd34d",borderRadius:8,padding:"8px 12px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,color:"#92400e"}}>{used}/{FREE_LIMITS.aiMessages} free messages used today</span>
          <button onClick={onUpgrade} style={{background:"#d97706",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Upgrade for unlimited</button>
        </div>
      )}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:8}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{background:m.role==="user"?C.primary:C.bg,color:m.role==="user"?"#fff":C.text,borderRadius:12,padding:"10px 14px",maxWidth:"80%",fontSize:14,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{color:C.muted,fontSize:13,paddingLeft:4}}>Thinking...</div>}
      </div>
      {!canSend ? (
        <div style={{textAlign:"center",padding:14,background:"#fee2e2",borderRadius:8}}>
          <div style={{color:C.danger,fontSize:13,fontWeight:600,marginBottom:10}}>Daily free limit reached. Upgrade for unlimited messages.</div>
          <ProBtn onClick={onUpgrade} C={C}/>
        </div>
      ) : (
        <div style={{display:"flex",gap:8,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about your procurement data..."
            style={{flex:1,padding:"9px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",background:C.inputBg,color:C.text}}/>
          <Btn onClick={send} C={C}>Send</Btn>
        </div>
      )}
    </div>
  );
}

// ─── Invoice ──────────────────────────────────────────────────────────────────
function InvoiceModal({order,onClose,currency,C}) {
  const sym = CURRENCIES[currency]||"$";
  const tax = (order.amount*0.1).toFixed(2);
  const total = (order.amount*1.1).toFixed(2);
  const print = () => {
    const w = window.open("","_blank");
    w.document.write(`<html><head><title>Invoice ${order.id}</title><style>body{font-family:sans-serif;padding:40px;color:#1e293b}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#f1f5f9;padding:10px;text-align:left}td{padding:10px;border-bottom:1px solid #e2e8f0}</style></head><body><div style="display:flex;justify-content:space-between;margin-bottom:32px"><div><h2 style="color:#2563eb;margin:0">ProcureEase</h2><p style="color:#64748b">procureease.app · support@procureease.app</p></div><div style="text-align:right"><h2>INVOICE</h2><p>${order.id}</p></div></div><hr/><div style="display:flex;justify-content:space-between;margin:20px 0"><div><b>Bill To:</b><br/>${order.supplier}<br/>Date: ${order.date}</div><div style="text-align:right"><b>Due:</b><br/>${order.due}</div></div><table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody><tr><td>${order.items}</td><td>${sym}${order.amount.toLocaleString()}</td></tr><tr><td>Tax (10%)</td><td>${sym}${tax}</td></tr></tbody></table><div style="text-align:right;font-size:18px;font-weight:700;margin-top:16px">Total: ${sym}${total}</div><p style="color:#64748b;font-size:12px;margin-top:40px">Generated by ProcureEase · procureease.app</p></body></html>`);
    w.document.close(); w.print();
  };
  return (
    <Dialog title={`Invoice — ${order.id}`} onClose={onClose} C={C}>
      <div style={{border:`1px solid ${C.border}`,borderRadius:10,padding:20,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
          <div><div style={{fontWeight:800,fontSize:16,color:C.primary}}>ProcureEase</div><div style={{color:C.muted,fontSize:12}}>procureease.app</div></div>
          <div style={{textAlign:"right"}}><div style={{fontWeight:700}}>INVOICE</div><div style={{color:C.muted,fontSize:13}}>{order.id}</div><Badge s={order.status} C={C}/></div>
        </div>
        <hr style={{borderColor:C.border,margin:"12px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between",margin:"12px 0"}}>
          <div><b>Bill To:</b><div>{order.supplier}</div><div style={{color:C.muted,fontSize:13}}>Date: {order.date}</div></div>
          <div style={{textAlign:"right"}}><b>Due Date:</b><div>{order.due}</div></div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
          <thead><tr style={{background:C.bg}}><th style={{padding:8,textAlign:"left"}}>Description</th><th style={{padding:8,textAlign:"right"}}>Amount</th></tr></thead>
          <tbody>
            <tr><td style={{padding:8,borderBottom:`1px solid ${C.border}`}}>{order.items}</td><td style={{padding:8,textAlign:"right",borderBottom:`1px solid ${C.border}`}}>{sym}{order.amount.toLocaleString()}</td></tr>
            <tr><td style={{padding:8,color:C.muted}}>Tax (10%)</td><td style={{padding:8,textAlign:"right",color:C.muted}}>{sym}{tax}</td></tr>
          </tbody>
        </table>
        <div style={{textAlign:"right",fontWeight:800,fontSize:17,marginTop:12,color:C.primary}}>Total: {sym}{total}</div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn outline color={C.muted} onClick={onClose} C={C}>Close</Btn>
        <Btn onClick={print} C={C}>Print / Save PDF</Btn>
      </div>
    </Dialog>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({suppliers,orders,inventory,rfqs,currency,isPro,onUpgrade,C}) {
  const sym = CURRENCIES[currency]||"$";
  const low = inventory.filter(i=>i.qty<=i.reorder);
  const spend = orders.filter(o=>o.status!=="Draft").reduce((s,o)=>s+o.amount,0);
  const overdue = orders.filter(isOverdue);
  const kpis = [
    {label:"Total Suppliers",value:suppliers.length,bg:"#dbeafe"},
    {label:"Active Orders",value:orders.filter(o=>!["Draft","Delivered"].includes(o.status)).length,bg:"#fef9c3"},
    {label:"Total Spend",value:`${sym}${spend.toLocaleString()}`,bg:"#dcfce7"},
    {label:"Low Stock Items",value:low.length,bg:low.length>0?"#fee2e2":"#dcfce7"},
    {label:"Overdue POs",value:overdue.length,bg:overdue.length>0?"#fee2e2":"#dcfce7"},
  ];
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontWeight:800,fontSize:22,color:C.text}}>Dashboard</div>
        {isPro
          ? <span style={{background:C.primary,color:"#fff",borderRadius:6,padding:"4px 14px",fontWeight:700,fontSize:13}}>Pro Plan</span>
          : <ProBtn onClick={onUpgrade} C={C}/>
        }
      </div>
      {!isPro && (
        <div style={{background:"#eff6ff",border:`1px solid #bfdbfe`,borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:C.text}}>You are on the Free Plan</div>
            <div style={{fontSize:13,color:C.muted,marginTop:2}}>Upgrade to Pro for unlimited access to all features.</div>
          </div>
          <ProBtn onClick={onUpgrade} label={`Upgrade Now — ${PRO_LABEL}`} C={C}/>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:22}}>
        {kpis.map(k=>(
          <Card key={k.label} style={{background:k.bg,border:"none"}} C={C}>
            <div style={{fontWeight:800,fontSize:26,color:C.text}}>{k.value}</div>
            <div style={{color:C.muted,fontSize:13,marginTop:4}}>{k.label}</div>
          </Card>
        ))}
      </div>
      {overdue.length>0 && (
        <div style={{background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
          <div style={{fontWeight:700,color:C.danger,marginBottom:4}}>Overdue Purchase Orders</div>
          <div style={{fontSize:13,color:C.danger}}>{overdue.map(o=>`${o.id} (due ${o.due})`).join(" · ")}</div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <Card C={C}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.text}}>Recent Purchase Orders</div>
          {orders.slice(0,4).map(o=>(
            <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontWeight:600,fontSize:14,color:C.text}}>{o.id}{isOverdue(o)&&<span style={{marginLeft:6,fontSize:10,background:"#fee2e2",color:C.danger,borderRadius:4,padding:"1px 5px"}}>OVERDUE</span>}</div>
                <div style={{color:C.muted,fontSize:12}}>{o.supplier}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:700,color:C.text}}>{sym}{o.amount.toLocaleString()}</div>
                <Badge s={o.status} C={C}/>
              </div>
            </div>
          ))}
        </Card>
        <Card C={C}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.text}}>Low Stock Alerts</div>
          {low.length===0
            ? <div style={{color:C.muted,fontSize:14}}>All stock levels are healthy.</div>
            : low.map(i=>(
              <div key={i.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                <div><div style={{fontWeight:600,fontSize:14,color:C.text}}>{i.name}</div><div style={{color:C.muted,fontSize:12}}>Reorder at {i.reorder}</div></div>
                <div style={{fontWeight:700,color:C.danger}}>{i.qty} {i.unit}</div>
              </div>
            ))
          }
        </Card>
      </div>
      <Card C={C}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.text}}>AI Procurement Assistant</div>
        <AIAssistant suppliers={suppliers} orders={orders} inventory={inventory} rfqs={rfqs} isPro={isPro} onUpgrade={onUpgrade} C={C}/>
      </Card>
    </div>
  );
}

// ─── Suppliers ────────────────────────────────────────────────────────────────
function Suppliers({suppliers,setSuppliers,isPro,onUpgrade,C}) {
  const [modal,setModal]=useState(false);
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("All");
  const blank = {name:"",category:"",contact:"",phone:"",country:"",rating:"4.0",status:"Active",notes:""};
  const [form,setForm]=useState(blank);
  const fv=(k,v)=>setForm(p=>({...p,[k]:v}));
  const canAdd = isPro||suppliers.length<FREE_LIMITS.suppliers;
  const save=()=>{ setSuppliers(p=>[...p,{...form,id:Date.now(),rating:parseFloat(form.rating)||4}]); setModal(false); setForm(blank); };
  const cats = ["All",...[...new Set(suppliers.map(s=>s.category))]];
  const list = suppliers.filter(s=>(cat==="All"||s.category===cat)&&(s.name.toLowerCase().includes(search.toLowerCase())||s.category.toLowerCase().includes(search.toLowerCase())));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontWeight:800,fontSize:22,color:C.text}}>Suppliers {!isPro&&<span style={{fontSize:13,color:C.muted,fontWeight:400}}>({suppliers.length}/{FREE_LIMITS.suppliers} free)</span>}</div>
        <div style={{display:"flex",gap:8}}>
          {isPro&&<Btn sm outline color={C.success} onClick={()=>exportCSV(suppliers,"suppliers.csv")} C={C}>Export CSV</Btn>}
          <Btn onClick={()=>canAdd?setModal(true):onUpgrade()} C={C}>+ Add Supplier</Btn>
        </div>
      </div>
      <LimitBanner used={suppliers.length} max={FREE_LIMITS.suppliers} label="suppliers" onUpgrade={onUpgrade} C={C}/>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search suppliers..." C={C}/>
        <select value={cat} onChange={e=>setCat(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,background:C.inputBg,color:C.text}}>
          {cats.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{color:C.muted,fontSize:13,marginBottom:12}}>{list.length} supplier{list.length!==1?"s":""} found</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {list.map(s=>(
          <Card key={s.id} C={C}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontWeight:700,fontSize:15,color:C.text}}>{s.name}</div><Badge s={s.status} C={C}/></div>
            <div style={{color:C.muted,fontSize:13,marginBottom:4}}>{s.category} · {s.country}</div>
            <div style={{fontSize:13,color:C.text,marginBottom:2}}>{s.contact}</div>
            <div style={{fontSize:13,color:C.text,marginBottom:8}}>{s.phone}</div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{fontSize:13,color:C.muted}}>{s.notes}</div>
              <div style={{fontWeight:700,color:C.warning}}>★ {s.rating}</div>
            </div>
          </Card>
        ))}
      </div>
      {modal&&(
        <Dialog title="Add Supplier" onClose={()=>setModal(false)} C={C}>
          <Field label="Company Name" value={form.name} onChange={v=>fv("name",v)} C={C}/>
          <Field label="Category" value={form.category} onChange={v=>fv("category",v)} C={C}/>
          <Field label="Contact Email" value={form.contact} onChange={v=>fv("contact",v)} type="email" C={C}/>
          <Field label="Phone" value={form.phone} onChange={v=>fv("phone",v)} C={C}/>
          <Field label="Country" value={form.country} onChange={v=>fv("country",v)} C={C}/>
          <Field label="Rating (1–5)" value={form.rating} onChange={v=>fv("rating",v)} type="number" C={C}/>
          <Dropdown label="Status" value={form.status} onChange={v=>fv("status",v)} options={["Active","Inactive"]} C={C}/>
          <Field label="Notes" value={form.notes} onChange={v=>fv("notes",v)} C={C}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn outline color={C.muted} onClick={()=>setModal(false)} C={C}>Cancel</Btn>
            <Btn onClick={save} C={C}>Save</Btn>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────
function PurchaseOrders({orders,setOrders,suppliers,currency,isPro,onUpgrade,C}) {
  const sym = CURRENCIES[currency]||"$";
  const [modal,setModal]=useState(false);
  const [invoice,setInvoice]=useState(null);
  const [search,setSearch]=useState("");
  const [sf,setSf]=useState("All");
  const blank = {supplier:suppliers[0]?.name||"",items:"",amount:"",due:"",status:"Draft"};
  const [form,setForm]=useState(blank);
  const fv=(k,v)=>setForm(p=>({...p,[k]:v}));
  const canAdd = isPro||orders.length<FREE_LIMITS.orders;
  const save=()=>{ setOrders(p=>[{...form,id:`PO-${String(p.length+1).padStart(3,"0")}`,date:today,amount:parseFloat(form.amount)||0},...p]); setModal(false); setForm(blank); };
  const advance=id=>{ const fl=["Draft","Sent","Approved","Delivered"]; setOrders(p=>p.map(o=>o.id===id?{...o,status:fl[Math.min(fl.indexOf(o.status)+1,3)]}:o)); };
  const list = orders.filter(o=>(sf==="All"||o.status===sf)&&(o.id.toLowerCase().includes(search.toLowerCase())||o.supplier.toLowerCase().includes(search.toLowerCase())||o.items.toLowerCase().includes(search.toLowerCase())));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontWeight:800,fontSize:22,color:C.text}}>Purchase Orders {!isPro&&<span style={{fontSize:13,color:C.muted,fontWeight:400}}>({orders.length}/{FREE_LIMITS.orders} free)</span>}</div>
        <div style={{display:"flex",gap:8}}>
          {isPro&&<Btn sm outline color={C.success} onClick={()=>exportCSV(orders,"orders.csv")} C={C}>Export CSV</Btn>}
          <Btn onClick={()=>canAdd?setModal(true):onUpgrade()} C={C}>+ New PO</Btn>
        </div>
      </div>
      <LimitBanner used={orders.length} max={FREE_LIMITS.orders} label="purchase orders" onUpgrade={onUpgrade} C={C}/>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search orders..." C={C}/>
        <select value={sf} onChange={e=>setSf(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,background:C.inputBg,color:C.text}}>
          {["All","Draft","Sent","Approved","Delivered"].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
          <thead>
            <tr style={{background:C.bg}}>
              {["PO #","Supplier","Items","Amount","Date","Due","Status","Actions"].map(h=>(
                <th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:C.muted,borderBottom:`2px solid ${C.border}`}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(o=>(
              <tr key={o.id} style={{borderBottom:`1px solid ${C.border}`,background:isOverdue(o)?"#fff5f5":"transparent"}}>
                <td style={{padding:"10px 12px",fontWeight:700,color:C.primary}}>{o.id}{isOverdue(o)&&<span style={{marginLeft:6,fontSize:10,background:"#fee2e2",color:C.danger,borderRadius:4,padding:"1px 5px"}}>OVERDUE</span>}</td>
                <td style={{padding:"10px 12px",color:C.text}}>{o.supplier}</td>
                <td style={{padding:"10px 12px",color:C.muted}}>{o.items}</td>
                <td style={{padding:"10px 12px",fontWeight:700,color:C.text}}>{sym}{o.amount.toLocaleString()}</td>
                <td style={{padding:"10px 12px",color:C.muted}}>{o.date}</td>
                <td style={{padding:"10px 12px",color:isOverdue(o)?C.danger:C.muted,fontWeight:isOverdue(o)?700:400}}>{o.due}</td>
                <td style={{padding:"10px 12px"}}><Badge s={o.status} C={C}/></td>
                <td style={{padding:"10px 12px"}}>
                  <div style={{display:"flex",gap:6}}>
                    {o.status!=="Delivered"&&<Btn sm onClick={()=>advance(o.id)} C={C}>Advance</Btn>}
                    {isPro
                      ? <Btn sm outline color={C.muted} onClick={()=>setInvoice(o)} C={C}>Invoice</Btn>
                      : <Btn sm outline color={C.warning} onClick={onUpgrade} C={C}>Pro</Btn>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal&&(
        <Dialog title="Create Purchase Order" onClose={()=>setModal(false)} C={C}>
          <Dropdown label="Supplier" value={form.supplier} onChange={v=>fv("supplier",v)} options={suppliers.length?suppliers.map(s=>s.name):["No suppliers yet"]} C={C}/>
          <Field label="Items" value={form.items} onChange={v=>fv("items",v)} C={C}/>
          <Field label={`Amount (${sym})`} value={form.amount} onChange={v=>fv("amount",v)} type="number" C={C}/>
          <Field label="Due Date" value={form.due} onChange={v=>fv("due",v)} type="date" C={C}/>
          <Dropdown label="Status" value={form.status} onChange={v=>fv("status",v)} options={["Draft","Sent","Approved"]} C={C}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn outline color={C.muted} onClick={()=>setModal(false)} C={C}>Cancel</Btn>
            <Btn onClick={save} C={C}>Create PO</Btn>
          </div>
        </Dialog>
      )}
      {invoice&&<InvoiceModal order={invoice} onClose={()=>setInvoice(null)} currency={currency} C={C}/>}
    </div>
  );
}

// ─── RFQ & Bidding ────────────────────────────────────────────────────────────
function Bidding({rfqs,setRfqs,suppliers,currency,isPro,onUpgrade,C}) {
  const sym = CURRENCIES[currency]||"$";
  const [modal,setModal]=useState(false);
  const [bidModal,setBidModal]=useState(null);
  const [form,setForm]=useState({item:"",deadline:""});
  const [bid,setBid]=useState({supplier:suppliers[0]?.name||"",price:"",delivery:"",notes:""});
  const fv=(k,v)=>setForm(p=>({...p,[k]:v}));
  const fb=(k,v)=>setBid(p=>({...p,[k]:v}));
  if (!isPro) return (
    <div>
      <div style={{fontWeight:800,fontSize:22,marginBottom:20,color:C.text}}>RFQ & Price Comparison</div>
      <ProGate feature="RFQ & Price Comparison" onUpgrade={onUpgrade} C={C}/>
    </div>
  );
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontWeight:800,fontSize:22,color:C.text}}>RFQ & Price Comparison</div>
        <Btn onClick={()=>setModal(true)} C={C}>+ New RFQ</Btn>
      </div>
      {rfqs.map(r=>(
        <Card key={r.id} style={{marginBottom:14}} C={C}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <div><div style={{fontWeight:700,fontSize:15,color:C.text}}>{r.id}: {r.item}</div><div style={{color:C.muted,fontSize:13}}>Deadline: {r.deadline}</div></div>
            <Btn sm onClick={()=>setBidModal(r.id)} C={C}>+ Add Bid</Btn>
          </div>
          {r.bids.length===0 ? <div style={{color:C.muted,fontSize:14}}>No bids yet.</div> : (
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
              <thead><tr style={{background:C.bg}}>{["Supplier","Price","Delivery","Notes",""].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",fontWeight:700,color:C.muted}}>{h}</th>)}</tr></thead>
              <tbody>
                {r.bids.map((b,i)=>{ const best=Math.min(...r.bids.map(x=>x.price)); return (
                  <tr key={i} style={{background:b.price===best?"#f0fdf4":"transparent",borderTop:`1px solid ${C.border}`}}>
                    <td style={{padding:"8px 10px",fontWeight:600,color:C.text}}>{b.supplier}</td>
                    <td style={{padding:"8px 10px",fontWeight:700,color:b.price===best?C.success:C.text}}>{sym}{b.price.toLocaleString()}</td>
                    <td style={{padding:"8px 10px",color:C.muted}}>{b.delivery}</td>
                    <td style={{padding:"8px 10px",color:C.muted}}>{b.notes}</td>
                    <td style={{padding:"8px 10px"}}>{b.price===best&&<span style={{color:C.success,fontWeight:700,fontSize:13}}>Best price</span>}</td>
                  </tr>
                );})}
              </tbody>
            </table>
          )}
        </Card>
      ))}
      {modal&&(
        <Dialog title="Create RFQ" onClose={()=>setModal(false)} C={C}>
          <Field label="Item Required" value={form.item} onChange={v=>fv("item",v)} C={C}/>
          <Field label="Bid Deadline" value={form.deadline} onChange={v=>fv("deadline",v)} type="date" C={C}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn outline color={C.muted} onClick={()=>setModal(false)} C={C}>Cancel</Btn>
            <Btn onClick={()=>{setRfqs(p=>[...p,{id:`RFQ-${String(p.length+1).padStart(3,"0")}`,...form,bids:[]}]);setModal(false);}} C={C}>Create</Btn>
          </div>
        </Dialog>
      )}
      {bidModal&&(
        <Dialog title="Submit Bid" onClose={()=>setBidModal(null)} C={C}>
          <Dropdown label="Supplier" value={bid.supplier} onChange={v=>fb("supplier",v)} options={suppliers.length?suppliers.map(s=>s.name):["No suppliers"]} C={C}/>
          <Field label={`Price (${sym})`} value={bid.price} onChange={v=>fb("price",v)} type="number" C={C}/>
          <Field label="Delivery Time" value={bid.delivery} onChange={v=>fb("delivery",v)} placeholder="e.g. 7 days" C={C}/>
          <Field label="Notes" value={bid.notes} onChange={v=>fb("notes",v)} C={C}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn outline color={C.muted} onClick={()=>setBidModal(null)} C={C}>Cancel</Btn>
            <Btn onClick={()=>{setRfqs(p=>p.map(r=>r.id===bidModal?{...r,bids:[...r.bids,{...bid,price:parseFloat(bid.price)||0}]}:r));setBidModal(null);}} C={C}>Submit Bid</Btn>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ─── Inventory ────────────────────────────────────────────────────────────────
function Inventory({inventory,setInventory,suppliers,currency,isPro,onUpgrade,C}) {
  const sym = CURRENCIES[currency]||"$";
  const [modal,setModal] = useState(false);
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");
  const blankForm = {name:"",sku:"",qty:"",reorder:"",unit:"pcs",supplier:suppliers[0]?.name||"",cost:""};
  const [form,setForm] = useState(blankForm);
  const fv = (k,v) => setForm(p=>({...p,[k]:v}));
  const canAdd = isPro || inventory.length < FREE_LIMITS.inventory;

  const openModal = () => {
    setForm({...blankForm, supplier: suppliers[0]?.name||""});
    setModal(true);
  };

  const save = () => {
    const item = {
      id: Date.now(),
      name: form.name.trim()||"Unnamed Item",
      sku: form.sku.trim()||"N/A",
      qty: Math.max(0, parseInt(form.qty)||0),
      reorder: Math.max(0, parseInt(form.reorder)||0),
      unit: form.unit.trim()||"pcs",
      supplier: form.supplier||"Unknown",
      cost: Math.max(0, parseFloat(form.cost)||0),
    };
    setInventory(p=>[...p, item]);
    setModal(false);
    setForm(blankForm);
  };

  const adj = (id,d) => setInventory(p=>p.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+d)}:i));

  const list = inventory.filter(i=>{
    const matchSearch = (i.name||"").toLowerCase().includes(search.toLowerCase()) || (i.sku||"").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="All" || (filter==="Low Stock"&&i.qty<=i.reorder) || (filter==="OK"&&i.qty>i.reorder);
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontWeight:800,fontSize:22,color:C.text}}>Inventory {!isPro&&<span style={{fontSize:13,color:C.muted,fontWeight:400}}>({inventory.length}/{FREE_LIMITS.inventory} free)</span>}</div>
        <div style={{display:"flex",gap:8}}>
          {isPro&&<Btn sm outline color={C.success} onClick={()=>exportCSV(inventory,"inventory.csv")} C={C}>Export CSV</Btn>}
          <Btn onClick={()=>canAdd?openModal():onUpgrade()} C={C}>+ Add Item</Btn>
        </div>
      </div>
      <LimitBanner used={inventory.length} max={FREE_LIMITS.inventory} label="inventory items" onUpgrade={onUpgrade} C={C}/>
      <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or SKU..." C={C}/>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:14,background:C.inputBg,color:C.text}}>
          {["All","Low Stock","OK"].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{color:C.muted,fontSize:13,marginBottom:12}}>{list.length} item{list.length!==1?"s":""} · {list.filter(i=>i.qty<=i.reorder).length} low stock</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
        {list.map(i=>{
          const low = i.qty <= i.reorder;
          return (
            <Card key={i.id} style={{borderLeft:`4px solid ${low?C.danger:C.success}`}} C={C}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontWeight:700,color:C.text}}>{i.name}</div>
                {low&&<span style={{background:"#fee2e2",color:C.danger,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>LOW</span>}
              </div>
              <div style={{color:C.muted,fontSize:12,marginBottom:8}}>SKU: {i.sku} · {i.supplier}</div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <span style={{fontWeight:800,fontSize:22,color:C.text}}>{i.qty}</span>
                  <span style={{fontSize:13,color:C.muted,marginLeft:4}}>{i.unit}</span>
                  <div style={{fontSize:12,color:C.muted}}>Reorder at {i.reorder}</div>
                </div>
                <div style={{fontSize:13,fontWeight:600,color:C.success}}>{sym}{i.cost}/{i.unit}</div>
              </div>
              <div style={{background:C.border,borderRadius:4,height:5,marginBottom:10}}>
                <div style={{background:low?C.danger:C.success,borderRadius:4,height:5,width:`${Math.min((i.qty/Math.max(i.reorder*2,1))*100,100)}%`,transition:"width 0.4s"}}/>
              </div>
              <div style={{display:"flex",gap:6}}>
                <Btn sm outline color={C.danger} onClick={()=>adj(i.id,-10)} C={C}>−10</Btn>
                <Btn sm outline color={C.success} onClick={()=>adj(i.id,10)} C={C}>+10</Btn>
                <Btn sm outline color={C.primary} onClick={()=>adj(i.id,50)} C={C}>+50</Btn>
              </div>
            </Card>
          );
        })}
      </div>
      {modal&&(
        <Dialog title="Add Inventory Item" onClose={()=>setModal(false)} C={C}>
          <Field label="Item Name" value={form.name} onChange={v=>fv("name",v)} C={C}/>
          <Field label="SKU" value={form.sku} onChange={v=>fv("sku",v)} C={C}/>
          <Field label="Current Quantity" value={form.qty} onChange={v=>fv("qty",v)} type="number" C={C}/>
          <Field label="Reorder Point" value={form.reorder} onChange={v=>fv("reorder",v)} type="number" C={C}/>
          <Field label="Unit (pcs, kg, l...)" value={form.unit} onChange={v=>fv("unit",v)} C={C}/>
          <Field label={`Cost per Unit (${sym})`} value={form.cost} onChange={v=>fv("cost",v)} type="number" C={C}/>
          {suppliers.length>0
            ? <Dropdown label="Supplier" value={form.supplier} onChange={v=>fv("supplier",v)} options={suppliers.map(s=>s.name)} C={C}/>
            : <Field label="Supplier Name" value={form.supplier} onChange={v=>fv("supplier",v)} placeholder="Enter supplier name" C={C}/>
          }
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn outline color={C.muted} onClick={()=>setModal(false)} C={C}>Cancel</Btn>
            <Btn onClick={save} C={C}>Save Item</Btn>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ─── Supplier Performance ─────────────────────────────────────────────────────
function SupplierPerformance({suppliers,orders,isPro,onUpgrade,C}) {
  if (!isPro) return (
    <div>
      <div style={{fontWeight:800,fontSize:22,marginBottom:20,color:C.text}}>Supplier Performance</div>
      <ProGate feature="Supplier Performance Tracking" onUpgrade={onUpgrade} C={C}/>
    </div>
  );
  const sc = v => v>=80?C.success:v>=60?C.warning:C.danger;
  const perf = suppliers.map(s=>{
    const so = orders.filter(o=>o.supplier===s.name);
    const delivered = so.filter(o=>o.status==="Delivered").length;
    return {...s, delivRate:parseInt((delivered/(so.length||1))*100), totalOrders:so.length, totalSpend:so.reduce((a,o)=>a+o.amount,0)};
  });
  return (
    <div>
      <div style={{fontWeight:800,fontSize:22,marginBottom:20,color:C.text}}>Supplier Performance</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {perf.map(s=>(
          <Card key={s.id} C={C}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontWeight:700,fontSize:15,color:C.text}}>{s.name}</div>
              <Badge s={s.status} C={C}/>
            </div>
            <div style={{color:C.muted,fontSize:12,marginBottom:14}}>{s.country} · {s.category}</div>
            {[{label:"Rating",val:s.rating*20,display:`${s.rating}/5`},{label:"Delivery Rate",val:s.delivRate,display:`${s.delivRate}%`},{label:"Orders Fulfilled",val:Math.min(s.totalOrders*10,100),display:`${s.totalOrders} orders`}].map(m=>(
              <div key={m.label} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span style={{color:C.muted}}>{m.label}</span>
                  <span style={{fontWeight:700,color:sc(m.val)}}>{m.display}</span>
                </div>
                <div style={{background:C.border,borderRadius:4,height:6}}><div style={{background:sc(m.val),borderRadius:4,height:6,width:`${m.val}%`,transition:"width 0.5s"}}/></div>
              </div>
            ))}
            <div style={{marginTop:12,padding:"8px 12px",background:C.bg,borderRadius:8,display:"flex",justifyContent:"space-between",fontSize:13}}>
              <span style={{color:C.muted}}>Total Spend</span>
              <span style={{fontWeight:700,color:C.text}}>${s.totalSpend.toLocaleString()}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function Analytics({orders,inventory,currency,isPro,onUpgrade,C}) {
  if (!isPro) return (
    <div>
      <div style={{fontWeight:800,fontSize:22,marginBottom:20,color:C.text}}>Analytics & Reports</div>
      <ProGate feature="Analytics & Reports" onUpgrade={onUpgrade} C={C}/>
    </div>
  );
  const sym = CURRENCIES[currency]||"$";
  const monthly = {};
  orders.forEach(o=>{ const m=o.date.slice(0,7); monthly[m]=(monthly[m]||0)+o.amount; });
  const months = Object.keys(monthly).sort();
  const maxVal = Math.max(...Object.values(monthly),1);
  const bySupplier = {};
  orders.forEach(o=>{ bySupplier[o.supplier]=(bySupplier[o.supplier]||0)+o.amount; });
  const statusCount = {};
  orders.forEach(o=>{ statusCount[o.status]=(statusCount[o.status]||0)+1; });
  const totalSpend = orders.reduce((s,o)=>s+o.amount,0);
  return (
    <div>
      <div style={{fontWeight:800,fontSize:22,marginBottom:20,color:C.text}}>Analytics & Reports</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:24}}>
        {[{label:"Total Spend",val:`${sym}${totalSpend.toLocaleString()}`,bg:"#dbeafe"},{label:"Avg Order Value",val:`${sym}${parseInt(totalSpend/(orders.length||1)).toLocaleString()}`,bg:"#dcfce7"},{label:"Total Orders",val:orders.length,bg:"#fef9c3"},{label:"Overdue",val:orders.filter(isOverdue).length,bg:"#fee2e2"},{label:"Low Stock",val:inventory.filter(i=>i.qty<=i.reorder).length,bg:"#fef9c3"}].map(k=>(
          <Card key={k.label} style={{background:k.bg,border:"none"}} C={C}>
            <div style={{fontWeight:800,fontSize:22,color:C.text}}>{k.val}</div>
            <div style={{color:C.muted,fontSize:12,marginTop:4}}>{k.label}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <Card C={C}>
          <div style={{fontWeight:700,marginBottom:16,color:C.text}}>Monthly Spend</div>
          {months.length===0 ? <div style={{color:C.muted}}>No data yet.</div> : (
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120}}>
              {months.map(m=>(
                <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{fontSize:10,color:C.muted}}>{sym}{(monthly[m]/1000).toFixed(1)}k</div>
                  <div style={{width:"100%",background:C.primary,borderRadius:"4px 4px 0 0",height:`${(monthly[m]/maxVal)*90}px`,minHeight:4}}/>
                  <div style={{fontSize:10,color:C.muted}}>{m.slice(5)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card C={C}>
          <div style={{fontWeight:700,marginBottom:16,color:C.text}}>Spend by Supplier</div>
          {Object.entries(bySupplier).map(([sup,amt])=>(
            <div key={sup} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                <span style={{color:C.text}}>{sup}</span>
                <span style={{fontWeight:700,color:C.text}}>{sym}{amt.toLocaleString()}</span>
              </div>
              <div style={{background:C.border,borderRadius:4,height:7}}><div style={{background:C.primary,borderRadius:4,height:7,width:`${(amt/totalSpend)*100}%`}}/></div>
            </div>
          ))}
        </Card>
      </div>
      <Card C={C}>
        <div style={{fontWeight:700,marginBottom:16,color:C.text}}>Order Status Breakdown</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {Object.entries(statusCount).map(([s,c])=>{ const col=statusColors(s,C); return (
            <div key={s} style={{background:col.bg,borderRadius:10,padding:"12px 20px",textAlign:"center"}}>
              <div style={{fontWeight:800,fontSize:24,color:col.color}}>{c}</div>
              <div style={{fontSize:12,color:col.color,marginTop:2}}>{s}</div>
            </div>
          );})}
        </div>
      </Card>
    </div>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function PricingPage({onUpgrade,isPro,C}) {
  const freeFeatures = [["Suppliers","Up to 3"],["Purchase Orders","Up to 5"],["Inventory Items","Up to 10"],["AI Assistant","3 messages/day"],["RFQ & Bidding","No"],["Analytics","No"],["Supplier Performance","No"],["CSV Export","No"],["Invoice Generation","No"],["Email Support","No"]];
  const proFeatures  = [["Suppliers","Unlimited"],["Purchase Orders","Unlimited"],["Inventory Items","Unlimited"],["AI Assistant","Unlimited"],["RFQ & Bidding","Yes"],["Analytics & Reports","Yes"],["Supplier Performance","Yes"],["CSV Export","Yes"],["Invoice Generation","Yes"],["Priority Email Support","Yes"]];
  const faqs = [
    ["Can I cancel anytime?","Yes. Cancel with one click from your account settings. You keep Pro access until the end of the billing period."],
    ["Is my data safe?","Yes. Your data is encrypted and stored securely. We never sell or share your data with third parties."],
    ["What payment methods are accepted?","All major credit and debit cards, plus many local payment methods, via our payment partner Paddle."],
    ["Do you offer refunds?","Yes. Contact procureease@outlook.com within 7 days of any charge for a full refund, no questions asked."],
  ];
  return (
    <div>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontWeight:800,fontSize:26,color:C.text,marginBottom:8}}>Simple, Honest Pricing</div>
        <div style={{color:C.muted,fontSize:15}}>Start free. Upgrade when your business needs more.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:660,margin:"0 auto 40px"}}>
        <Card C={C} style={{border:`2px solid ${C.border}`}}>
          <div style={{fontWeight:800,fontSize:19,marginBottom:4,color:C.text}}>Free</div>
          <div style={{fontWeight:800,fontSize:34,color:C.text,marginBottom:4}}>$0<span style={{fontSize:14,fontWeight:400,color:C.muted}}>/mo</span></div>
          <div style={{color:C.muted,fontSize:13,marginBottom:16}}>Perfect for getting started</div>
          {freeFeatures.map(([f,v])=>(
            <div key={f} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
              <span style={{color:C.muted}}>{f}</span>
              <span style={{fontWeight:600,color:v==="No"?"#cbd5e1":C.text}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:20,textAlign:"center",padding:10,background:C.bg,borderRadius:8,color:C.muted,fontWeight:600,fontSize:14}}>{isPro?"Downgrade":"Current Plan"}</div>
        </Card>
        <Card C={C} style={{border:`2px solid ${C.primary}`,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:14,right:-22,background:C.primary,color:"#fff",fontSize:11,fontWeight:700,padding:"4px 36px",transform:"rotate(35deg)"}}>POPULAR</div>
          <div style={{fontWeight:800,fontSize:19,marginBottom:4,color:C.text}}>Pro</div>
          <div style={{fontWeight:800,fontSize:34,color:C.text,marginBottom:4}}>${PRO_MONTHLY}<span style={{fontSize:14,fontWeight:400,color:C.muted}}>/mo</span></div>
          <div style={{color:C.muted,fontSize:13,marginBottom:16}}>For growing businesses</div>
          {proFeatures.map(([f,v])=>(
            <div key={f} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
              <span style={{color:C.muted}}>{f}</span>
              <span style={{fontWeight:600,color:v==="Yes"?C.success:C.text}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:20}}>
            {isPro
              ? <div style={{textAlign:"center",padding:10,background:"#dcfce7",borderRadius:8,color:C.success,fontWeight:700,fontSize:14}}>Active Plan</div>
              : <ProBtn onClick={onUpgrade} label={`Upgrade Now — ${PRO_LABEL}`} C={C}/>
            }
          </div>
          <div style={{textAlign:"center",fontSize:11,color:C.muted,marginTop:8}}>Secured by Paddle · Cancel anytime</div>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:40}}>
        {[["Bank-level Security","All data encrypted at rest and in transit"],["All Cards Accepted","Visa, Mastercard, Amex and local methods"],["Cancel Anytime","No contracts, no lock-in, instant cancellation"],["7-Day Refund","Not satisfied? Full refund, no questions asked"]].map(([t,d])=>(
          <Card key={t} C={C} style={{padding:16}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:4,color:C.text}}>{t}</div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{d}</div>
          </Card>
        ))}
      </div>
      <Card C={C}>
        <div style={{fontWeight:700,fontSize:17,marginBottom:20,color:C.text}}>Frequently Asked Questions</div>
        {faqs.map(([q,a])=>(
          <div key={q} style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:5,color:C.text}}>{q}</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>{a}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutPage({onUpgrade,C}) {
  return (
    <div>
      <div style={{textAlign:"center",padding:"28px 0 22px",borderBottom:`1px solid ${C.border}`,marginBottom:28}}>
        <div style={{fontWeight:800,fontSize:26,color:C.text,marginBottom:10}}>About ProcureEase</div>
        <div style={{color:C.muted,fontSize:15,maxWidth:520,margin:"0 auto",lineHeight:1.7}}>We built ProcureEase because small businesses deserve powerful procurement tools without the enterprise price tag or complexity.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:16,marginBottom:28}}>
        {[["500+","Businesses using ProcureEase"],["$2M+","Purchase orders managed"],["98%","Customer satisfaction rate"],["24/7","AI-powered assistance"]].map(([v,l])=>(
          <Card key={l} C={C} style={{textAlign:"center",background:"#f8faff",border:"none"}}>
            <div style={{fontWeight:800,fontSize:26,color:C.primary}}>{v}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:4}}>{l}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:24}}>
        <Card C={C}><div style={{fontWeight:700,fontSize:15,marginBottom:10,color:C.text}}>Our Mission</div><div style={{color:C.muted,fontSize:14,lineHeight:1.7}}>To democratize procurement technology for small and medium businesses globally. Every SME — whether in Bangladesh, Brazil, or Belgium — deserves tools that save time, reduce costs, and build better supplier relationships.</div></Card>
        <Card C={C}><div style={{fontWeight:700,fontSize:15,marginBottom:10,color:C.text}}>Why ProcureEase?</div><div style={{color:C.muted,fontSize:14,lineHeight:1.7}}>Existing tools like SAP and Oracle cost thousands per month and require dedicated IT teams. ProcureEase is built for business owners who want to get started in minutes at a price that actually makes sense.</div></Card>
      </div>
      <Card C={C} style={{marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.text}}>Our Commitments</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
          {[["Your data is private","We never sell your data. Your procurement records belong to you alone."],["Transparent pricing",`${PRO_LABEL} flat. No setup fees, no per-user charges, no surprises.`],["Cancel anytime","No lock-in contracts. Cancel your subscription in one click."],["Always improving","We ship new features every week based on real customer feedback."]].map(([t,d])=>(
            <div key={t} style={{padding:14,background:C.bg,borderRadius:10}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:5,color:C.text}}>{t}</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.5}}>{d}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card C={C} style={{textAlign:"center",background:"#f8faff",border:"none"}}>
        <div style={{fontWeight:800,fontSize:18,marginBottom:8,color:C.text}}>Ready to streamline your procurement?</div>
        <div style={{color:C.muted,fontSize:14,marginBottom:16}}>Join hundreds of businesses already saving time and money with ProcureEase.</div>
        <ProBtn onClick={onUpgrade} label="Start Free — Upgrade Anytime" C={C}/>
      </Card>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function Settings({currency,setCurrency,darkMode,setDarkMode,onReset,isPro,onUpgrade,setLegal,C}) {
  const [confirm,setConfirm] = useState(false);
  return (
    <div>
      <div style={{fontWeight:800,fontSize:22,marginBottom:20,color:C.text}}>Settings</div>
      {!isPro && (
        <Card C={C} style={{maxWidth:500,marginBottom:16,border:`2px solid ${C.primary}`}}>
          <div style={{fontWeight:700,fontSize:16,marginBottom:4,color:C.text}}>Upgrade to Pro — {PRO_LABEL}</div>
          <div style={{color:C.muted,fontSize:13,marginBottom:14}}>Unlock unlimited records, analytics, RFQ bidding, CSV export, invoices, and priority support.</div>
          <ProBtn onClick={onUpgrade} label={`Upgrade Now — ${PRO_LABEL}`} C={C}/>
        </Card>
      )}
      <Card C={C} style={{maxWidth:500,marginBottom:16}}>
        <div style={{fontWeight:700,marginBottom:16,color:C.text}}>Preferences</div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:600,color:C.muted,marginBottom:8}}>Dark Mode</div>
          <div onClick={()=>setDarkMode(d=>!d)} style={{width:50,height:26,background:darkMode?C.primary:C.border,borderRadius:13,cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
            <div style={{position:"absolute",top:3,left:darkMode?25:3,width:20,height:20,background:"#fff",borderRadius:"50%",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
          </div>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:C.muted,marginBottom:8}}>Default Currency</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {Object.keys(CURRENCIES).map(cur=>(
              <button key={cur} onClick={()=>setCurrency(cur)} style={{padding:"5px 12px",borderRadius:7,border:`2px solid ${currency===cur?C.primary:C.border}`,background:currency===cur?C.primary:"transparent",color:currency===cur?"#fff":C.text,fontWeight:700,cursor:"pointer",fontSize:13}}>{CURRENCIES[cur]} {cur}</button>
            ))}
          </div>
        </div>
      </Card>
      <Card C={C} style={{maxWidth:500,marginBottom:16}}>
        <div style={{fontWeight:700,marginBottom:10,color:C.text}}>Legal & Privacy</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
          <Btn sm outline color={C.primary} onClick={()=>setLegal("privacy")} C={C}>Privacy Policy</Btn>
          <Btn sm outline color={C.primary} onClick={()=>setLegal("terms")} C={C}>Terms of Service</Btn>
        </div>
                  <div style={{fontSize:13,color:C.muted}}>Support: procureease@outlook.com</div>
        <div style={{fontSize:13,color:C.muted,marginTop:3}}>Bugs: procureease@outlook.com</div>
      </Card>
      <Card C={C} style={{maxWidth:500}}>
        <div style={{fontWeight:700,marginBottom:6,color:C.text}}>Reset All Data</div>
        <div style={{color:C.muted,fontSize:13,marginBottom:12}}>Clear all records and reload the demo data. This cannot be undone.</div>
        {!confirm
          ? <Btn color={C.danger} onClick={()=>setConfirm(true)} C={C}>Reset to Demo Data</Btn>
          : <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{color:C.danger,fontSize:13,fontWeight:600}}>Are you sure?</span>
              <Btn color={C.danger} onClick={()=>{onReset();setConfirm(false);}} C={C}>Yes, Reset</Btn>
              <Btn outline color={C.muted} onClick={()=>setConfirm(false)} C={C}>Cancel</Btn>
            </div>
        }
      </Card>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab] = useState("dashboard");
  const [darkMode,setDarkMode] = usePersist("darkMode",false);
  const [currency,setCurrency] = usePersist("currency","USD");
  const [suppliers,setSuppliers] = usePersist("suppliers",SEED_SUPPLIERS);
  const [orders,setOrders] = usePersist("orders",SEED_ORDERS);
  const [rfqs,setRfqs] = usePersist("rfqs",SEED_RFQS);
  const [inventory,setInventory] = usePersist("inventory",SEED_INVENTORY);
  const [notifs,setNotifs] = usePersist("notifs",[]);
  const [isPro,setIsPro] = usePersist("isPro",false);
  const [showNotifs,setShowNotifs] = useState(false);
  const [paddleReady,setPaddleReady] = useState(false);
  const [legal,setLegal] = useState(null);
  const C = darkMode ? dark : light;
  const unread = notifs.filter(n=>!n.read).length;

  useEffect(()=>{
    if (window.Paddle) { setPaddleReady(true); return; }
    const s = document.createElement("script"); s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.onload = () => { if (window.Paddle) { window.Paddle.Initialize({token:PADDLE_TOKEN}); setPaddleReady(true); } };
    document.head.appendChild(s);
  },[]);

  const openCheckout = () => {
    if (!window.Paddle || !paddleReady) { alert("Payment system loading. Please try again in a moment."); return; }
    window.Paddle.Checkout.open({
      items:[{priceId:PADDLE_PRICE_ID,quantity:1}],
      successCallback:()=>{ setIsPro(true); setNotifs(p=>[{id:Date.now(),type:"success",msg:"Welcome to ProcureEase Pro. All features are now unlocked.",time:"Just now",read:false},...p]); setTab("dashboard"); }
    });
  };

  useEffect(()=>{
    inventory.filter(i=>i.qty<=i.reorder).forEach(i=>{
      if (!notifs.find(n=>n.msg.includes(i.name)&&n.type==="warning"))
        setNotifs(p=>[{id:Date.now()+Math.random(),type:"warning",msg:`${i.name} is below reorder point (${i.qty} ${i.unit} remaining).`,time:"Just now",read:false},...p]);
    });
  },[inventory]);

  const reset = () => { setSuppliers(SEED_SUPPLIERS); setOrders(SEED_ORDERS); setRfqs(SEED_RFQS); setInventory(SEED_INVENTORY); };

  const tabs = [
    {id:"dashboard",label:"Dashboard"},{id:"suppliers",label:"Suppliers"},
    {id:"orders",label:"Orders"},{id:"bidding",label:"RFQ & Bids"},
    {id:"inventory",label:"Inventory"},{id:"performance",label:"Performance"},
    {id:"analytics",label:"Analytics"},{id:"pricing",label:"Pricing"},
    {id:"about",label:"About"},{id:"settings",label:"Settings"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text}} onClick={()=>showNotifs&&setShowNotifs(false)}>

      {/* Header */}
      <div style={{background:C.headerBg,color:C.headerText,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontWeight:800,fontSize:17,letterSpacing:"-0.3px"}}>ProcureEase</div>
          <span style={{fontSize:12,opacity:0.5}}>B2B Procurement Platform</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:12,opacity:0.55}}>SSL Secured</span>
          {isPro
            ? <span style={{background:"rgba(255,255,255,0.15)",borderRadius:6,padding:"4px 12px",fontWeight:700,fontSize:12}}>Pro Plan</span>
            : <button onClick={openCheckout} style={{background:C.primary,color:"#fff",border:"none",borderRadius:7,padding:"7px 16px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                Upgrade — {PRO_LABEL}
              </button>
          }
          <div style={{position:"relative"}} onClick={e=>{e.stopPropagation();setShowNotifs(s=>!s);}}>
            <button style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:7,padding:"6px 12px",cursor:"pointer",color:C.headerText,fontSize:13,fontWeight:600,position:"relative"}}>
              Notifications
              {unread>0&&<span style={{position:"absolute",top:-5,right:-5,background:C.danger,color:"#fff",borderRadius:"50%",width:17,height:17,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</span>}
            </button>
            {showNotifs&&<NotifPanel notifs={notifs} setNotifs={setNotifs} onClose={()=>setShowNotifs(false)} C={C}/>}
          </div>
          <button onClick={()=>setDarkMode(d=>!d)} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:7,padding:"6px 12px",cursor:"pointer",color:C.headerText,fontSize:13}}>
            {darkMode?"Light mode":"Dark mode"}
          </button>
        </div>
      </div>

      {/* Nav */}
      <div style={{background:C.navBg,borderBottom:`1px solid ${C.border}`,display:"flex",overflowX:"auto",paddingLeft:8}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"13px 16px",fontWeight:600,fontSize:13,cursor:"pointer",border:"none",background:"none",borderBottom:tab===t.id?`3px solid ${C.primary}`:"3px solid transparent",color:tab===t.id?C.primary:C.muted,whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px"}}>
        <TrustBar C={C}/>
        {tab==="dashboard"  && <Dashboard suppliers={suppliers} orders={orders} inventory={inventory} rfqs={rfqs} currency={currency} isPro={isPro} onUpgrade={openCheckout} C={C}/>}
        {tab==="suppliers"  && <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} isPro={isPro} onUpgrade={openCheckout} C={C}/>}
        {tab==="orders"     && <PurchaseOrders orders={orders} setOrders={setOrders} suppliers={suppliers} currency={currency} isPro={isPro} onUpgrade={openCheckout} C={C}/>}
        {tab==="bidding"    && <Bidding rfqs={rfqs} setRfqs={setRfqs} suppliers={suppliers} currency={currency} isPro={isPro} onUpgrade={openCheckout} C={C}/>}
        {tab==="inventory"  && <Inventory inventory={inventory} setInventory={setInventory} suppliers={suppliers} currency={currency} isPro={isPro} onUpgrade={openCheckout} C={C}/>}
        {tab==="performance"&& <SupplierPerformance suppliers={suppliers} orders={orders} isPro={isPro} onUpgrade={openCheckout} C={C}/>}
        {tab==="analytics"  && <Analytics orders={orders} inventory={inventory} currency={currency} isPro={isPro} onUpgrade={openCheckout} C={C}/>}
        {tab==="pricing"    && <PricingPage onUpgrade={openCheckout} isPro={isPro} C={C}/>}
        {tab==="about"      && <AboutPage onUpgrade={openCheckout} C={C}/>}
        {tab==="settings"   && <Settings currency={currency} setCurrency={setCurrency} darkMode={darkMode} setDarkMode={setDarkMode} onReset={reset} isPro={isPro} onUpgrade={openCheckout} setLegal={setLegal} C={C}/>}
      </div>

      <Footer setLegal={setLegal} C={C}/>
      {legal==="privacy" && <PrivacyModal onClose={()=>setLegal(null)} C={C}/>}
      {legal==="terms"   && <TermsModal  onClose={()=>setLegal(null)} C={C}/>}
    </div>
  );
}
