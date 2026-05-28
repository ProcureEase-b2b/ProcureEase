import { createClient } from "@supabase/supabase-js";

const URL = process.env.REACT_APP_SUPABASE_URL || "https://cjowfkihkbsvdgjsxhvt.supabase.co";
const KEY = process.env.REACT_APP_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqb3dma2loa2JzdmRnanN4aHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTgyMDEsImV4cCI6MjA5NTUzNDIwMX0.cCMgJraGhZ4TEuaxf-Sdqubwn0uJnF1Kykh7bHle7ns";

export const supabase = createClient(URL, KEY);
