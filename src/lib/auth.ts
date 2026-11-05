import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Eenvoudige beheerdersauthenticatie met één wachtwoord.
 * Nodig: ADMIN_PASSWORD en ADMIN_SESSION_SECRET (minimaal 32 tekens).
 * De sessie is een ondertekende cookie; elke beheerpagina en -actie controleert hem.
 */

export const SESSION_COOKIE = "studio_admin";
const SESSION_HOURS = 12;

export function authConfigError(): string | null {
  const pw = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (pw.length < 12) return "ADMIN_PASSWORD ontbreekt of is korter dan 12 tekens.";
  if (secret.length < 32) return "ADMIN_SESSION_SECRET ontbreekt of is korter dan 32 tekens.";
  return null;
}

function sign(payload: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET as string).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function checkPassword(input: string) {
  if (authConfigError()) return false;
  // Vergelijk HMAC's zodat de lengte van het wachtwoord niet uitlekt.
  return safeEqual(sign(`pw:${input}`), sign(`pw:${process.env.ADMIN_PASSWORD}`));
}

export async function createSession() {
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = `v1.${exp}`;
  const store = await cookies();
  store.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (authConfigError()) return false;
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return false;
  const lastDot = raw.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = raw.slice(0, lastDot);
  const sig = raw.slice(lastDot + 1);
  if (!safeEqual(sig, sign(payload))) return false;
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

/** Gebruik bovenaan elke beheerpagina en in elke beheeractie. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/beheer/login");
}
