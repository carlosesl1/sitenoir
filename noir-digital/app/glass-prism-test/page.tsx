import type { Metadata } from "next";

import { PhysicalPrismTest } from "@/components/glass-prism-test/PhysicalPrismTest";

export const metadata: Metadata = {
  title: "Physical Prism Test | NOIR DIGITAL",
  robots: { follow: false, index: false },
};

export default function GlassPrismTestPage() {
  return <PhysicalPrismTest />;
}
