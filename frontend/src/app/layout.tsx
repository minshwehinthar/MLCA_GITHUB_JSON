import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mon Literature and Culture Association | UCS Hpa-An",
    template: "%s | MLCA - UCS Hpa-An",
  },
  description:
    "The official website of the Mon Literature and Culture Association at the University of Computer Studies, Hpa-An. News, activities, events, gallery, videos, documents and members.",
  keywords: ["Mon Literature", "Mon Culture", "MLCA", "UCS Hpa-An", "Mon Association", "Mon students"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-cream text-ink" suppressHydrationWarning>
        <LocaleProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" closeButton />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
