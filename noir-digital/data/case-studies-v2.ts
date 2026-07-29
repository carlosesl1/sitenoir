import type { CaseStudySlug } from "@/data/case-studies";

export type CaseCategoryLayout = "site" | "video" | "google";

export type CaseAccent =
  | "together-yellow"
  | "madeireira-green"
  | "jr-red-blue"
  | "strong-spectrum"
  | "together-blue"
  | "ecox-earth"
  | "chapada-green"
  | "contabil-gold"
  | "ipiranga-yellow-blue";

export type EditorialImage = {
  readonly kind: "image";
  readonly src: `/cases${string}.webp`;
  readonly alt: string;
  readonly caption: string;
  readonly width: number;
  readonly height: number;
  readonly fit: "contain" | "cover";
};

export type EditorialVideo = {
  readonly kind: "video";
  readonly src: `/cases${string}.mp4`;
  readonly poster: `/cases${string}.webp`;
  readonly alt: string;
  readonly caption: string;
  readonly width: number;
  readonly height: number;
};

export type EditorialMedia = EditorialImage | EditorialVideo;

export type TextSection = {
  readonly type: "text";
  readonly id: string;
  readonly eyebrow?: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
};

export type EvidenceSection = {
  readonly type: "evidence";
  readonly id: string;
  readonly title: string;
  readonly presentation:
    | "wide-sequence"
    | "device-comparison"
    | "campaign"
    | "single-film"
    | "paired-films"
    | "search-journey";
  readonly media: readonly EditorialMedia[];
};

export type InsightSection = {
  readonly type: "insights";
  readonly id: string;
  readonly title: string;
  readonly items: readonly {
    readonly label: string;
    readonly body: string;
  }[];
};

export type CaseSection = TextSection | EvidenceSection | InsightSection;

export type CaseStudyV2 = {
  readonly slug: CaseStudySlug;
  readonly categoryLayout: CaseCategoryLayout;
  readonly accent: CaseAccent;
  readonly headline: string;
  readonly summary: string;
  readonly hero: EditorialImage;
  readonly sections: readonly CaseSection[];
  readonly credit?: {
    readonly name: "Dolomon";
    readonly role: "Design, motion design e edição de vídeo";
    readonly contribution: string;
  };
  readonly cta: {
    readonly label: string;
    readonly body: string;
  };
  readonly seoDescription: string;
};

const videoCredit = (contribution: string) => ({
  name: "Dolomon" as const,
  role: "Design, motion design e edição de vídeo" as const,
  contribution,
});

const siteCta = {
  label: "Planejar um site",
  body: "Organize sua presença digital para transformar interesse em uma conversa comercial.",
} as const;

const videoCta = {
  label: "Criar conteúdo em vídeo",
  body: "Apresente produtos, processos e experiências com direção, ritmo e clareza.",
} as const;

const googleCta = {
  label: "Fortalecer presença no Google",
  body: "Estruture as informações que ajudam clientes locais a encontrar e escolher sua empresa.",
} as const;

