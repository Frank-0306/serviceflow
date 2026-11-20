"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Renders public-site chrome (demo bar, header, footer) everywhere except the admin area. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
