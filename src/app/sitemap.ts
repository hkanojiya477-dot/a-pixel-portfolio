import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/projects";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/work", "/gallery", "/services", "/about", "/contact"].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }));

  const projects = await getPublishedProjects();
  return [
    ...pages,
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}`, lastModified: new Date(p.updated_at) })),
  ];
}
