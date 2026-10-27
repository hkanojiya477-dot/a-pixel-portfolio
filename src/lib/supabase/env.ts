// Only PUBLIC values live here. They are designed to be visible in the browser;
// Row Level Security (supabase/schema.sql) is what protects your data.
// The secret "service_role" key is never used anywhere in this project.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
