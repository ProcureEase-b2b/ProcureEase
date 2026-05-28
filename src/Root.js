import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import App from "./App";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";

// Simple client-side router
function getPage() {
  const path = window.location.pathname;
  if (path === "/" || path === "") return "home";
  if (path.startsWith("/features")) return "features";
  if (path.startsWith("/pricing")) return "pricing";
  if (path.startsWith("/faq")) return "faq";
  if (path.startsWith("/contact")) return "contact";
  if (path.startsWith("/signin")) return "signin";
  if (path.startsWith("/app")) return "app";
  return "home";
}

export function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("popstate"));
}

export default function Root() {
  const [page, setPage] = useState(getPage());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    const onPop = () => setPage(getPage());
    window.addEventListener("popstate", onPop);
    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",color:"#64748b",fontSize:15}}>
      Loading...
    </div>
  );

  // App page — requires login
  if (page === "app") {
    if (!user) { navigate("/signin"); return null; }
    return <App user={user}/>;
  }

  // Auth page
  if (page === "signin") {
    if (user) { navigate("/app"); return null; }
    return <Auth/>;
  }

  // Public pages
  if (page === "features") return <Features/>;
  if (page === "pricing")  return <Pricing/>;
  if (page === "faq")      return <FAQ/>;
  if (page === "contact")  return <Contact/>;
  return <Home/>;
}
