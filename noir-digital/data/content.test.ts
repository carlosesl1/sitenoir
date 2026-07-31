import { describe, expect, it } from "vitest";

import {
  clientLogos,
  contactEmail,
  contactHeadlineLines,
  contactPhoneDisplay,
  contactPhoneHref,
  contactWhatsAppHref,
  heroDescriptionLines,
  heroHeadlineLines,
  heroLabels,
  heroSupportLines,
  principleStages,
  principleStatements,
  serviceContent,
  socialLinks,
} from "@/data/content";

describe("homepage content", () => {
  it("preserves the complete hero copy and casing", () => {
    // Given the approved Portuguese hero content.

    // When every hero copy group is read.

    // Then its labels and line breaks remain source-faithful.
    expect({
      labels: heroLabels,
      support: heroSupportLines,
      description: heroDescriptionLines,
      headline: heroHeadlineLines,
    }).toEqual({
      labels: ["Design", "Tecnologia", "Posicionamento"],
      support: ["Visibilidade para vender.", "Tecnologia para crescer."],
      description: [
        "Unimos posicionamento, design e tecnologia para",
        "tornar sua empresa mais fácil de encontrar, mais",
        "confiável de escolher e mais eficiente para crescer.",
      ],
      headline: ["A estrutura digital", "para sua empresa", "crescer"],
    });
  });

  it("preserves the thirteen approved client logos and stable public asset paths", () => {
    expect(clientLogos).toEqual([
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
      {
        id: "quap",
        label: "Quap",
        image: "/clients/quap.png",
        aspectRatio: 3.64,
      },
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
    ]);
  });

  it("preserves the services statement", () => {
    // Given the approved services copy.

    // When the services content is read.

    // Then its eyebrow and heading retain exact punctuation and casing.
    expect(serviceContent).toEqual({
      eyebrow: "Serviços",
      heading: "Serviços que estruturam sua empresa para crescer",
      headingLines: ["Serviços que", "estruturam sua", "empresa para", "crescer"],
    });
  });

  it("models the three copy stages and copy-free terminal stage", () => {
    // Given the four source scroll states.

    // When the discriminated stage sequence is read.

    // Then the final state is terminal without invented copy.
    expect(principleStages).toEqual([
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
      { kind: "terminal", stage: "end" },
    ]);
    expect(principleStatements).toEqual([
      ["Construímos o futuro", "digital da sua marca."],
      ["Estratégia, design", "e tecnologia."],
      ["Clareza para decidir.", "Precisão para crescer."],
      ["Evolução contínua.", "Impacto duradouro."],
    ]);
  });

  it("preserves the contact headline, email, and approved social profiles", () => {
    expect(contactHeadlineLines).toEqual(["O PRÓXIMO PASSO", "DO SEU NEGÓCIO", "COMEÇA AQUI."]);
    expect(contactEmail).toBe("contato@noirdigital.com.br");
    expect(contactPhoneDisplay).toBe("+55 77 99845-3006");
    expect(contactPhoneHref).toBe("tel:+5577998453006");
    expect(contactWhatsAppHref).toContain("https://wa.me/5577998453006?text=");
    expect(socialLinks).toEqual([
      { label: "Instagram", href: "https://www.instagram.com/agencianoirdigital/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/noirdigital1/" },
    ]);
  });
});
