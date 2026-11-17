import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/BlogIndex";
import { SiteHeader } from "@/components/header/SiteHeader";
import { getAllBlogPosts, toBlogPostSummary } from "@/features/blog/posts";
import { PrincipleSceneProvider } from "@/features/principles/PrincipleSceneProvider";
import { ScrollProvider } from "@/features/scroll/ScrollProvider";

export const metadata: Metadata = {
  title: "Blog | NOIR DIGITAL",
  description:
    "Artigos da NOIR Digital sobre posicionamento, design, sites, Google e tecnologia para empresas que querem crescer.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  return (
    <ScrollProvider>
      <PrincipleSceneProvider>
        <SiteHeader sectionLinksBase="/" />
        <main id="main-content">
          <BlogIndex posts={getAllBlogPosts().map(toBlogPostSummary)} />
        </main>
      </PrincipleSceneProvider>
    </ScrollProvider>
  );
}
