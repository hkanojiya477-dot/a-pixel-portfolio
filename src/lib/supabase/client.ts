import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** Browser-side client, used by the admin dashboard to upload images. */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
