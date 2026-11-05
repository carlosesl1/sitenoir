import type { Metadata } from "next";

import { SiteHeader } from "@/components/header/SiteHeader";
import { ServicesArticle } from "@/components/services/ServicesArticle";
import { PrincipleSceneProvider } from "@/features/principles/PrincipleSceneProvider";
import { ScrollProvider } from "@/features/scroll/ScrollProvider";

export const metadata: Metadata = {
  title: "Serviços | NOIR DIGITAL",
  description: "Estrutura editorial para apresentar os serviços da NOIR DIGITAL.",
};

export default function ServicesPage() {
  return (
    <ScrollProvider>
      <PrincipleSceneProvider>
        <SiteHeader sectionLinksBase="/" />
        <main id="main-content">
          <ServicesArticle />
        </main>
      </PrincipleSceneProvider>
    </ScrollProvider>
  );
}
