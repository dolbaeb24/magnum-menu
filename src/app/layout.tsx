import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Что приготовить? — Меню для семьи",
  description:
    "Планировщик завтраков, обедов и ужинов на неделю для семьи из 5 человек с ценами Magnum Алматы",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Меню",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
