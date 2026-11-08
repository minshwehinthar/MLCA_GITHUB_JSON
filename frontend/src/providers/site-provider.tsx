"use client";

import { createContext, useContext } from "react";
import { useApi } from "@/hooks/use-api";
import { withLocale } from "@/lib/api";
import type { SiteData } from "@/lib/types";
import { useLocale } from "./locale-provider";

interface SiteContextValue {
  site: SiteData | null;
  settings: Record<string, string | null | undefined>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const { data, loading, error, refetch } = useApi<SiteData>(withLocale("/site", locale));

  return (
    <SiteContext.Provider
      value={{
        site: data,
        settings: data?.settings ?? {},
        loading,
        error,
        refresh: refetch,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used inside SiteProvider");
  return context;
}
