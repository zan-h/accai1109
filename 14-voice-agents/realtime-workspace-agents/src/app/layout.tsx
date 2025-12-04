import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import "./lib/envSetup";
import CornerBrackets from "./components/CornerBrackets";
import { ResponsiveLayout } from "./components/layouts/ResponsiveLayout";
import { SkipLink } from "./components/ui/SkipLink";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Realtime API Agents - Command Center",
  description: "Multi-agent voice interaction system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Accai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased font-mono">
          <ResponsiveLayout>
            <SkipLink />
            <CornerBrackets />
            <div id="main-content" className="dashboard-container min-h-screen border-2 border-border-primary relative">
              {children}
            </div>
          </ResponsiveLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
