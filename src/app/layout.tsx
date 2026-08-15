import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aerial Takeoff Calculator | Ground Control",
  description:
    "Trace your yard on a satellite map, pick a material, and get an instant cubic yard, ton, and delivery estimate from Ground Control in Southern Oregon.",
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
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
