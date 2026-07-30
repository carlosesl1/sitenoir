import type { projects, ServiceId } from "@/data/projects";

export type CaseStudySlug = (typeof projects)[number]["slug"];

export type CaseImage = {
  readonly kind: "image";
  readonly src: `/cases/${string}.webp`;
  readonly alt: string;
  readonly caption: string;
  readonly width: number;
  readonly height: number;
  readonly layout: "wide" | "standard";
};

export type CaseVideo = {
  readonly kind: "video";
  readonly src: `/cases/${string}.mp4`;
  readonly poster: `/cases/${string}.webp`;
  readonly alt: string;
  readonly caption: string;
  readonly width: number;
  readonly height: number;
  readonly layout: "landscape" | "portrait";
};

export type CaseMedia = CaseImage | CaseVideo;

export type CaseStudy = {
  readonly slug: CaseStudySlug;
  readonly service: ServiceId;
  readonly headline: string;
  readonly summary: string;
  readonly context: readonly string[];
  readonly deliveries: readonly {
    readonly title: string;
    readonly body: string;
  }[];
  readonly benefits: readonly string[];
  readonly media: readonly CaseMedia[];
  readonly credit?: {
    readonly name: "DOLA";
    readonly role: "Design, motion design e edição de vídeo";
  };
  readonly cta: {
    readonly label: string;
    readonly body: string;
  };
  readonly seoDescription: string;
};

const videoCredit = {
  name: "DOLA",
  role: "Design, motion design e edição de vídeo",
} as const;

const googleDeliveries = [
  {
    title: "Perfil",
    body: "Cadastro e estruturação das informações essenciais do estabelecimento.",
  },
  {
    title: "Conteúdo",
    body: "Organização de fotos, categoria, localização e formas de contato.",
  },
  {
    title: "SEO local",
    body: "Base semântica e geográfica para buscas relacionadas à região e ao serviço.",
  },
] as const;

