import { SiteFooter } from "@/components/site-footer";
import { ScrollReset } from "@/components/scroll-reset";
import { SiteHeader } from "@/components/site-header";
import { getPublishedProjectsSafe } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const projects = await getPublishedProjectsSafe();
  return (
    <>
      <a
        href="#inhoud"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
      >
        Naar de inhoud
      </a>
      <ScrollReset />
      <SiteHeader hasWork={projects.length > 0} />
      <main id="inhoud">{children}</main>
      <SiteFooter />
    </>
  );
}
