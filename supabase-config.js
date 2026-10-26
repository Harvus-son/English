// Fill these values from Supabase → Project Settings → API.
// The anon/publishable key is intended for browser use only when Row Level Security is enabled.
// Never put a service_role key or database password into this file.
window.ENGLISH_LAB_SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
window.ENGLISH_LAB_SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY";
if (window.supabase && window.ENGLISH_LAB_SUPABASE_URL.startsWith("https://") && !window.ENGLISH_LAB_SUPABASE_URL.includes("YOUR_") && !window.ENGLISH_LAB_SUPABASE_ANON_KEY.includes("YOUR_")) {
  window.englishClient = window.supabase.createClient(window.ENGLISH_LAB_SUPABASE_URL, window.ENGLISH_LAB_SUPABASE_ANON_KEY);
} else {
  window.englishClient = null;
}