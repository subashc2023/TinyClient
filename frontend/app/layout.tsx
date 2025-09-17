import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TinyClient",
  description: "Tiny MCP Client—fast, tiny, hackable, extendible.",
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
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto grid h-14 grid-cols-[1fr_auto_1fr] items-center px-4">
                <div className="col-start-2 justify-self-center flex items-center gap-2">
                  {/* Light logo */}
                  <img
                    src="/mcplight.png"
                    alt="TinyClient logo light"
                    className="block h-6 w-auto dark:hidden"
                  />
                  {/* Dark logo */}
                  <img
                    src="/mcp.png"
                    alt="TinyClient logo dark"
                    className="hidden h-6 w-auto dark:block"
                  />
                  <div className="text-lg font-semibold tracking-tight">TinyClient</div>
                </div>
                <div className="col-start-3 justify-self-end">
                  <ModeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
              <div className="container mx-auto px-4">© {new Date().getFullYear()} TinyClient</div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
