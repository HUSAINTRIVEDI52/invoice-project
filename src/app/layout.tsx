import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSL",
  description: "Student fees collection and invoice management system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
