"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Arrow } from "@/components/arrow";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader({ hasWork }: { hasWork: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu sluiten met Escape en de pagina erachter niet laten scrollen.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // Op de homepage zelf: soepel scrollen in plaats van navigeren, en geen #anker in de
  // adresbalk achterlaten (anders springt herladen naar die sectie). Elders gewoon navigeren.
  function goTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    setOpen(false);
    if (pathname !== "/" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const id = href.split("#")[1];
    const target = id ? document.getElementById(id) : null;
    if (id && !target) return;
    e.preventDefault();
    document.documentElement.style.overflow = ""; // mobiel menu kan het scrollen nog blokkeren
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0 });
    if (location.hash) history.replaceState(null, "", "/");
  }

  const links = [
    { href: "/#diensten", label: "Diensten" },
    { href: "/#afwerking", label: "Afwerking" },
    ...(hasWork ? [{ href: "/#werk", label: "Ons werk" }] : []),
    { href: "/#werkwijze", label: "Werkwijze" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 h-[var(--header-h)] border-b transition-colors duration-300 ${
        scrolled || open ? "border-line bg-ink/75 backdrop-blur-xl" : "border-transparent bg-ink/0"
      }`}
    >
      <div className="wrap flex h-full items-center justify-between gap-4">
        <Link href="/" className="flex items-center py-2 transition-opacity hover:opacity-80" onClick={(e) => goTo(e, "/")}>
          <BrandLogo preload className="h-[18px] lg:h-[22px]" />
        </Link>

        <nav aria-label="Hoofdmenu" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={(e) => goTo(e, l.href)} className="rounded-full px-4 py-2 text-[15px] text-mute transition-colors hover:bg-white/5 hover:text-paper">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/offerte" className="btn-primary !min-h-[42px] !px-5 text-[14px] max-sm:hidden">
            Offerte aanvragen
            <Arrow />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobiel-menu"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line-strong lg:hidden"
          >
            <span className="sr-only">{open ? "Sluit menu" : "Open menu"}</span>
            <span aria-hidden="true" className={`absolute h-px w-[18px] bg-paper transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
            <span aria-hidden="true" className={`absolute h-px w-[18px] bg-paper transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
          </button>
        </div>
      </div>

      <div
        id="mobiel-menu"
        hidden={!open}
        className="fixed inset-x-0 top-[var(--header-h)] bottom-0 overflow-y-auto border-t border-line bg-ink/95 backdrop-blur-xl lg:hidden"
      >
        <nav aria-label="Mobiel menu" className="wrap flex min-h-full flex-col py-8">
          <ul className="divide-y divide-line border-y border-line">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={(e) => goTo(e, l.href)} className="flex items-center py-5">
                  <span className="display text-[40px]">{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/offerte" onClick={() => setOpen(false)} className="btn-primary mt-8 w-full">
            Offerte aanvragen
            <Arrow />
          </Link>
        </nav>
      </div>
    </header>
  );
}
