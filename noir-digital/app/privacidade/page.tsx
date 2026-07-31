import type { Metadata } from "next";

import { SiteHeader } from "@/components/header/SiteHeader";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { privacyPolicy } from "@/data/legal-documents";
import { PrincipleSceneProvider } from "@/features/principles/PrincipleSceneProvider";
import { ScrollProvider } from "@/features/scroll/ScrollProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Política de Privacidade | NOIR DIGITAL",
  description:
    "Política de Privacidade da NOIR Digital e informações sobre o tratamento de dados pessoais.",
  alternates: {
    canonical: "/privacidade",
  },
};

export default function PrivacyPage() {
  return (
    <ThemeProvider>
      <ScrollProvider>
        <PrincipleSceneProvider>
          <SiteHeader sectionLinksBase="/" />
          <main id="main-content">
            <LegalDocument document={privacyPolicy} />
          </main>
        </PrincipleSceneProvider>
      </ScrollProvider>
    </ThemeProvider>
  );
}
