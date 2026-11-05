import Link from "next/link";
import { Arrow } from "@/components/arrow";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh items-center overflow-hidden">
      <div className="wrap relative py-24 text-center">
        <p
          aria-hidden="true"
          className="display text-[38vw] leading-none text-transparent [-webkit-text-stroke:1px_var(--color-line-strong)] md:text-[22vw]"
        >
          404
        </p>
        <h1 className="display -mt-[0.3em] text-[48px] md:text-[72px]">Pagina niet gevonden.</h1>
        <Link href="/" className="btn-primary mt-10">
          Naar de homepage
          <Arrow />
        </Link>
      </div>
    </div>
  );
}
