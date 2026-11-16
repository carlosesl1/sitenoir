import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog/BlogArticle";
import { SiteHeader } from "@/components/header/SiteHeader";
import { getAllBlogPosts, getBlogPost, toBlogPostSummary } from "@/features/blog/posts";
import { PrincipleSceneProvider } from "@/features/principles/PrincipleSceneProvider";
import { ScrollProvider } from "@/features/scroll/ScrollProvider";

type BlogPostPageProps = {
  readonly params: Promise<{ readonly slug: string }>;
};

const RELATED_POSTS = 2;

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBlogPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  const title = `${post.title} | Blog | NOIR DIGITAL`;
  return {
    title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description: post.description,
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const posts = getAllBlogPosts();
  const post = posts.find((candidate) => candidate.slug === slug);
  if (!post) notFound();

  const others = posts.filter((candidate) => candidate.slug !== post.slug);
  const related = [
    ...others.filter((candidate) => candidate.category === post.category),
    ...others.filter((candidate) => candidate.category !== post.category),
  ]
    .slice(0, RELATED_POSTS)
    .map(toBlogPostSummary);

  return (
    <ScrollProvider>
      <PrincipleSceneProvider>
        <SiteHeader sectionLinksBase="/" />
        <main id="main-content">
          <BlogArticle post={post} related={related} />
        </main>
      </PrincipleSceneProvider>
    </ScrollProvider>
  );
}
