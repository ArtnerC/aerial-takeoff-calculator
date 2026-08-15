import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aerial Takeoff Calculator | Ground Control",
  description:
    "Draw your yard, pick a material, and get an instant cubic yard, ton, and delivery estimate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
