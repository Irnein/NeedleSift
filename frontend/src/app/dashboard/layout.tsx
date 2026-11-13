import type { ReactNode } from "react";
import type { Metadata } from "next";

import { QueryProvider } from "@/features/dashboard/components/query-provider";
import { Toaster } from "@/features/dashboard/components/toaster";

export const metadata: Metadata = {
  title: "Security operations",
  description: "Live, AI-triaged security alert queue for NOC analysts.",
};

/**
 * Server-state and toast providers are scoped to the dashboard, so the
 * landing page ships none of the data layer and never touches the API.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
}
