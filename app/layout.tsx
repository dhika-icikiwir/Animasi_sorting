import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Animasi Sorting",
  description: "Visualisasi bubble, selection, insertion, dan quick sort langkah demi langkah.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
