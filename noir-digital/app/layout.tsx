import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { preload } from "react-dom";

import { RouteTransition } from "@/components/transitions/RouteTransition";
import { themeBootstrapScript } from "@/features/theme/theme-bootstrap";

import "./globals.css";

const enableDevInspectors =
  process.env["NODE_ENV"] === "development" && process.env["DEV_INSPECTORS_ENABLED"] !== "0";

const devScriptSources = [
  {
    id: "source-context-inspector",
    integrity: process.env["DEV_SOURCE_CONTEXT_INTEGRITY"],
    src: process.env["DEV_SOURCE_CONTEXT_URL"],
  },
  {
    id: "render-diagnostics",
    integrity: process.env["DEV_RENDER_DIAGNOSTICS_INTEGRITY"],
    src: process.env["DEV_RENDER_DIAGNOSTICS_URL"],
  },
];

const title = "NOIR DIGITAL";
const description = "Digital Product Designer & Builder © 2026";

function resolveSiteUrl(value: string | undefined): URL | undefined {
  if (!value || !URL.canParse(value)) {
    return undefined;
  }

  const url = new URL(value);
  if (url.protocol !== "https:" || url.username !== "" || url.password !== "") {
    return undefined;
  }

  url.search = "";
  url.hash = "";
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  return url;
}

const siteUrl = resolveSiteUrl(process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://noirdigital.com.br");

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: [{ url: "/stickers/noir-face.png", type: "image/png" }],
    apple: [{ url: "/stickers/noir-face.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(siteUrl === undefined
    ? {}
    : {
        metadataBase: siteUrl,
        alternates: {
          canonical: siteUrl,
        },
        openGraph: {
          type: "website",
          url: siteUrl,
          title,
          description,
          siteName: "NOIR DIGITAL",
          images: [
            {
              url: new URL("/stickers/noir-face.png", siteUrl),
              width: 359,
              height: 405,
              alt: "NOIR DIGITAL",
            },
          ],
        },
      }),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3fbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#030303" },
  ],
};

type RootLayoutProps = {
  readonly children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): ReactNode {
  preload("/assets/v1/fonts/TikTokSans.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });
  preload("/assets/v1/fonts/DepartureMono.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });

  return (
    <html lang="pt-BR" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Static local bootstrap must run before the poster element is parsed. */}
        <script id="theme-bootstrap" dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        {enableDevInspectors
          ? devScriptSources.map(({ id, integrity, src }) =>
              integrity === undefined || src === undefined ? null : (
                <Script
                  key={id}
                  id={id}
                  src={src}
                  integrity={integrity}
                  crossOrigin="anonymous"
                  strategy="beforeInteractive"
                />
              ),
            )
          : null}
      </head>
      <body>
        {children}
        <RouteTransition />
      </body>
    </html>
  );
}
