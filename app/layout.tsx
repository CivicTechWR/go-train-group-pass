import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { Toaster } from "sonner";

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
        <TRPCProvider>
          {children}
          <Toaster />
        </TRPCProvider>
      </body>
    </html>
  );
}
