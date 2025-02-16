import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calvin",
  description: "Your Canvas Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-['Comic_Sans_MS']">
        {children}
      </body>
    </html>
  );
}