export const caseStudiesV2: readonly CaseStudyV2[] = [
  {
    slug: "together-site",
    categoryLayout: "site",
    accent: "together-yellow",
    headline: "Complexidade técnica, leitura direta",
    summary:
      "Um site que organiza privacidade, tecnologia e serviços especializados em uma jornada clara até o contato.",
    hero: {
      kind: "image",
      src: "/cases-v2/together-site/hero.webp",
      alt: "Site da Together apresentado em telas desktop e mobile",
      caption: "Interface real inserida em uma composição editorial da Together.",
      width: 2400,
      height: 1500,
      fit: "contain",
    },
    sections: [
      {
        type: "text",
        id: "desafio",
        eyebrow: "Desafio",
        title: "Explicar sem simplificar demais",
        paragraphs: [
          "Privacidade e proteção de dados exigem precisão. A arquitetura editorial separa serviços, método e caminhos de contato sem transformar o site em um documento técnico.",
        ],
      },
      {
        type: "evidence",
        id: "experiencia",
        title: "Uma experiência que se adapta ao contexto",
        presentation: "device-comparison",
        media: [
          {
            kind: "image",
            src: "/cases/together-site/hero.webp",
            alt: "Abertura responsiva do site da Together",
            caption: "A proposta de valor permanece legível em desktop e mobile.",
            width: 2400,
            height: 1350,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/together-site/mobile.webp",
            alt: "Site da Together em uma tela mobile",
            caption: "Navegação e chamadas preservadas em telas menores.",
            width: 900,
            height: 1600,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "decisoes",
        title: "Decisões do projeto",
        items: [
          {
            label: "Conteúdo",
            body: "Hierarquia para serviços técnicos e metodologia.",
          },
          {
            label: "Experiência",
            body: "Chamadas comerciais próximas do contexto.",
          },
          {
            label: "Base",
            body: "Componentes responsivos preparados para evolução.",
          },
        ],
      },
    ],
    cta: siteCta,
    seoDescription:
      "Case editorial do site da Together, com arquitetura de conteúdo e desenvolvimento responsivo.",
  },
  {
    slug: "madeireira-fortaleza",
    categoryLayout: "site",
    accent: "madeireira-green",
    headline: "Produto, confiança e orçamento no mesmo percurso",
    summary:
      "Um site que transforma variedade de produtos, confiança local e atendimento em um percurso direto até o orçamento.",
    hero: {
      kind: "image",
      src: "/cases-v2/madeireira-fortaleza/hero.webp",
      alt: "Site da Madeireira Fortaleza em composição editorial com madeira e catálogo",
      caption: "Produto real e interface organizados na mesma narrativa.",
      width: 2400,
      height: 1500,
      fit: "contain",
    },
    sections: [
      {
        type: "text",
        id: "produto",
        eyebrow: "Produto",
        title: "Mostrar a madeira antes de iniciar a conversa",
        paragraphs: [
          "A experiência aproxima produto e aplicação. Categorias, texturas e chamadas comerciais aparecem na ordem em que ajudam o cliente a avaliar e pedir atendimento.",
        ],
      },
      {
        type: "evidence",
        id: "catalogo",
        title: "Do material ao pedido de orçamento",
        presentation: "wide-sequence",
        media: [
          {
            kind: "image",
            src: "/cases/madeireira-fortaleza/hero.webp",
            alt: "Abertura do site da Madeireira Fortaleza",
            caption: "Posicionamento e produto na primeira dobra.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/madeireira-fortaleza/products.webp",
            alt: "Catálogo de produtos da Madeireira Fortaleza",
            caption: "Categorias e aplicações organizam a exploração.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/madeireira-fortaleza/contact.webp",
            alt: "Área de contato e orçamento da Madeireira Fortaleza",
            caption: "A decisão encontra um caminho direto para atendimento.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "decisoes",
        title: "Decisões do projeto",
        items: [
          {
            label: "Produto",
            body: "Categorias e aplicações ocupam o centro da narrativa.",
          },
          {
            label: "Confiança",
            body: "A linguagem visual reforça materialidade e procedência.",
          },
          {
            label: "Contato",
            body: "WhatsApp e orçamento aparecem próximos da decisão.",
          },
        ],
      },
    ],
    cta: siteCta,
    seoDescription:
      "Case do site da Madeireira Fortaleza, com catálogo, confiança local e jornada de orçamento.",
  },
  {
    slug: "jr-express",
    categoryLayout: "site",
    accent: "jr-red-blue",
    headline: "Da necessidade logística à cotação",
    summary:
      "Uma presença digital que organiza capacidade logística e conduz a necessidade do cliente até uma cotação estruturada.",
    hero: {
      kind: "image",
      src: "/cases-v2/jr-express/hero.webp",
      alt: "Site da JR Express em composição editorial de logística e cotação",
      caption: "Serviços e formulário reunidos em uma jornada objetiva.",
      width: 2400,
      height: 1500,
      fit: "contain",
    },
    sections: [
      {
        type: "text",
        id: "necessidade",
        eyebrow: "Necessidade",
        title: "Responder rápido ao que importa na logística",
        paragraphs: [
          "A página apresenta atuação, serviços e segurança antes de solicitar origem, destino e detalhes da carga.",
        ],
      },
      {
        type: "evidence",
        id: "cotacao",
        title: "Informação suficiente antes do formulário",
        presentation: "wide-sequence",
        media: [
          {
            kind: "image",
            src: "/cases/jr-express/hero.webp",
            alt: "Abertura do site da JR Express",
            caption: "Proposta de valor e acesso rápido à cotação.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/jr-express/services.webp",
            alt: "Serviços apresentados no site da JR Express",
            caption: "A operação é explicada antes da conversão.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/jr-express/quote.webp",
            alt: "Formulário de cotação da JR Express",
            caption: "Os dados essenciais chegam organizados para o atendimento.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "decisoes",
        title: "Decisões do projeto",
        items: [
          {
            label: "Clareza",
            body: "Serviços e áreas de atuação são apresentados antes do formulário.",
          },
          {
            label: "Contexto",
            body: "A interface explica a operação sem prolongar a jornada.",
          },
          {
            label: "Cotação",
            body: "Os dados essenciais chegam organizados para o atendimento.",
          },
        ],
      },
    ],
    cta: siteCta,
    seoDescription:
      "Case do site da JR Express, da apresentação dos serviços logísticos à cotação estruturada.",
  },
  {
    slug: "strong",
    categoryLayout: "video",
    accent: "strong-spectrum",
    headline: "Três produtos, uma campanha em movimento",
    summary:
      "Três peças verticais apresentam produtos, sabores e performance com unidade visual e ritmos diferentes.",
    hero: {
      kind: "image",
      src: "/cases-v2/strong/hero.webp",
      alt: "Três vídeos verticais da Strong em uma composição editorial",
      caption: "A campanha reunida como sistema, sem perder a identidade de cada peça.",
      width: 2400,
      height: 1500,
      fit: "contain",
    },
    sections: [
      {
        type: "text",
        id: "campanha",
        eyebrow: "Campanha",
        title: "Uma campanha que muda sem perder reconhecimento",
        paragraphs: [
          "Cada vídeo parte de um atributo de produto e preserva tipografia, contraste e presença da marca no formato vertical.",
        ],
      },
      {
        type: "evidence",
        id: "filmes",
        title: "Três ritmos para a mesma marca",
        presentation: "campaign",
        media: [
          {
            kind: "video",
            src: "/cases/strong/strong-whey-types.mp4",
            poster: "/cases/strong/strong-whey-types.webp",
            alt: "Vídeo Strong Whey Types",
            caption: "Tipos de whey apresentados em ritmo vertical.",
            width: 720,
            height: 1280,
          },
          {
            kind: "video",
            src: "/cases/strong/gladiator-ultra.mp4",
            poster: "/cases/strong/gladiator-ultra.webp",
            alt: "Vídeo Gladiator Ultra da Strong",
            caption: "Produto e performance em uma edição de alto contraste.",
            width: 720,
            height: 1280,
          },
          {
            kind: "video",
            src: "/cases/strong/cinco-sabores.mp4",
            poster: "/cases/strong/cinco-sabores.webp",
            alt: "Vídeo cinco sabores da Strong",
            caption: "Variação de sabores com unidade de campanha.",
            width: 720,
            height: 1280,
          },
        ],
      },
      {
        type: "insights",
        id: "direcao",
        title: "Direção da campanha",
        items: [
          {
            label: "Formato",
            body: "Composição construída para consumo em 9:16.",
          },
          {
            label: "Produto",
            body: "Embalagem e atributo permanecem legíveis em movimento.",
          },
          {
            label: "Variação",
            body: "As peças compartilham sistema sem repetir a mesma edição.",
          },
        ],
      },
    ],
    credit: videoCredit(
      "Direção visual, motion design e edição das três peças da campanha Strong.",
    ),
    cta: videoCta,
    seoDescription:
      "Case da campanha em vídeo da Strong, com três peças verticais de produto e performance.",
  },
  {
    slug: "together-motion",
    categoryLayout: "video",
    accent: "together-blue",
    headline: "Uma migração técnica em 44,9 segundos",
    summary:
      "Um motion horizontal transforma exportação, tratamento e importação em uma explicação visual objetiva.",
    hero: {
      kind: "image",
      src: "/cases-v2/together-motion/hero.webp",
      alt: "Quadros do motion de migração da Together para a Privacy Tools",
      caption: "A sequência técnica apresentada como uma narrativa única.",
      width: 2400,
      height: 1350,
      fit: "contain",
    },
    sections: [
      {
        type: "text",
        id: "sequencia",
        eyebrow: "Explicação",
        title: "Três etapas técnicas, uma sequência legível",
        paragraphs: [
          "A progressão visual reduz abstração e mantém Together e Privacy Tools identificáveis durante toda a apresentação.",
        ],
      },
      {
        type: "evidence",
        id: "filme",
        title: "O processo em movimento",
        presentation: "single-film",
        media: [
          {
            kind: "video",
            src: "/cases/together-motion/migracao-privacy-tools.mp4",
            poster: "/cases/together-motion/migracao-privacy-tools.webp",
            alt: "Motion de migração da Together para a Privacy Tools",
            caption: "Exportar, tratar e importar em uma sequência horizontal.",
            width: 1280,
            height: 720,
          },
        ],
      },
      {
        type: "insights",
        id: "direcao",
        title: "Direção do filme",
        items: [
          {
            label: "Sequência",
            body: "Exportar, tratar e importar aparecem em ordem explícita.",
          },
          {
            label: "Leitura",
            body: "Movimento orienta a atenção sem competir com a informação.",
          },
          {
            label: "Marcas",
            body: "As duas identidades mantêm hierarquia e consistência.",
          },
        ],
      },
    ],
    credit: videoCredit(
      "Design, motion design e edição da narrativa de migração para a Privacy Tools.",
    ),
    cta: videoCta,
    seoDescription:
      "Case do motion de migração da Together para a Privacy Tools, com processo técnico em sequência visual.",
  },
  {
    slug: "ecox-hostel-cabanas",
    categoryLayout: "video",
    accent: "ecox-earth",
    headline: "A estadia começa antes da reserva",
    summary:
      "Dois vídeos verticais mostram novidade, estrutura e atmosfera para antecipar a experiência da hospedagem.",
    hero: {
      kind: "image",
      src: "/cases-v2/ecox-hostel-cabanas/hero.webp",
      alt: "Dois vídeos verticais da ECOX em uma composição de floresta e cabana",
      caption: "Arquitetura, natureza e informação em uma apresentação editorial.",
      width: 2400,
      height: 1500,
      fit: "contain",
    },
    sections: [
      {
        type: "text",
        id: "experiencia",
        eyebrow: "Experiência",
        title: "Fazer o público imaginar a estadia",
        paragraphs: [
          "A edição alterna ambiente, detalhes e informação prática para aproximar descoberta e intenção de reserva.",
        ],
      },
      {
        type: "evidence",
        id: "filmes",
        title: "Novidade e estrutura em duas narrativas",
        presentation: "paired-films",
        media: [
          {
            kind: "video",
            src: "/cases/ecox-hostel-cabanas/nova-cabana.mp4",
            poster: "/cases/ecox-hostel-cabanas/nova-cabana.webp",
            alt: "Vídeo da nova cabana da ECOX",
            caption: "A novidade apresentada por ambiente e atmosfera.",
            width: 720,
            height: 1280,
          },
          {
            kind: "video",
            src: "/cases/ecox-hostel-cabanas/o-que-voce-encontra.mp4",
            poster: "/cases/ecox-hostel-cabanas/o-que-voce-encontra.webp",
            alt: "Vídeo sobre a estrutura das cabanas da ECOX",
            caption: "Comodidades e detalhes ajudam a antecipar a estadia.",
            width: 720,
            height: 1280,
          },
        ],
      },
      {
        type: "insights",
        id: "direcao",
        title: "Direção dos filmes",
        items: [
          {
            label: "Atmosfera",
            body: "Luz, madeira e paisagem apresentam a sensação do espaço.",
          },
          {
            label: "Estrutura",
            body: "Comodidades aparecem dentro de uma narrativa de experiência.",
          },
          {
            label: "Descoberta",
            body: "As peças funcionam como conteúdo de apresentação e novidade.",
          },
        ],
      },
    ],
    credit: videoCredit(
      "Design, motion design e edição dos vídeos de apresentação das cabanas.",
    ),
    cta: videoCta,
    seoDescription:
      "Case dos vídeos da ECOX Hostel Cabanas, com atmosfera, novidades e estrutura em formato vertical.",
  },
  {
    slug: "chapada-backpackers",
    categoryLayout: "google",
    accent: "chapada-green",
    headline: "Ser encontrada no momento da viagem",
    summary:
      "Perfil, imagens e localização organizados para quem procura hospedagem e experiências em Lençóis.",
    hero: {
      kind: "image",
      src: "/cases-v2/chapada-backpackers/hero.webp",
      alt: "Perfil da Chapada Backpackers em uma composição editorial de viagem",
      caption: "Busca, perfil e localização conectados à descoberta da hospedagem.",
      width: 2400,
      height: 1500,
      fit: "contain",
    },
    sections: [
      {
        type: "text",
        id: "busca",
        eyebrow: "Buscar",
        title: "Responder às perguntas de quem planeja a viagem",
        paragraphs: [
          "O perfil reúne fotos, categoria, mapa e contato no mesmo contexto em que a pessoa compara opções locais.",
        ],
      },
      {
        type: "evidence",
        id: "jornada",
        title: "Da pesquisa à rota",
        presentation: "search-journey",
        media: [
          {
            kind: "image",
            src: "/cases/chapada-backpackers/search.webp",
            alt: "Busca local pela Chapada Backpackers",
            caption: "Encontrar: identidade e presença ligadas à busca.",
            width: 1265,
            height: 712,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/chapada-backpackers/profile.webp",
            alt: "Perfil da Chapada Backpackers no Google",
            caption: "Verificar e decidir: fotos, localização e contato no perfil.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "presenca",
        title: "O que a presença organiza",
        items: [
          {
            label: "Descoberta",
            body: "O perfil conecta a busca à presença real do negócio.",
          },
          {
            label: "Verificação",
            body: "Fotos e localização ajudam a avaliar a hospedagem.",
          },
          {
            label: "Ação",
            body: "Rota, site e contato permanecem próximos da decisão.",
          },
        ],
      },
    ],
    cta: googleCta,
    seoDescription:
      "Case de presença no Google da Chapada Backpackers, com busca, perfil e localização organizados.",
  },
  {
    slug: "contabil-sudoeste",
    categoryLayout: "google",
    accent: "contabil-gold",
    headline: "Confiança local antes do primeiro contato",
    summary:
      "Identidade, endereço e contato organizados para reforçar a presença regional do escritório.",
    hero: {
      kind: "image",
      src: "/cases-v2/contabil-sudoeste/hero.webp",
      alt: "Perfil da Contábil Sudoeste em composição editorial dourada",
      caption: "Identidade e informações locais reunidas para verificação.",
      width: 2400,
      height: 1500,
      fit: "contain",
    },
    sections: [
      {
        type: "text",
        id: "busca",
        eyebrow: "Verificar",
        title: "Ser encontrada e verificada antes do atendimento",
        paragraphs: [
          "A estrutura local facilita confirmar nome, atividade, localização e canais de contato sem depender de informações dispersas.",
        ],
      },
      {
        type: "evidence",
        id: "jornada",
        title: "Da busca à confirmação do escritório",
        presentation: "search-journey",
        media: [
          {
            kind: "image",
            src: "/cases/contabil-sudoeste/search.webp",
            alt: "Busca local pela Contábil Sudoeste",
            caption: "Encontrar: nome e atividade apresentados de forma consistente.",
            width: 1265,
            height: 720,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/contabil-sudoeste/profile.webp",
            alt: "Perfil da Contábil Sudoeste no Google",
            caption: "Verificar: endereço, fotos e canais de contato disponíveis.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "presenca",
        title: "O que a presença organiza",
        items: [
          {
            label: "Identidade",
            body: "Nome e atividade aparecem de forma consistente.",
          },
          {
            label: "Região",
            body: "Endereço e contexto local aproximam a busca do escritório.",
          },
          {
            label: "Contato",
            body: "Os canais de atendimento ficam disponíveis no painel.",
          },
        ],
      },
    ],
    cta: googleCta,
    seoDescription:
      "Case de presença no Google da Contábil Sudoeste, com identidade, endereço e contato organizados.",
  },
  {
    slug: "posto-ipiranga",
    categoryLayout: "google",
    accent: "ipiranga-yellow-blue",
    headline: "Informação útil antes de seguir a rota",
    summary:
      "Localização, fotos e informações do estabelecimento reunidas para buscas de proximidade.",
    hero: {
      kind: "image",
      src: "/cases-v2/posto-ipiranga/hero.webp",
      alt: "Perfil do Posto Ipiranga em uma composição editorial de rota",
      caption: "Busca local, estrutura e deslocamento reunidos no mesmo percurso.",
      width: 2400,
      height: 1500,
      fit: "contain",
    },
    sections: [
      {
        type: "text",
        id: "busca",
        eyebrow: "Decidir",
        title: "Informação prática para uma decisão imediata",
        paragraphs: [
          "Quem procura abastecimento precisa confirmar rota, estrutura e disponibilidade com poucos passos antes da visita.",
        ],
      },
      {
        type: "evidence",
        id: "jornada",
        title: "Da proximidade ao deslocamento",
        presentation: "search-journey",
        media: [
          {
            kind: "image",
            src: "/cases/posto-ipiranga/search.webp",
            alt: "Busca local pelo Posto Ipiranga",
            caption: "Encontrar: resultado local ligado ao contexto de proximidade.",
            width: 1425,
            height: 900,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/posto-ipiranga/profile.webp",
            alt: "Perfil do Posto Ipiranga no Google",
            caption: "Decidir: endereço, rota, fotos e produtos no perfil.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "presenca",
        title: "O que a presença organiza",
        items: [
          {
            label: "Proximidade",
            body: "O perfil responde a buscas ligadas à localização.",
          },
          {
            label: "Rota",
            body: "Mapa e endereço ajudam a planejar o deslocamento.",
          },
          {
            label: "Estrutura",
            body: "Fotos e produtos antecipam o que existe no local.",
          },
        ],
      },
    ],
    cta: googleCta,
    seoDescription:
      "Case de presença no Google do Posto Ipiranga, com localização, fotos e rota organizadas.",
  },
];

export function getCaseStudyV2(slug: string): CaseStudyV2 | undefined {
  return caseStudiesV2.find((study) => study.slug === slug);
}

export function getCaseStudyV2Navigation(slug: CaseStudySlug) {
  const index = caseStudiesV2.findIndex((study) => study.slug === slug);
  return {
    previous: index > 0 ? caseStudiesV2[index - 1] : undefined,
    next:
      index >= 0 && index < caseStudiesV2.length - 1
        ? caseStudiesV2[index + 1]
        : undefined,
  };
}
