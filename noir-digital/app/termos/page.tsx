import type { Metadata } from "next";

import { SiteHeader } from "@/components/header/SiteHeader";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { termsOfUse } from "@/data/legal-documents";
import { PrincipleSceneProvider } from "@/features/principles/PrincipleSceneProvider";
import { ScrollProvider } from "@/features/scroll/ScrollProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Termos de Uso | NOIR DIGITAL",
  description: "Termos aplicáveis ao acesso e à utilização do site da NOIR Digital.",
  alternates: {
    canonical: "/termos",
  },
};

export default function TermsPage() {
  return (
    <ThemeProvider>
      <ScrollProvider>
        <PrincipleSceneProvider>
          <SiteHeader sectionLinksBase="/" />
          <main id="main-content">
            <LegalDocument document={termsOfUse} />
          </main>
        </PrincipleSceneProvider>
      </ScrollProvider>
    </ThemeProvider>
  );
}
