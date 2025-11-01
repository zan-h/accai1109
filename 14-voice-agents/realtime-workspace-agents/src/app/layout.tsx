import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import "./lib/envSetup";
import CornerBrackets from "./components/CornerBrackets";
import { ResponsiveLayout } from "./components/layouts/ResponsiveLayout";

export const metadata: Metadata = {
  title: "Realtime API Agents - Command Center",
  description: "Multi-agent voice interaction system",
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
            <CornerBrackets />
            <div className="dashboard-container min-h-screen border-2 border-border-primary relative">
              {children}
            </div>
          </ResponsiveLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
