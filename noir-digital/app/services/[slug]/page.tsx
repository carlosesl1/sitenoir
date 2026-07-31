import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/header/SiteHeader";
import { CaseStudyArticleV2 } from "@/components/services/case-v2/CaseStudyArticleV2";
import { caseStudiesV2, getCaseStudyV2, getCaseStudyV2Navigation } from "@/data/case-studies-v2";
import { projects } from "@/data/projects";
import { PrincipleSceneProvider } from "@/features/principles/PrincipleSceneProvider";
import { ScrollProvider } from "@/features/scroll/ScrollProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

type CasePageProps = {
  readonly params: Promise<{ readonly slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudiesV2.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyV2(slug);
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!study || !project) return {};

  const title = `${project.client} | Cases | NOIR DIGITAL`;

  return {
    title,
    description: study.seoDescription,
    openGraph: {
      title,
      description: study.seoDescription,
      images: [
        {
          url: study.hero.src,
          alt: study.hero.alt,
        },
      ],
    },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const study = getCaseStudyV2(slug);
  const project = projects.find((candidate) => candidate.slug === slug);

  if (!study || !project) {
    notFound();
  }

  return (
    <ThemeProvider>
      <ScrollProvider>
        <PrincipleSceneProvider>
          <SiteHeader sectionLinksBase="/" />
          <main id="main-content">
            <CaseStudyArticleV2
              project={project}
              study={study}
              navigation={getCaseStudyV2Navigation(study.slug)}
            />
          </main>
        </PrincipleSceneProvider>
      </ScrollProvider>
    </ThemeProvider>
  );
}
