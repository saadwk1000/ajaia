import type { Metadata } from "next";
import "@/styles/tailwind.css";
import "@/styles/styles.scss";
export const metadata: Metadata = {
  title: "Ajaia Docs",
  description: "A focused workspace for your documents and ideas.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
