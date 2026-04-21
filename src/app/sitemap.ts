import type { MetadataRoute } from "next";
import { members as dummyMembers } from "@/lib/data";
import { SITE_URL } from "@/lib/site-url";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "/",
    "/about",
    "/members",
    "/ranking",
    "/results",
    "/prediction",
    "/live/vote",
    "/series/1",
  ];

  const memberPaths = dummyMembers.map((m) => `/members/${m.slug}`);

  return [...staticPaths, ...memberPaths].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
