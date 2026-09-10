import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Post Article",
  description: "Article management: All Posts, Create Article, Preview.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container page">{children}</main>
        <footer className="footer">
          <div className="container">Post Article FE · Next.js + TypeScript</div>
        </footer>
      </body>
    </html>
  );
}
