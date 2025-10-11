import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { BottomNav } from "@/components/navigation/BottomNav";

export const metadata: Metadata = {
  title: "GO Train Group Pass",
  description: "Coordinate GO Train group passes with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <TRPCProvider>
            <div className="md:pl-64">
              {children}
            </div>
            <BottomNav />
            <Toaster />
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
