// ─── Features.js ─────────────────────────────────────────────────────────────
import Nav from "./Nav";
import Footer from "./Footer";
import { navigate } from "../Root";

const container = { maxWidth:1080, margin:"0 auto", padding:"0 24px" };
const sectionHeader = { textAlign:"center", marginBottom:48 };
const h2 = { fontSize:32, fontWeight:800, color:"#0f172a", marginBottom:10, letterSpacing:"-0.5px" };
const subP = { fontSize:16, color:"#64748b", maxWidth:480, margin:"0 auto" };
const proBadge = { display:"inline-block", background:"#dbeafe", color:"#1d4ed8", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, marginLeft:7, verticalAlign:"middle" };

export function Features() {
  const all = [
    { title:"Supplier Management", desc:"Store all supplier contacts, ratings, performance history, and notes in one organized place. Filter by category, country, or status.", pro:false },
    { title:"Purchase Orders", desc:"Create, send, and track purchase orders from draft through to delivery. Every status change is logged with a full audit trail.", pro:false },
    { title:"Inventory Tracking", desc:"Monitor stock levels across all products. Set reorder points and get automatic alerts when items run low.", pro:false },
    { title:"AI Procurement Assistant", desc:"Ask questions about your data in plain language. Instantly surface insights about spending, supplier performance, and stock levels.", pro:false },
    { title:"Multi-Currency Support", desc:"Work in USD, EUR, GBP, BDT, INR, JPY and AED. Switch anytime — all values update instantly.", pro:false },
    { title:"RFQ & Price Comparison", desc:"Request quotes from multiple suppliers and compare prices side by side. Auto-highlight the best deal.", pro:true },
    { title:"Analytics & Reports", desc:"Visualize monthly spend, supplier breakdowns, and order status trends. Make data-driven purchasing decisions.", pro:true },
    { title:"Supplier Performance Tracking", desc:"See delivery rates, order history, and ratings for every supplier. Know who is reliable before you reorder.", pro:true },
    { title:"Invoice Generation", desc:"Generate professional PDF invoices from any purchase order in one click. Includes tax calculation and your business details.", pro:true },
    { title:"CSV Export", desc:"Export your suppliers, orders, and inventory to Excel or Google Sheets with one click. Your data belongs to you.", pro:true },
    { title:"Overdue Order Alerts", desc:"Automatic alerts when purchase orders pass their due date. Never miss a delayed delivery again.", pro:false },
    { title:"Dark Mode", desc:"Switch between light and dark interface to reduce eye strain during long work sessions.", pro:false },
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#1e293b"}}>
      <Nav active="/features"/>
      <div style={{padding:"64px 0",background:"#f8faff"}}>
        <div style={container}>
          <div style={sectionHeader}>
            <h2 style={h2}>All Features</h2>
            <p style={subP}>Everything you need to manage procurement for your business.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20}}>
            {all.map(f=>(
              <div key={f.title} style={{background:"#fff",borderRadius:12,padding:24,border:"1px solid #e2e8f0"}}>
                <div style={{fontWeight:700,fontSize:15,color:"#1e293b",marginBottom:8}}>{f.title}{f.pro&&<span style={proBadge}>Pro</span>}</div>
                <div style={{fontSize:14,color:"#64748b",lineHeight:1.6}}>{f.desc}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:40}}>
            <button onClick={()=>navigate("/signin")} style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:8,padding:"13px 32px",fontWeight:700,fontSize:15,cursor:"pointer"}}>Start for Free</button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
