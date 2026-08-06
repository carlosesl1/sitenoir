import { preload } from "react-dom";

import { AiServicesSection } from "@/components/ai-services/AiServicesSection";
import { ContactFooter } from "@/components/contact/ContactFooter";
import { SiteHeader } from "@/components/header/SiteHeader";
import { Hero } from "@/components/hero/Hero";
import { EntryPreloader } from "@/components/preloader/EntryPreloader";
import { PrinciplesStory } from "@/components/principles/PrinciplesStory";
import { TrustStrip } from "@/components/trust/TrustStrip";
import { SelectedWork } from "@/components/work/SelectedWork";
import { PrincipleSceneProvider } from "@/features/principles/PrincipleSceneProvider";
import { ScrollProvider } from "@/features/scroll/ScrollProvider";
import { ShortcutController } from "@/features/shortcuts/ShortcutController";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { preloadCriticalHeroModels } from "@/scene/critical-hero-preload";
import { LazySiteCanvas } from "@/scene/LazySiteCanvas";

export default function Page() {
  preloadCriticalHeroModels(preload);

  return (
    <ThemeProvider>
      <ScrollProvider>
        <PrincipleSceneProvider>
          <EntryPreloader />
          <ShortcutController />
          <SiteHeader />
          <main id="main-content">
            <Hero />
            <TrustStrip />
            <SelectedWork />
            <AiServicesSection />
            <PrinciplesStory />
            <ContactFooter />
          </main>
          <LazySiteCanvas preloadDuringEntry />
        </PrincipleSceneProvider>
      </ScrollProvider>
    </ThemeProvider>
  );
}
