export type ClientLogo = {
  readonly id: string;
  readonly label: string;
  readonly image: `/clients/${string}`;
  readonly aspectRatio: number;
};

type PrincipleCopyStage<Stage extends "seg0-primary" | "seg0-secondary" | "seg1"> = {
  readonly kind: "copy";
  readonly stage: Stage;
  readonly lines: readonly [string, string, string];
};

export type PrincipleStage =
  | PrincipleCopyStage<"seg0-primary">
  | PrincipleCopyStage<"seg0-secondary">
  | PrincipleCopyStage<"seg1">
  | {
      readonly kind: "terminal";
      readonly stage: "end";
    };

export type SocialLink = {
  readonly label: "Instagram" | "LinkedIn";
  readonly href:
    | "https://www.instagram.com/agencianoirdigital/"
    | "https://www.linkedin.com/company/noirdigital1/";
};

export const heroLabels = ["Design", "Tecnologia", "Posicionamento"] as const;

export const heroSupportLines = ["Visibilidade para vender.", "Tecnologia para crescer."] as const;

export const heroDescriptionLines = [
  "Unimos posicionamento, design e tecnologia para",
  "tornar sua empresa mais fácil de encontrar, mais",
  "confiável de escolher e mais eficiente para crescer.",
] as const;

export const heroHeadlineLines = ["A estrutura digital", "para sua empresa", "crescer"] as const;

export const clientLogos = [
  {
    id: "elite-engenharia",
    label: "Elite Engenharia",
    image: "/clients/elite-engenharia.svg",
    aspectRatio: 2.98,
  },
  {
    id: "passo-reforma",
    label: "Passo Reforma",
    image: "/clients/passo-reforma.svg",
    aspectRatio: 3.61,
  },
  {
    id: "posto-sao-cristovao",
    label: "Posto São Cristóvão",
    image: "/clients/posto-sao-cristovao.svg",
    aspectRatio: 3.72,
  },
  {
    id: "marca-simbolo",
    label: "Marca parceira",
    image: "/clients/marca-simbolo.svg",
    aspectRatio: 1.32,
  },
  {
    id: "together",
    label: "Together",
    image: "/clients/together.svg",
    aspectRatio: 2.88,
  },
  {
    id: "jr-express",
    label: "JR Express",
    image: "/clients/jr-express.svg",
    aspectRatio: 6.77,
  },
  {
    id: "chapada-backpackers",
    label: "Chapada Backpackers",
    image: "/clients/chapada-backpackers.png",
    aspectRatio: 3.57,
  },
  {
    id: "madeireira-fortaleza",
    label: "Madeireira Fortaleza",
    image: "/clients/madeireira-fortaleza.png",
    aspectRatio: 3.49,
  },
  { id: "quap", label: "Quap", image: "/clients/quap.png", aspectRatio: 3.64 },
  {
    id: "ecohotel-cabanas",
    label: "Ecohotel Cabanas",
    image: "/clients/ecohotel-cabanas.svg",
    aspectRatio: 1.46,
  },
  {
    id: "strong",
    label: "Strong",
    image: "/clients/strong.svg",
    aspectRatio: 3.38,
  },
  {
    id: "salled",
    label: "Salled",
    image: "/clients/salled.png",
    aspectRatio: 2.26,
  },
  {
    id: "contabil-sudoeste",
    label: "Contábil Sudoeste",
    image: "/clients/contabil-sudoeste.png",
    aspectRatio: 4.77,
  },
] as const satisfies readonly ClientLogo[];

export const serviceContent = {
  eyebrow: "Serviços",
  heading: "Serviços que estruturam sua empresa para crescer",
  headingLines: ["Serviços que", "estruturam sua", "empresa para", "crescer"],
} as const;

export const principleStages = [
  {
    kind: "copy",
    stage: "seg0-primary",
    lines: ["Posicionamento", "Para ser", "encontrado."],
  },
  {
    kind: "copy",
    stage: "seg0-secondary",
    lines: ["Design", "Para gerar", "confiança."],
  },
  {
    kind: "copy",
    stage: "seg1",
    lines: ["Tecnologia", "Para crescer", "com eficiência."],
  },
  {
    kind: "terminal",
    stage: "end",
  },
] as const satisfies readonly PrincipleStage[];

export const principleStatements = [
  ["Construímos o futuro", "digital da sua marca."],
  ["Estratégia, design", "e tecnologia."],
  ["Clareza para decidir.", "Precisão para crescer."],
  ["Evolução contínua.", "Impacto duradouro."],
] as const satisfies readonly (readonly [string, string])[];

export const contactHeadlineLines = ["O PRÓXIMO PASSO", "DO SEU NEGÓCIO", "COMEÇA AQUI."] as const;

export const contactEmail = "contato@noirdigital.com.br";

export const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/agencianoirdigital/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/noirdigital1/" },
] as const satisfies readonly SocialLink[];
