"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/beheer", label: "Overzicht", icon: "grid", exact: true },
  { href: "/beheer/aanvragen", label: "Aanvragen", icon: "inbox" },
  { href: "/beheer/agenda", label: "Agenda", icon: "calendar" },
  { href: "/beheer/projecten", label: "Projecten", icon: "image" },
] as const;

type Icon = (typeof ITEMS)[number]["icon"];

export function AdminNav({ newCount }: { newCount: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Beheer" className="flex gap-1 lg:flex-col">
      {ITEMS.map((item) => {
        const active = "exact" in item && item.exact ? path === item.href : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group flex min-h-10 items-center gap-3 rounded-xl px-3 text-[14.5px] whitespace-nowrap transition-colors ${
              active ? "bg-white/[0.07] text-paper" : "text-mute hover:bg-white/[0.04] hover:text-paper"
            }`}
          >
            <NavIcon name={item.icon} className={active ? "text-accent" : "text-mute-2 group-hover:text-mute"} />
            {item.label}
            {item.href === "/beheer/aanvragen" && newCount > 0 && (
              <span className="ml-auto rounded-full bg-accent px-1.5 text-[12px] leading-[18px] font-semibold text-ink tabular-nums">
                {newCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavIcon({ name, className = "" }: { name: Icon | "external" | "logout"; className?: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, className: `shrink-0 ${className}` } as const;
  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common}>
          <path d="M3.5 13.5 6 5.5h12l2.5 8v5h-17z" />
          <path d="M3.5 13.5h5l1.2 2.5h4.6l1.2-2.5h5" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <path d="m4 17 5-5 4 4 3-3 4 4" />
          <circle cx="15.5" cy="9" r="1.5" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" />
        </svg>
      );
  }
}
