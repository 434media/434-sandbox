import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { CombinedNavbar } from "@/components/combined-navbar"
import Footer from "@/components/Footer"

// Same font stack as the production 434 app: Geist (body/mono) + the two brand
// display faces (Menda Black for the logo/headings, GGX88 for display type).
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" })
const mendaBlack = localFont({ src: "../fonts/Menda-Black.otf", variable: "--font-menda-black", display: "swap" })
const ggx88Font = localFont({ src: "../fonts/GGX88.otf", variable: "--font-ggx88", display: "swap" })

export const metadata: Metadata = {
  title: "434 Sandbox",
  description: "Digital Canvas cohort sandbox — 434 design-system skeleton (navbar, hero, footer).",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${mendaBlack.variable} ${ggx88Font.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-white text-neutral-900">
        <CombinedNavbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
