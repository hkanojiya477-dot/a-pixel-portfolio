"use client";

import { useEffect } from "react";

/**
 * If Supabase sends a recovery link to the homepage (it falls back to the Site URL when
 * the redirect address isn't on its allow-list), forward it to the reset-password page
 * with the tokens intact.
 */
export default function AuthLinkForwarder() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (pathname.startsWith("/admin/reset-password")) return;
    const q = new URLSearchParams(search);
    const h = new URLSearchParams(hash.replace(/^#/, ""));
    const isRecovery =
      h.get("type") === "recovery" ||
      q.get("type") === "recovery" ||
      (pathname === "/" && (q.has("code") || h.has("error_description")));
    if (isRecovery) window.location.replace(`/admin/reset-password${search}${hash}`);
  }, []);
  return null;
}
