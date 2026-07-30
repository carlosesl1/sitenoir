import type { Metadata } from "next";

import { SiteHeader } from "@/components/header/SiteHeader";
import { ServicesArticle } from "@/components/services/ServicesArticle";
import { AudioProvider } from "@/features/audio/AudioProvider";
import { PrincipleSceneProvider } from "@/features/principles/PrincipleSceneProvider";
import { ScrollProvider } from "@/features/scroll/ScrollProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Serviços | NOIR DIGITAL",
  description: "Estrutura editorial para apresentar os serviços da NOIR DIGITAL.",
};

export default function ServicesPage() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <ScrollProvider>
          <PrincipleSceneProvider>
            <SiteHeader sectionLinksBase="/" />
            <main id="main-content">
              <ServicesArticle />
            </main>
          </PrincipleSceneProvider>
        </ScrollProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}
