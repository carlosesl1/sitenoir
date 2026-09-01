export type ProjectKind = "Coding Project" | "Project" | "Event";
export type ServiceId = "sites" | "videos" | "google";

export interface Project {
  readonly slug: string;
  readonly title: string;
  readonly client: string;
  readonly year: string;
  readonly kind: ProjectKind;
  readonly primaryService: ServiceId;
  readonly deliveryLabels: readonly string[];
  readonly href: `/services/${string}`;
  readonly image: `/work/${string}.webp`;
  readonly hoverImage: `/work/${string}.webp`;
  readonly imageAlt: string;
}

export const serviceGroups = [
  { id: "sites", index: "01", title: "Sites" },
  { id: "videos", index: "02", title: "Vídeos" },
  { id: "google", index: "03", title: "Presença no Google" },
] as const satisfies readonly {
  readonly id: ServiceId;
  readonly index: string;
  readonly title: string;
}[];

export const projects = [
  {
    slug: "together-site",
    title: "Together",
    client: "Together",
    year: "2026",
    kind: "Coding Project",
    primaryService: "sites",
    deliveryLabels: ["Site", "Desenvolvimento"],
    href: "/services/together-site",
    image: "/work/together-site-main.webp",
    hoverImage: "/work/together-site-hover.webp",
    imageAlt: "Mockup editorial do site da Together sobre composição branca, preta e amarela",
  },
  {
    slug: "madeireira-fortaleza",
    title: "Madeireira Fortaleza",
    client: "Madeireira Fortaleza",
    year: "2026",
    kind: "Coding Project",
    primaryService: "sites",
    deliveryLabels: ["Site", "Desenvolvimento"],
    href: "/services/madeireira-fortaleza",
    image: "/work/madeireira-fortaleza-main.webp",
    hoverImage: "/work/madeireira-fortaleza-hover.webp",
    imageAlt: "Mockup editorial do site da Madeireira Fortaleza em cenário escuro com madeira",
  },
  {
    slug: "jr-express",
    title: "JR Express",
    client: "JR Express",
    year: "2026",
    kind: "Coding Project",
    primaryService: "sites",
    deliveryLabels: ["Site", "Desenvolvimento"],
    href: "/services/jr-express",
    image: "/work/jr-express-main.webp",
    hoverImage: "/work/jr-express-hover.webp",
    imageAlt: "Mockup digital do site da JR Express com linguagem visual de logística",
  },
  {
    slug: "strong",
    title: "Strong",
    client: "Strong",
    year: "2026",
    kind: "Project",
    primaryService: "videos",
    deliveryLabels: ["Vídeo", "Motion design"],
    href: "/services/strong",
    image: "/work/strong-main.webp",
    hoverImage: "/work/strong-hover.webp",
    imageAlt: "Composição visual dos vídeos de suplementos e performance da Strong",
  },
  {
    slug: "together-motion",
    title: "Migração Privacy Tools",
    client: "Together",
    year: "2026",
    kind: "Project",
    primaryService: "videos",
    deliveryLabels: ["Vídeo", "Motion design"],
    href: "/services/together-motion",
    image: "/work/together-motion-main.webp",
    hoverImage: "/work/together-motion-hover.webp",
    imageAlt: "Composição editorial do vídeo de migração da Together para a Privacy Tools",
  },
  {
    slug: "ecox-hostel-cabanas",
    title: "Ecox Hostel Cabanas",
    client: "Ecox Hostel Cabanas",
    year: "2026",
    kind: "Project",
    primaryService: "videos",
    deliveryLabels: ["Vídeo", "Conteúdo"],
    href: "/services/ecox-hostel-cabanas",
    image: "/work/ecox-main.webp",
    hoverImage: "/work/ecox-hover.webp",
    imageAlt: "Composição visual dos vídeos das cabanas e experiências da Ecox",
  },
  {
    slug: "chapada-backpackers",
    title: "Chapada Backpackers",
    client: "Chapada Backpackers",
    year: "2026",
    kind: "Project",
    primaryService: "google",
    deliveryLabels: ["Google", "SEO local"],
    href: "/services/chapada-backpackers",
    image: "/work/chapada-google-main.webp",
    hoverImage: "/work/chapada-google-hover.webp",
    imageAlt: "Case de presença no Google da Chapada Backpackers com perfil e avaliação",
  },
  {
    slug: "contabil-sudoeste",
    title: "Contábil Sudoeste",
    client: "Contábil Sudoeste",
    year: "2026",
    kind: "Project",
    primaryService: "google",
    deliveryLabels: ["Google", "SEO local"],
    href: "/services/contabil-sudoeste",
    image: "/work/contabil-google-main.webp",
    hoverImage: "/work/contabil-google-hover.webp",
    imageAlt: "Fachada real da Contábil Sudoeste em uma composição diurna com rota, pin e estrelas",
  },
  {
    slug: "posto-ipiranga",
    title: "Posto Ipiranga",
    client: "Posto Ipiranga",
    year: "2026",
    kind: "Project",
    primaryService: "google",
    deliveryLabels: ["Google", "SEO local"],
    href: "/services/posto-ipiranga",
    image: "/work/posto-google-main.webp",
    hoverImage: "/work/posto-google-hover.webp",
    imageAlt: "Posto Ipiranga de Brumado em uma composição diurna com rota, pin e estrelas",
  },
] as const satisfies readonly Project[];

export function groupProjectsByService(source: readonly Project[] = projects) {
  return serviceGroups.map((service) => ({
    ...service,
    projects: source.filter((project) => project.primaryService === service.id),
  }));
}

export const reservedWorkAssets = [] as const satisfies readonly `/work/${string}.webp`[];
