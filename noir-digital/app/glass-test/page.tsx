import type { Metadata } from "next";

import { GlassComparison } from "@/components/glass-test/GlassComparison";

export const metadata: Metadata = {
  title: "Glass Test | NOIR DIGITAL",
  robots: { follow: false, index: false },
};

export default function GlassTestPage() {
  return <GlassComparison />;
}
