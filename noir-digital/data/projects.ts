export type ProjectKind = "Coding Project" | "Project" | "Event";
export type ServiceId = "sites" | "videos" | "google" | "social";

export interface Project {
  readonly slug: string;
  readonly title: string;
  readonly client: string;
  readonly year: string;
  readonly kind: ProjectKind;
  readonly primaryService: ServiceId;
  readonly deliveryLabels: readonly string[];
  readonly href: "/services";
  readonly image: `/work/${string}.png`;
  readonly hoverImage: `/work/${string}.png`;
  readonly imageAlt: string;
}

export const serviceGroups = [
  { id: "sites", index: "01", title: "Sites" },
  { id: "videos", index: "02", title: "Vídeos" },
  { id: "google", index: "03", title: "Presença no Google" },
  { id: "social", index: "04", title: "Redes sociais" },
] as const satisfies readonly {
  readonly id: ServiceId;
  readonly index: string;
  readonly title: string;
}[];

export const projects = [
  {
    slug: "reunimos",
    title: "Reunimos™",
    client: "Reunimos",
    year: "2024-2026",
    kind: "Coding Project",
    primaryService: "sites",
    deliveryLabels: ["Site", "Sistema"],
    href: "/services",
    image: "/work/reunimos01.png",
    hoverImage: "/work/reunimos02.png",
    imageAlt: "Mosaico de interfaces e marcas reunidas no projeto Reunimos",
  },
  {
    slug: "inspire-mono",
    title: "Inspire Mono",
    client: "Inspire Mono",
    year: "2025",
    kind: "Coding Project",
    primaryService: "sites",
    deliveryLabels: ["Site", "Identidade"],
    href: "/services",
    image: "/work/inspire_mono_01.png",
    hoverImage: "/work/inspire_mono_02.png",
    imageAlt: "Tipografia preta sobre composição geométrica laranja e cinza",
  },
  {
    slug: "wasm-design-utils",
    title: "Wasm design utils",
    client: "Wasm design utils",
    year: "2025",
    kind: "Coding Project",
    primaryService: "sites",
    deliveryLabels: ["Site", "Tecnologia"],
    href: "/services",
    image: "/work/wasm01.png",
    hoverImage: "/work/wasm02.png",
    imageAlt: "Ícone azul translúcido sobre fundo preto",
  },
  {
    slug: "vectorsymbols",
    title: "VectorSymbols",
    client: "VectorSymbols",
    year: "2023",
    kind: "Coding Project",
    primaryService: "videos",
    deliveryLabels: ["Vídeo", "Motion"],
    href: "/services",
    image: "/work/vs01.png",
    hoverImage: "/work/vs02.png",
    imageAlt: "Conjunto de símbolos vetoriais em lilás e amarelo",
  },
  {
    slug: "darkside",
    title: "DarkSide",
    client: "DarkSide",
    year: "2021",
    kind: "Coding Project",
    primaryService: "videos",
    deliveryLabels: ["Vídeo", "Conteúdo"],
    href: "/services",
    image: "/work/ds01.png",
    hoverImage: "/work/ds02.png",
    imageAlt: "Telas do plugin DarkSide em gradiente azul e amarelo",
  },
  {
    slug: "adrive",
    title: "aDrive 阿里云盘",
    client: "aDrive",
    year: "2020-2022",
    kind: "Project",
    primaryService: "google",
    deliveryLabels: ["Google", "Presença digital"],
    href: "/services",
    image: "/work/ali01.png",
    hoverImage: "/work/ali02.png",
    imageAlt: "Interface móvel do aDrive com calendário e atalhos",
  },
  {
    slug: "shore-icon",
    title: "Shore Icon",
    client: "Shore Icon",
    year: "2022",
    kind: "Project",
    primaryService: "google",
    deliveryLabels: ["Google", "Conteúdo local"],
    href: "/services",
    image: "/work/si.png",
    hoverImage: "/work/si02.png",
    imageAlt: "Grade de ícones brancos sobre fundo preto",
  },
  {
    slug: "teambition",
    title: "Teambition",
    client: "Teambition",
    year: "2018-2020",
    kind: "Project",
    primaryService: "social",
    deliveryLabels: ["Redes sociais", "Conteúdo"],
    href: "/services",
    image: "/work/c4.png",
    hoverImage: "/work/c4.png",
    imageAlt: "Símbolo azul do Teambition sobre fundo azul",
  },
  {
    slug: "fof-see-hear-touch",
    title: "FoF: See Hear Touch",
    client: "FoF",
    year: "2022",
    kind: "Event",
    primaryService: "social",
    deliveryLabels: ["Redes sociais", "Campanha"],
    href: "/services",
    image: "/work/s01.png",
    hoverImage: "/work/s02.png",
    imageAlt: "Olhos e palavras See Hear Touch em pôster coral",
  },
  {
    slug: "fof-design-system",
    title: "FoF: Design System",
    client: "FoF",
    year: "2021",
    kind: "Event",
    primaryService: "social",
    deliveryLabels: ["Redes sociais", "Design system"],
    href: "/services",
    image: "/work/sd01.png",
    hoverImage: "/work/sd02.png",
    imageAlt: "Caracteres tridimensionais em lilás, verde e azul",
  },
] as const satisfies readonly Project[];

export function groupProjectsByService(source: readonly Project[] = projects) {
  return serviceGroups.map((service) => ({
    ...service,
    projects: source.filter((project) => project.primaryService === service.id),
  }));
}

export const reservedWorkAssets = ["/work/tt01.png", "/work/tt02.png"] as const satisfies readonly [
  `/work/${string}.png`,
  `/work/${string}.png`,
];
