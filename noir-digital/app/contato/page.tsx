import type { Metadata } from "next";

import { ContactPage } from "@/components/contact/ContactPage";
import { SiteHeader } from "@/components/header/SiteHeader";
import { PrincipleSceneProvider } from "@/features/principles/PrincipleSceneProvider";
import { ScrollProvider } from "@/features/scroll/ScrollProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { LazySiteCanvas } from "@/scene/LazySiteCanvas";

export const metadata: Metadata = {
  title: "Contato | NOIR DIGITAL",
  description:
    "Conte seu projeto à NOIR Digital e encontre a estrutura certa em design, tecnologia e posicionamento.",
  alternates: {
    canonical: "/contato",
  },
};

export default function ContactRoute() {
  return (
    <ThemeProvider>
      <ScrollProvider>
        <PrincipleSceneProvider>
          <SiteHeader sectionLinksBase="/" />
          <main id="main-content">
            <ContactPage />
          </main>
          <LazySiteCanvas ambientOnly />
        </PrincipleSceneProvider>
      </ScrollProvider>
    </ThemeProvider>
  );
}
