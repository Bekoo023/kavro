import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/offerte", "/privacy"].map((path) => ({ url: `${site.url}${path}` }));
}
