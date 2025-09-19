import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ConditionalHeader } from "@/components/conditional-header";
import { RouteOverlayProvider } from "@/lib/route-overlay-context";
import { getProjectName } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const projectName = getProjectName();

export const metadata: Metadata = {
  title: projectName,
  description: `${projectName} MCP client - fast, tiny, hackable, extendible.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <RouteOverlayProvider>
              <div className="min-h-screen flex flex-col">
                <ConditionalHeader />
                <main className="flex-1 flex flex-col">{children}</main>
                <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                  <div className="container mx-auto px-4">Copyright {new Date().getFullYear()} {projectName}</div>
                </footer>
              </div>
            </RouteOverlayProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

