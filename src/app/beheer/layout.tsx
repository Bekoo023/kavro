import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export default function BeheerRootLayout({ children }: LayoutProps<"/beheer">) {
  return <div className="min-h-svh bg-ink text-[15px]">{children}</div>;
}