const googleCta = {
  label: "Fortalecer presença no Google",
  body: "Organize sua presença local para ser encontrado com informações claras no momento da busca.",
} as const;

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: "together-site",
    service: "sites",
    headline: "Privacidade e tecnologia com uma presença digital à altura",
    summary:
      "Um site responsivo que organiza serviços técnicos, fortalece confiança e conduz empresas até o próximo passo.",
    context: [
      "A Together atua em privacidade, proteção de dados e tecnologia — temas que exigem clareza sem perder profundidade.",
      "O projeto transformou esse repertório técnico em uma experiência digital direta, responsiva e orientada à conversa comercial.",
    ],
    deliveries: [
      {
        title: "Direção",
        body: "Arquitetura de conteúdo e linguagem visual alinhadas ao posicionamento privacy and tech.",
      },
      {
        title: "Experiência",
        body: "Hierarquia, navegação e chamadas que tornam serviços complexos mais fáceis de compreender.",
      },
      {
        title: "Implementação",
        body: "Desenvolvimento responsivo, componentes reutilizáveis e base preparada para evolução.",
      },
    ],
    benefits: [
      "Explica serviços especializados com mais clareza.",
      "Reforça confiança antes do primeiro contato.",
      "Cria caminhos objetivos para diagnóstico e proposta.",
    ],
    media: [
      {
        kind: "image",
        src: "/cases/together-site/hero.webp",
        alt: "Site da Together exibido em desktop e celular",
        caption: "Experiência responsiva para serviços de privacidade e tecnologia.",
        width: 2400,
        height: 1350,
        layout: "wide",
      },
      {
        kind: "image",
        src: "/cases/together-site/full-page.webp",
        alt: "Página completa do site da Together",
        caption: "Arquitetura editorial e sequência de conteúdo da página.",
        width: 1600,
        height: 3200,
        layout: "standard",
      },
      {
        kind: "image",
        src: "/cases/together-site/mobile.webp",
        alt: "Abertura do site da Together em celular",
        caption: "Conteúdo e chamadas preservados em telas menores.",
        width: 900,
        height: 1600,
        layout: "standard",
      },
    ],
    cta: {
      label: "Planejar um site",
      body: "Transforme conhecimento e diferenciais em uma presença digital clara, confiável e pronta para crescer.",
    },
    seoDescription:
      "Case do site da Together: estratégia, design e desenvolvimento responsivo para privacidade e tecnologia.",
  },
  {
    slug: "madeireira-fortaleza",
    service: "sites",
    headline: "Madeira, catálogo e orçamento em uma jornada direta",
    summary:
      "Uma presença digital que apresenta produtos, transmite confiança local e aproxima cada visita de um pedido de orçamento.",
    context: [
      "A Madeireira Fortaleza precisava organizar variedade, atendimento e confiança em uma experiência simples de consultar.",
      "O site usa a materialidade da madeira como linguagem visual e mantém produtos e contato sempre próximos da decisão.",
    ],
    deliveries: [
      {
        title: "Direção",
        body: "Identidade digital construída a partir de textura, aplicação e confiança no produto.",
      },
      {
        title: "Catálogo",
        body: "Categorias e seções organizadas para facilitar a leitura das soluções disponíveis.",
      },
      {
        title: "Conversão",
        body: "Chamadas de orçamento e contato posicionadas nos momentos de maior intenção.",
      },
    ],
    benefits: [
      "Apresenta produtos sem depender de explicações dispersas.",
      "Reforça procedência e confiança antes do atendimento.",
      "Encurta o caminho entre interesse e orçamento.",
    ],
    media: [
      {
        kind: "image",
        src: "/cases/madeireira-fortaleza/hero.webp",
        alt: "Abertura do site da Madeireira Fortaleza",
        caption: "Proposta de valor, produto e orçamento concentrados na primeira tela.",
        width: 1600,
        height: 900,
        layout: "wide",
      },
      {
        kind: "image",
        src: "/cases/madeireira-fortaleza/products.webp",
        alt: "Seção de produtos da Madeireira Fortaleza",
        caption: "Organização visual para apresentar soluções e aplicações.",
        width: 1600,
        height: 900,
        layout: "wide",
      },
      {
        kind: "image",
        src: "/cases/madeireira-fortaleza/contact.webp",
        alt: "Área de orçamento e contato do site",
        caption: "Próximo passo comercial visível e acessível.",
        width: 1600,
        height: 900,
        layout: "wide",
      },
    ],
    cta: {
      label: "Planejar um site",
      body: "Organize produtos, diferenciais e contato em uma experiência que ajuda o cliente a decidir.",
    },
    seoDescription:
      "Case do site da Madeireira Fortaleza: direção visual, catálogo e jornada de orçamento.",
  },
  {
    slug: "jr-express",
    service: "sites",
    headline: "Uma rota digital mais curta até a cotação",
    summary:
      "Um site de transporte que comunica capacidade, organiza serviços e reduz o atrito para solicitar uma cotação.",
    context: [
      "Quem procura transporte precisa compreender rapidamente cobertura, segurança e como iniciar a operação.",
      "O projeto reuniu essas respostas em uma jornada objetiva, com o formulário de cotação como ação central.",
    ],
    deliveries: [
      {
        title: "Direção",
        body: "Linguagem visual ligada a movimento, alcance e confiança operacional.",
      },
      {
        title: "Serviços",
        body: "Apresentação clara das soluções e dos contextos de transporte atendidos.",
      },
      {
        title: "Cotação",
        body: "Formulário e chamadas comerciais integrados à navegação principal.",
      },
    ],
    benefits: [
      "Facilita a compreensão dos serviços logísticos.",
      "Reforça confiança e capacidade operacional.",
      "Reduz etapas até o pedido de cotação.",
    ],
    media: [
      {
        kind: "image",
        src: "/cases/jr-express/hero.webp",
        alt: "Abertura do site da JR Express",
        caption: "Serviço, confiança e cotação apresentados na primeira tela.",
        width: 1600,
        height: 900,
        layout: "wide",
      },
      {
        kind: "image",
        src: "/cases/jr-express/quote.webp",
        alt: "Formulário de cotação da JR Express",
        caption: "Coleta direta das informações necessárias para iniciar o atendimento.",
        width: 1600,
        height: 900,
        layout: "wide",
      },
      {
        kind: "image",
        src: "/cases/jr-express/services.webp",
        alt: "Seção de serviços de transporte",
        caption: "Soluções logísticas organizadas para comparação rápida.",
        width: 1600,
        height: 900,
        layout: "wide",
      },
    ],
    cta: {
      label: "Planejar um site",
      body: "Transforme uma operação complexa em uma jornada digital clara até o contato comercial.",
    },
    seoDescription:
      "Case do site da JR Express: experiência digital, serviços logísticos e cotação online.",
  },
  {
    slug: "strong",
    service: "videos",
    headline: "Produtos de performance transformados em movimento",
    summary:
      "Três peças verticais que apresentam linhas, sabores e atributos da Strong com ritmo e reconhecimento para redes sociais.",
    context: [
      "Produtos de suplementação disputam atenção em poucos segundos.",
      "O trabalho combinou edição e motion para transformar informação de produto em conteúdo rápido e memorável.",
    ],
    deliveries: [
      {
        title: "Sistema visual",
        body: "Tipografia, cor e produto organizados para leitura imediata.",
      },
      {
        title: "Ritmo",
        body: "Cortes e movimentos pensados para o consumo vertical.",
      },
      {
        title: "Variações",
        body: "Três narrativas que preservam unidade sem repetir a mesma peça.",
      },
    ],
    benefits: [
      "Apresenta atributos em poucos segundos.",
      "Cria consistência entre diferentes produtos.",
      "Entrega conteúdo adequado ao formato social.",
    ],
    media: [
      {
        kind: "video",
        src: "/cases/strong/strong-whey-types.mp4",
        poster: "/cases/strong/strong-whey-types.webp",
        alt: "Vídeo Strong Whey Types",
        caption: "Tipos de whey apresentados em uma sequência vertical de produto.",
        width: 720,
        height: 1280,
        layout: "portrait",
      },
      {
        kind: "video",
        src: "/cases/strong/gladiator-ultra.mp4",
        poster: "/cases/strong/gladiator-ultra.webp",
        alt: "Vídeo Gladiator Ultra da Strong",
        caption: "Performance e identidade do Gladiator Ultra em movimento.",
        width: 720,
        height: 1280,
        layout: "portrait",
      },
      {
        kind: "video",
        src: "/cases/strong/cinco-sabores.mp4",
        poster: "/cases/strong/cinco-sabores.webp",
        alt: "Vídeo Cinco Sabores Potencial Infinito",
        caption: "Linha de sabores organizada como uma peça curta e reconhecível.",
        width: 720,
        height: 1280,
        layout: "portrait",
      },
    ],
    credit: videoCredit,
    cta: {
      label: "Criar conteúdo em vídeo",
      body: "Transforme atributos, lançamentos e histórias de produto em conteúdo visual com ritmo e clareza.",
    },
    seoDescription: "Case de motion design e edição de vídeos verticais para produtos Strong.",
  },
  {
    slug: "together-motion",
    service: "videos",
    headline: "Uma migração técnica explicada com clareza visual",
    summary:
      "Um vídeo horizontal que organiza as etapas da migração para a Privacy Tools em uma narrativa objetiva e alinhada às marcas.",
    context: [
      "Migrações de dados envolvem etapas técnicas que podem parecer abstratas para o público.",
      "O motion transformou exportação, tratamento e importação em uma sequência visual compreensível.",
    ],
    deliveries: [
      {
        title: "Roteiro visual",
        body: "Etapas técnicas convertidas em uma progressão clara.",
      },
      {
        title: "Motion",
        body: "Movimentos que orientam a leitura sem competir com a informação.",
      },
      {
        title: "Marcas",
        body: "Together e Privacy Tools apresentadas com consistência e hierarquia.",
      },
    ],
    benefits: [
      "Explica um processo técnico com menos atrito.",
      "Mantém atenção durante a apresentação das etapas.",
      "Reforça profissionalismo na comunicação da mudança.",
    ],
    media: [
      {
        kind: "video",
        src: "/cases/together-motion/migracao-privacy-tools.mp4",
        poster: "/cases/together-motion/migracao-privacy-tools.webp",
        alt: "Vídeo sobre migração para a Privacy Tools",
        caption: "Exportação, tratamento e importação organizados em 44,9 segundos.",
        width: 1280,
        height: 720,
        layout: "landscape",
      },
    ],
    credit: videoCredit,
    cta: {
      label: "Criar conteúdo em vídeo",
      body: "Torne processos e serviços técnicos mais fáceis de compreender e apresentar.",
    },
    seoDescription:
      "Case de motion design da Together para explicar a migração de dados para a Privacy Tools.",
  },
  {
    slug: "ecox-hostel-cabanas",
    service: "videos",
    headline: "A experiência da cabana antes mesmo da reserva",
    summary:
      "Dois vídeos verticais que mostram novidade, estrutura e experiência para ajudar o público a imaginar a estadia.",
    context: [
      "Hospedagem é uma decisão visual: o público precisa entender espaço, atmosfera e o que encontrará.",
      "A edição reuniu esses sinais em peças curtas, adequadas às redes e próximas da intenção de reserva.",
    ],
    deliveries: [
      {
        title: "Seleção",
        body: "Momentos e detalhes escolhidos para representar a experiência.",
      },
      {
        title: "Edição",
        body: "Ritmo vertical que mantém a leitura confortável.",
      },
      {
        title: "Conteúdo",
        body: "Uma peça de novidade e outra de apresentação da estrutura.",
      },
    ],
    benefits: [
      "Torna a acomodação mais concreta antes da visita.",
      "Valoriza detalhes que influenciam a escolha.",
      "Cria conteúdo útil para descoberta e reserva.",
    ],
    media: [
      {
        kind: "video",
        src: "/cases/ecox-hostel-cabanas/nova-cabana.mp4",
        poster: "/cases/ecox-hostel-cabanas/nova-cabana.webp",
        alt: "Vídeo Nova Cabana da ECOX",
        caption: "Apresentação vertical da nova cabana e de sua atmosfera.",
        width: 720,
        height: 1280,
        layout: "portrait",
      },
      {
        kind: "video",
        src: "/cases/ecox-hostel-cabanas/o-que-voce-encontra.mp4",
        poster: "/cases/ecox-hostel-cabanas/o-que-voce-encontra.webp",
        alt: "Vídeo sobre o que existe nas cabanas ECOX",
        caption: "Estrutura e comodidades apresentadas antes da reserva.",
        width: 720,
        height: 1280,
        layout: "portrait",
      },
    ],
    credit: videoCredit,
    cta: {
      label: "Criar conteúdo em vídeo",
      body: "Mostre a experiência do seu espaço com conteúdo que ajuda o público a se imaginar nele.",
    },
    seoDescription:
      "Case de edição de vídeos verticais para apresentar as cabanas e experiências da ECOX.",
  },
  {
    slug: "chapada-backpackers",
    service: "google",
    headline: "Encontrada por quem procura viver a Chapada",
    summary:
      "Perfil estruturado e presença local para facilitar descoberta, avaliação e contato de quem procura hospedagem em Lençóis.",
    context: [
      "Quem busca hospedagem em Lençóis compara localização, fotos, informações e avaliações antes de entrar em contato.",
      "O trabalho estruturou o Perfil da Empresa e sua base de SEO local para reunir essas respostas no momento da busca.",
    ],
    deliveries: googleDeliveries,
    benefits: [
      "Aparece com informações úteis no momento da busca.",
      "Reúne fotos, localização e contato em um único ponto.",
      "Reduz incerteza antes da escolha da hospedagem.",
    ],
    media: [
      {
        kind: "image",
        src: "/cases/chapada-backpackers/profile.webp",
        alt: "Perfil da Chapada Backpackers no Google",
        caption: "Perfil com fotos, mapa e informações reais do estabelecimento.",
        width: 1600,
        height: 900,
        layout: "wide",
      },
      {
        kind: "image",
        src: "/cases/chapada-backpackers/search.webp",
        alt: "Resultado de busca local da Chapada Backpackers",
        caption: "Presença local conectando intenção de hospedagem e informação prática.",
        width: 1265,
        height: 712,
        layout: "wide",
      },
    ],
    cta: googleCta,
    seoDescription:
      "Case de presença no Google da Chapada Backpackers: Perfil da Empresa e SEO local para hospedagem em Lençóis.",
  },
  {
    slug: "contabil-sudoeste",
    service: "google",
    headline: "Confiança local antes do primeiro atendimento",
    summary:
      "Perfil empresarial e SEO local para tornar o escritório mais fácil de encontrar e verificar na região.",
    context: [
      "Serviços contábeis dependem de confiança e de informações consistentes antes do primeiro atendimento.",
      "O perfil local organizou identidade, localização e formas de contato para aproximar buscas regionais do escritório.",
    ],
    deliveries: googleDeliveries,
    benefits: [
      "Reforça legitimidade com dados consistentes.",
      "Facilita localização e contato.",
      "Aproxima buscas regionais do atendimento contábil.",
    ],
    media: [
      {
        kind: "image",
        src: "/cases/contabil-sudoeste/profile.webp",
        alt: "Perfil da Contábil Sudoeste no Google",
        caption: "Informações do escritório reunidas no painel local.",
        width: 1600,
        height: 900,
        layout: "wide",
      },
      {
        kind: "image",
        src: "/cases/contabil-sudoeste/search.webp",
        alt: "Resultados locais da Contábil Sudoeste",
        caption: "Busca regional conectada ao perfil empresarial.",
        width: 1265,
        height: 720,
        layout: "wide",
      },
    ],
    cta: googleCta,
    seoDescription:
      "Case de presença no Google da Contábil Sudoeste: Perfil da Empresa e SEO local para atendimento regional.",
  },
  {
    slug: "posto-ipiranga",
    service: "google",
    headline: "Informação útil no momento da busca",
    summary:
      "Perfil local estruturado para apresentar localização, fotos e informações relevantes antes da visita ao posto.",
    context: [
      "Buscas por postos acontecem com intenção imediata e dependem de localização e informações fáceis de verificar.",
      "O perfil foi estruturado para reunir mapa, fotos, produtos e dados do estabelecimento em um único ponto.",
    ],
    deliveries: googleDeliveries,
    benefits: [
      "Facilita descoberta em buscas de proximidade.",
      "Ajuda a planejar rota e visita.",
      "Reúne fotos, produtos e dados do estabelecimento.",
    ],
    media: [
      {
        kind: "image",
        src: "/cases/posto-ipiranga/profile.webp",
        alt: "Perfil do Posto Ipiranga no Google",
        caption: "Painel local com mapa, fotos e informações do posto.",
        width: 1600,
        height: 900,
        layout: "wide",
      },
      {
        kind: "image",
        src: "/cases/posto-ipiranga/search.webp",
        alt: "Resultado de busca local do Posto Ipiranga",
        caption: "Presença de proximidade para quem procura abastecimento e serviços.",
        width: 1425,
        height: 900,
        layout: "wide",
      },
    ],
    cta: googleCta,
    seoDescription:
      "Case de presença no Google do Posto Ipiranga: Perfil da Empresa e SEO local para buscas de proximidade.",
  },
];

export type CaseStudyNavigation = {
  readonly previous: CaseStudy | undefined;
  readonly next: CaseStudy | undefined;
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getCaseStudyNavigation(slug: CaseStudySlug): CaseStudyNavigation {
  const index = caseStudies.findIndex((study) => study.slug === slug);

  return {
    previous: index > 0 ? caseStudies[index - 1] : undefined,
    next: index >= 0 && index < caseStudies.length - 1 ? caseStudies[index + 1] : undefined,
  };
}
