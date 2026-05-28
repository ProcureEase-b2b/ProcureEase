// ─── FAQ.js ───────────────────────────────────────────────────────────────────
export function FAQ() {
  const faqs = [
    ["Is the free plan really free?","Yes, completely free with no credit card required. The free plan includes up to 3 suppliers, 5 purchase orders, 10 inventory items, and 3 AI messages per day."],
    ["Can I cancel my Pro subscription anytime?","Yes. Cancel anytime from your account settings. You keep Pro access until the end of your billing period with no questions asked."],
    ["How are payments processed?","All payments are handled by Paddle, our trusted payment partner. We accept all major credit and debit cards and many local payment methods. ProcureEase never stores your card details."],
    ["Do you offer refunds?","Yes. Contact procureease@outlook.com within 7 days of any charge for a full refund, no questions asked."],
    ["Is my data secure?","Yes. All data is encrypted and stored securely in the cloud. We never sell or share your data with third parties. You can request deletion at any time."],
    ["Does it work for businesses outside the US?","Absolutely. ProcureEase supports multiple currencies and is used by businesses in over 40 countries including Bangladesh, India, UAE, UK and Canada."],
    ["What happens to my data if I cancel?","Your data remains accessible for 30 days after cancellation. You can export everything as CSV before cancelling. After 30 days, data is permanently deleted."],
    ["Can multiple people use one account?","Currently ProcureEase is a single-user account. Multi-user team plans are on our roadmap. Contact us if this is important for your business."],
    ["How does the AI assistant work?","The AI reads your actual procurement data — suppliers, orders, inventory — and answers questions about it in plain language. It uses your real data, not generic information."],
    ["What if I need help?","Email us at procureease@outlook.com. We respond within 24 hours on business days. Pro users get priority support."],
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",color:"#1e293b"}}>
      <Nav active="/faq"/>
      <div style={{padding:"64px 0"}}>
        <div style={container}>
          <div style={sectionHeader}>
            <h2 style={h2}>Frequently Asked Questions</h2>
            <p style={subP}>Everything you need to know about ProcureEase.</p>
          </div>
          <div style={{maxWidth:680,margin:"0 auto"}}>
            {faqs.map(([q,a])=>(
              <div key={q} style={{borderBottom:"1px solid #e2e8f0",padding:"20px 0"}}>
                <div style={{fontSize:15,fontWeight:700,color:"#1e293b",marginBottom:8}}>{q}</div>
                <div style={{fontSize:14,color:"#64748b",lineHeight:1.7}}>{a}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:48}}>
            <div style={{fontSize:15,color:"#64748b",marginBottom:16}}>Still have questions?</div>
            <button onClick={()=>navigate("/contact")} style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:8,padding:"11px 28px",fontWeight:700,fontSize:14,cursor:"pointer"}}>Contact Us</button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

