"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/posts", label: "All Posts" },
  { href: "/posts/new", label: "Create Article" },
  { href: "/preview", label: "Preview" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link href="/posts" className="brand">
          Post Article
        </Link>
        <nav className="nav">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav__link ${pathname === l.href ? "nav__link--active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
