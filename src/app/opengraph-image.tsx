import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { media } from "@/config/media";
import { site } from "@/config/site";

export const alt = `${site.name}: PPF, chrome delete en window tinting`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const dataUrl = async (file: string, type: string) =>
  readFile(path.join(process.cwd(), "public", file))
    .then((b) => `data:${type};base64,${b.toString("base64")}`)
    .catch(() => null);

// Deelafbeelding voor WhatsApp, LinkedIn enz.: de hero-foto met logo en kop.
export default async function OgImage() {
  const [font, photo, logo] = await Promise.all([
    readFile(path.join(process.cwd(), "src/fonts/BarlowCondensed-Medium.woff")).catch(() => null),
    dataUrl(media.hero.poster.src, "image/jpeg"),
    dataUrl(site.logo.src, "image/png"),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0b0c0d", color: "#F4F2EE" }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }} />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "linear-gradient(90deg, rgba(11,12,13,0.94) 0%, rgba(11,12,13,0.8) 50%, rgba(11,12,13,0.35) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: "100%" }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" width={200} height={(200 * site.logo.height) / site.logo.width} />
          ) : (
            <div style={{ fontSize: 36 }}>{site.name}</div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 112, lineHeight: 0.95, textTransform: "uppercase", fontFamily: "Barlow" }}>Strak tot in het detail.</div>
            <div style={{ marginTop: 28, fontSize: 34, color: "#B8B5AE" }}>PPF, chrome delete en window tinting</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Barlow", data: font, weight: 500 }] : undefined },
  );
}
