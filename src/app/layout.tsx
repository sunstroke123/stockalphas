import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import CursorTrail from "@/components/CursorTrail";
import DashboardLayout from "@/components/DashboardLayout";

// Inter for body text - clean and readable
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Poppins for headings - modern and bold
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StockAlphas - Stocks and Finance Management",
  description: "AI-powered stock analysis and portfolio management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} antialiased`} suppressHydrationWarning>
        <CursorTrail />
        <Providers>
          <PortfolioProvider>
            <DashboardLayout>
              {children}
            </DashboardLayout>
          </PortfolioProvider>
        </Providers>
      </body>
    </html>
  );
}
