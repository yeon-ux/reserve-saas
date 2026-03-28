import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "스마트 예약 플랫폼",
  description: "누구나 쉽게 만드는 나만의 예약 페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense - TODO: Replace ca-pub-xxxxxxxxxxxxxxxx with your real Publisher ID */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx" 
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
