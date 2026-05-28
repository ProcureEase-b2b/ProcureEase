import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth() {
  const [mode, setMode] = useState("signin"); // signin | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const s = {
    wrap: { minHeight:"100vh", background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif", padding:16 },
    card: { background:"#fff", borderRadius:14, padding:36, width:420, maxWidth:"100%", boxShadow:"0 4px 24px rgba(0,0,0,0.08)", border:"1px solid #e2e8f0" },
    logo: { fontWeight:800, fontSize:22, color:"#1e293b", marginBottom:4 },
    tagline: { fontSize:13, color:"#94a3b8", marginBottom:28 },
    title: { fontWeight:700, fontSize:20, color:"#1e293b", marginBottom:4 },
    sub: { fontSize:13, color:"#94a3b8", marginBottom:24 },
    label: { fontSize:13, fontWeight:600, color:"#64748b", marginBottom:5, display:"block" },
    input: { width:"100%", padding:"10px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:14, color:"#1e293b", background:"#fff" },
    btn: { width:"100%", padding:"11px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:15, cursor:"pointer", marginTop:4 },
    error: { background:"#fee2e2", color:"#dc2626", borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 },
    success: { background:"#dcfce7", color:"#16a34a", borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 },
    link: { color:"#2563eb", cursor:"pointer", fontWeight:600, background:"none", border:"none", fontSize:13, padding:0 },
    divider: { textAlign:"center", fontSize:13, color:"#94a3b8", margin:"16px 0" },
    trust: { display:"flex", gap:16, justifyContent:"center", marginTop:20, flexWrap:"wrap" },
    trustItem: { fontSize:12, color:"#94a3b8" },
  };

  const handleSignUp = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (err) setError(err.message);
    else setSuccess("Account created! Please check your email to confirm, then sign in.");
    setLoading(false);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  };

  const handleReset = async () => {
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    if (err) setError(err.message);
    else setSuccess("Password reset email sent. Please check your inbox.");
    setLoading(false);
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>ProcureEase</div>
        <div style={s.tagline}>B2B Procurement Platform</div>

        {mode === "signin" && <>
          <div style={s.title}>Welcome back</div>
          <div style={s.sub}>Sign in to your account</div>
          {error && <div style={s.error}>{error}</div>}
          {success && <div style={s.success}>{success}</div>}
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" onKeyDown={e=>e.key==="Enter"&&handleSignIn()}/>
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleSignIn()}/>
          <div style={{textAlign:"right", marginTop:-8, marginBottom:14}}>
            <button style={s.link} onClick={()=>{setMode("reset");setError("");setSuccess("");}}>Forgot password?</button>
          </div>
          <button style={s.btn} onClick={handleSignIn} disabled={loading}>{loading?"Signing in...":"Sign In"}</button>
          <div style={s.divider}>Don't have an account? <button style={s.link} onClick={()=>{setMode("signup");setError("");setSuccess("");}}>Sign up free</button></div>
        </>}

        {mode === "signup" && <>
          <div style={s.title}>Create your account</div>
          <div style={s.sub}>Start free — no credit card required</div>
          {error && <div style={s.error}>{error}</div>}
          {success && <div style={s.success}>{success}</div>}
          <label style={s.label}>Full Name</label>
          <input style={s.input} type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/>
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/>
          <button style={s.btn} onClick={handleSignUp} disabled={loading}>{loading?"Creating account...":"Create Free Account"}</button>
          <div style={s.divider}>Already have an account? <button style={s.link} onClick={()=>{setMode("signin");setError("");setSuccess("");}}>Sign in</button></div>
        </>}

        {mode === "reset" && <>
          <div style={s.title}>Reset your password</div>
          <div style={s.sub}>Enter your email and we will send a reset link</div>
          {error && <div style={s.error}>{error}</div>}
          {success && <div style={s.success}>{success}</div>}
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/>
          <button style={s.btn} onClick={handleReset} disabled={loading}>{loading?"Sending...":"Send Reset Link"}</button>
          <div style={s.divider}><button style={s.link} onClick={()=>{setMode("signin");setError("");setSuccess("");}}>Back to sign in</button></div>
        </>}

        <div style={s.trust}>
          <span style={s.trustItem}>✓ SSL Secured</span>
          <span style={s.trustItem}>✓ Cancel anytime</span>
          <span style={s.trustItem}>✓ Free plan available</span>
        </div>
      </div>
    </div>
  );
}
