import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import { MainLayoutWrapper } from "@/components/MainLayoutWrapper";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FormFlow | Premium Form Builder",
  description: "High-end alternative to Google Forms with stunning Glassmorphism UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} font-sans antialiased`}
      >
        <Providers>
          <Navbar />
          <MainLayoutWrapper>
            {children}
          </MainLayoutWrapper>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
