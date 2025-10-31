// initialize supabase client for frontend realtime subscriptions
const SUPABASE_URL = "https://uzlxttvrgqvigmnbklmr.supabase.co"; // your supabase url
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bHh0dHZyZ3F2aWdtbmJrbG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NDYwMTUsImV4cCI6MjA3MDMyMjAxNX0.fk0c43c41jGa3ogCu0kXZjLWmC-pW7yYSn77FwV4vdE"; // replace with anon key (or use env injection in Vercel)

window.supabase = 
supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
