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
    readonly name: "DOLA";
    readonly role: "Designer multidisciplinar com 7 anos de experiência em design gráfico, motion design, edição de vídeo e 3D.";
    readonly contribution: string;
    readonly portrait: {
      readonly src: "/cases-v2/shared/dolomon.webp";
      readonly alt: "Retrato de DOLA";
      readonly width: 960;
      readonly height: 960;
    };
  };
  readonly cta: {
    readonly label: string;
    readonly body: string;
  };
  readonly seoDescription: string;
};

const videoCredit = (contribution: string) => ({
  name: "DOLA" as const,
  role: "Designer multidisciplinar com 7 anos de experiência em design gráfico, motion design, edição de vídeo e 3D." as const,
  contribution,
  portrait: {
    src: "/cases-v2/shared/dolomon.webp" as const,
    alt: "Retrato de DOLA" as const,
    width: 960 as const,
    height: 960 as const,
  },
});

export const caseStudiesV2: readonly CaseStudyV2[] = [
  {
    slug: "together-site",
    categoryLayout: "site",
    accent: "together-yellow",
    headline: "Privacidade explicada com clareza",
    summary:
      "Um site que organiza serviços, método e conteúdo técnico para transformar dúvidas em conversas comerciais.",
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
        title: "Técnico para quem entrega. Claro para quem decide.",
        paragraphs: [
          "Privacidade exige precisão, mas isso não obriga o visitante a enfrentar um labirinto de informação. A estrutura aproxima serviços, método e contato em uma jornada objetiva.",
        ],
      },
      {
        type: "evidence",
        id: "experiencia",
        title: "Clareza em qualquer contexto",
        presentation: "device-comparison",
        media: [
          {
            kind: "image",
            src: "/cases/together-site/hero.webp",
            alt: "Abertura responsiva do site da Together",
            caption: "Proposta de valor apresentada logo no primeiro contato.",
            width: 2400,
            height: 1350,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/together-site/mobile.webp",
            alt: "Site da Together em uma tela mobile",
            caption: "Navegação preservada em desktop e dispositivos móveis.",
            width: 900,
            height: 1600,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "decisoes",
        title: "Decisões que apoiam a conversa",
        items: [
          {
            label: "Conteúdo",
            body: "Serviços e método aparecem na ordem em que ajudam a decisão.",
          },
          {
            label: "Experiência",
            body: "Cada página conduz naturalmente ao próximo passo.",
          },
          {
            label: "Estrutura",
            body: "Uma base preparada para crescer sem perder consistência.",
          },
        ],
      },
    ],
    cta: {
      label: "Planejar meu site",
      body: "Vamos estruturar um site que explique serviços complexos e facilite o início de uma conversa comercial.",
    },
    seoDescription:
      "Case do site da Together com arquitetura de conteúdo, experiência responsiva e uma jornada criada para apresentar serviços técnicos com clareza.",
  },
  {
    slug: "madeireira-fortaleza",
    categoryLayout: "site",
    accent: "madeireira-green",
    headline: "Escolher madeira começa no site",
    summary:
      "Um site que aproxima produtos, aplicações e atendimento para tornar o orçamento um passo natural da jornada.",
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
        title: "Produto antes do discurso",
        paragraphs: [
          "Quem compra madeira quer entender rapidamente o que atende sua necessidade. A navegação aproxima categorias, aplicações e atendimento sem criar barreiras desnecessárias.",
        ],
      },
      {
        type: "evidence",
        id: "catalogo",
        title: "Da escolha ao orçamento",
        presentation: "wide-sequence",
        media: [
          {
            kind: "image",
            src: "/cases/madeireira-fortaleza/hero.webp",
            alt: "Abertura do site da Madeireira Fortaleza",
            caption: "Produtos ganham destaque logo na abertura da página.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/madeireira-fortaleza/products.webp",
            alt: "Catálogo de produtos da Madeireira Fortaleza",
            caption: "Categorias facilitam comparar aplicações e materiais.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/madeireira-fortaleza/contact.webp",
            alt: "Área de contato e orçamento da Madeireira Fortaleza",
            caption: "O orçamento aparece no momento em que a decisão acontece.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "decisoes",
        title: "Decisões que facilitam a escolha",
        items: [
          {
            label: "Produto",
            body: "O catálogo organiza a exploração sem sobrecarregar o visitante.",
          },
          {
            label: "Confiança",
            body: "A apresentação aproxima a qualidade do material da credibilidade da empresa.",
          },
          {
            label: "Atendimento",
            body: "WhatsApp e orçamento permanecem próximos da decisão.",
          },
        ],
      },
    ],
    cta: {
      label: "Criar meu site",
      body: "Vamos transformar seus produtos em uma jornada mais simples até o orçamento.",
    },
    seoDescription:
      "Case do site da Madeireira Fortaleza com organização de catálogo, aplicações dos produtos e uma jornada pensada para facilitar solicitações de orçamento.",
  },
  {
    slug: "jr-express",
    categoryLayout: "site",
    accent: "jr-red-blue",
    headline: "Cotar começa com confiança",
    summary:
      "Um site que apresenta capacidade logística com clareza antes de conduzir o cliente para solicitar uma cotação.",
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
        title: "Responder antes de pedir",
        paragraphs: [
          "Quem procura uma transportadora quer entender se ela atende sua operação. O site apresenta serviços, cobertura e processo antes da solicitação da carga.",
        ],
      },
      {
        type: "evidence",
        id: "cotacao",
        title: "Cotação com contexto",
        presentation: "wide-sequence",
        media: [
          {
            kind: "image",
            src: "/cases/jr-express/hero.webp",
            alt: "Abertura do site da JR Express",
            caption: "A proposta de valor aparece antes do formulário.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/jr-express/services.webp",
            alt: "Serviços apresentados no site da JR Express",
            caption: "Os serviços explicam a operação de forma objetiva.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/jr-express/quote.webp",
            alt: "Formulário de cotação da JR Express",
            caption: "A solicitação reúne apenas as informações essenciais.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "decisoes",
        title: "Decisões que preparam a cotação",
        items: [
          {
            label: "Clareza",
            body: "A apresentação reduz dúvidas antes do contato.",
          },
          {
            label: "Operação",
            body: "A jornada acompanha a lógica de quem precisa transportar.",
          },
          {
            label: "Conversão",
            body: "O formulário recebe informações mais organizadas para o atendimento.",
          },
        ],
      },
    ],
    cta: {
      label: "Planejar uma presença",
      body: "Vamos criar um site que ajude seu cliente a chegar à cotação com mais confiança.",
    },
    seoDescription:
      "Case do site da JR Express com arquitetura voltada à apresentação dos serviços logísticos e uma jornada construída para facilitar solicitações de cotação.",
  },
  {
    slug: "strong",
    categoryLayout: "video",
    accent: "strong-spectrum",
    headline: "Uma campanha. Três decisões de compra.",
    summary:
      "Três vídeos verticais apresentam linhas de produto com unidade visual e argumentos próprios para cada versão.",
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
        title: "Cada produto merece seu momento",
        paragraphs: [
          "Uma campanha funciona melhor quando mantém reconhecimento sem repetir a mesma peça. Cada vídeo destaca um atributo diferente enquanto preserva a identidade da marca.",
        ],
      },
      {
        type: "evidence",
        id: "filmes",
        title: "Consistência sem repetição",
        presentation: "campaign",
        media: [
          {
            kind: "video",
            src: "/cases/strong/strong-whey-types.mp4",
            poster: "/cases/strong/strong-whey-types.webp",
            alt: "Vídeo Strong Whey Types",
            caption: "Cada produto recebe uma narrativa própria.",
            width: 720,
            height: 1280,
          },
          {
            kind: "video",
            src: "/cases/strong/gladiator-ultra.mp4",
            poster: "/cases/strong/gladiator-ultra.webp",
            alt: "Vídeo Gladiator Ultra da Strong",
            caption: "Movimento e tipografia mantêm a marca reconhecível.",
            width: 720,
            height: 1280,
          },
          {
            kind: "video",
            src: "/cases/strong/cinco-sabores.mp4",
            poster: "/cases/strong/cinco-sabores.webp",
            alt: "Vídeo cinco sabores da Strong",
            caption: "A campanha preserva unidade entre diferentes versões.",
            width: 720,
            height: 1280,
          },
        ],
      },
      {
        type: "insights",
        id: "direcao",
        title: "Decisões da campanha",
        items: [
          {
            label: "Reconhecimento",
            body: "A identidade permanece consistente mesmo com mensagens diferentes.",
          },
          {
            label: "Produto",
            body: "Os principais atributos continuam legíveis durante toda a edição.",
          },
          {
            label: "Campanha",
            body: "As peças funcionam juntas sem parecer variações da mesma execução.",
          },
        ],
      },
    ],
    credit: videoCredit(
      "Na campanha Strong, uniu direção visual, motion e edição para dar identidade própria a cada produto e manter unidade entre as três peças.",
    ),
    cta: {
      label: "Criar uma campanha",
      body: "Vamos apresentar seus produtos com vídeos pensados para gerar atenção e facilitar a escolha.",
    },
    seoDescription:
      "Case da campanha em vídeo da Strong com três peças verticais que apresentam diferentes produtos mantendo unidade visual e reconhecimento de marca.",
  },
  {
    slug: "together-motion",
    categoryLayout: "video",
    accent: "together-blue",
    headline: "Um processo técnico que faz sentido",
    summary:
      "Um motion que organiza um processo técnico em uma narrativa visual clara para facilitar sua compreensão.",
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
        title: "Explicar sem aumentar a complexidade",
        paragraphs: [
          "Processos técnicos costumam afastar quem precisa entendê-los rapidamente. A narrativa organiza cada etapa para que o funcionamento seja compreendido antes dos detalhes.",
        ],
      },
      {
        type: "evidence",
        id: "filme",
        title: "O processo em sequência",
        presentation: "single-film",
        media: [
          {
            kind: "video",
            src: "/cases/together-motion/migracao-privacy-tools.mp4",
            poster: "/cases/together-motion/migracao-privacy-tools.webp",
            alt: "Motion de migração da Together para a Privacy Tools",
            caption: "Exportação, tratamento e importação apresentados em ordem.",
            width: 1280,
            height: 720,
          },
        ],
      },
      {
        type: "insights",
        id: "direcao",
        title: "Decisões da narrativa",
        items: [
          {
            label: "Clareza",
            body: "Cada etapa prepara naturalmente a próxima.",
          },
          {
            label: "Leitura",
            body: "O movimento orienta a atenção sem competir com a informação.",
          },
          {
            label: "Marca",
            body: "Together e Privacy Tools preservam papéis e hierarquia visual.",
          },
        ],
      },
    ],
    credit: videoCredit(
      "No projeto da Together, combinou design, motion e edição para transformar um processo técnico em uma narrativa visual clara e fácil de acompanhar.",
    ),
    cta: {
      label: "Explicar em vídeo",
      body: "Vamos transformar processos complexos em apresentações fáceis de entender.",
    },
    seoDescription:
      "Case do motion da Together para a Privacy Tools com narrativa visual criada para explicar um processo técnico de forma clara e organizada.",
  },
  {
    slug: "ecox-hostel-cabanas",
    categoryLayout: "video",
    accent: "ecox-earth",
    headline: "A experiência começa antes da reserva",
    summary:
      "Dois vídeos verticais apresentam ambiente, estrutura e atmosfera para aproximar o visitante da decisão de reservar.",
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
        title: "Mostrar antes de convencer",
        paragraphs: [
          "Quem procura hospedagem tenta imaginar como será a experiência. Os vídeos combinam cenário, detalhes e informação prática para tornar essa decisão mais natural.",
        ],
      },
      {
        type: "evidence",
        id: "filmes",
        title: "Atmosfera que aproxima",
        presentation: "paired-films",
        media: [
          {
            kind: "video",
            src: "/cases/ecox-hostel-cabanas/nova-cabana.mp4",
            poster: "/cases/ecox-hostel-cabanas/nova-cabana.webp",
            alt: "Vídeo da nova cabana da ECOX",
            caption: "A novidade é apresentada por ambientes e detalhes.",
            width: 720,
            height: 1280,
          },
          {
            kind: "video",
            src: "/cases/ecox-hostel-cabanas/o-que-voce-encontra.mp4",
            poster: "/cases/ecox-hostel-cabanas/o-que-voce-encontra.webp",
            alt: "Vídeo sobre a estrutura das cabanas da ECOX",
            caption: "As comodidades aparecem dentro da experiência.",
            width: 720,
            height: 1280,
          },
        ],
      },
      {
        type: "insights",
        id: "direcao",
        title: "Decisões dos filmes",
        items: [
          {
            label: "Experiência",
            body: "Os ambientes ajudam o visitante a imaginar a estadia.",
          },
          {
            label: "Estrutura",
            body: "As comodidades aparecem sem interromper a narrativa.",
          },
          {
            label: "Descoberta",
            body: "As peças funcionam tanto para apresentação quanto para divulgação de novidades.",
          },
        ],
      },
    ],
    credit: videoCredit(
      "Nos vídeos da ECOX, combinou design, motion e edição para apresentar espaços, detalhes e atmosfera com uma linguagem envolvente e coerente com a hospedagem.",
    ),
    cta: {
      label: "Produzir vídeos",
      body: "Vamos transformar sua hospedagem em uma experiência que começa antes da reserva.",
    },
    seoDescription:
      "Case dos vídeos da ECOX Hostel Cabanas com narrativa vertical voltada à apresentação da estrutura, atmosfera e experiência de hospedagem.",
  },
  {
    slug: "chapada-backpackers",
    categoryLayout: "google",
    accent: "chapada-green",
    headline: "Ser escolhida durante a busca",
    summary:
      "Um perfil organizado para apresentar localização, estrutura e informações essenciais quando o viajante compara hospedagens.",
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
        title: "Responder enquanto comparam",
        paragraphs: [
          "Quem procura hospedagem quer confirmar rapidamente se encontrou o lugar certo. O perfil reúne informações, imagens e localização no momento em que essa decisão acontece.",
        ],
      },
      {
        type: "evidence",
        id: "jornada",
        title: "Da pesquisa à reserva",
        presentation: "search-journey",
        media: [
          {
            kind: "image",
            src: "/cases/chapada-backpackers/search.webp",
            alt: "Busca local pela Chapada Backpackers",
            caption: "Identidade e categoria apresentadas com clareza.",
            width: 1265,
            height: 712,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/chapada-backpackers/profile.webp",
            alt: "Perfil da Chapada Backpackers no Google",
            caption: "Fotos, localização e contato permanecem acessíveis durante a decisão.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "presenca",
        title: "Decisões para a busca local",
        items: [
          {
            label: "Descoberta",
            body: "O perfil acompanha quem pesquisa hospedagem na região.",
          },
          {
            label: "Confiança",
            body: "Imagens e informações reduzem dúvidas antes do contato.",
          },
          {
            label: "Ação",
            body: "Mapa, site e canais de atendimento ficam próximos da decisão.",
          },
        ],
      },
    ],
    cta: {
      label: "Fortalecer meu perfil",
      body: "Vamos organizar sua presença no Google para facilitar que novos clientes encontrem e escolham seu negócio.",
    },
    seoDescription:
      "Case da presença no Google da Chapada Backpackers com perfil estruturado para apresentar hospedagem, localização e informações essenciais na busca.",
  },
  {
    slug: "contabil-sudoeste",
    categoryLayout: "google",
    accent: "contabil-gold",
    headline: "Confiança antes da primeira ligação",
    summary:
      "Um perfil organizado para confirmar identidade, localização e atendimento antes mesmo do primeiro contato com o escritório.",
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
        title: "Transmitir segurança na busca",
        paragraphs: [
          "Antes de entrar em contato, muitas empresas verificam se o escritório existe, onde está e como atende. O perfil concentra essas informações de forma clara e consistente.",
        ],
      },
      {
        type: "evidence",
        id: "jornada",
        title: "Informação que confirma",
        presentation: "search-journey",
        media: [
          {
            kind: "image",
            src: "/cases/contabil-sudoeste/search.webp",
            alt: "Busca local pela Contábil Sudoeste",
            caption: "Nome e atividade apresentados de forma consistente.",
            width: 1265,
            height: 720,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/contabil-sudoeste/profile.webp",
            alt: "Perfil da Contábil Sudoeste no Google",
            caption: "Endereço, imagens e contato reforçam a presença local.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "presenca",
        title: "Decisões que reforçam confiança",
        items: [
          {
            label: "Identidade",
            body: "As informações ajudam a reconhecer o escritório com facilidade.",
          },
          {
            label: "Presença local",
            body: "O endereço reforça a atuação regional.",
          },
          {
            label: "Contato",
            body: "Os canais de atendimento ficam disponíveis no momento da decisão.",
          },
        ],
      },
    ],
    cta: {
      label: "Organizar meu Google",
      body: "Vamos organizar seu Perfil da Empresa para transmitir confiança antes da primeira ligação.",
    },
    seoDescription:
      "Case da presença no Google da Contábil Sudoeste com perfil estruturado para reforçar identidade, localização e canais de atendimento.",
  },
  {
    slug: "posto-ipiranga",
    categoryLayout: "google",
    accent: "ipiranga-yellow-blue",
    headline: "Informação útil no caminho",
    summary:
      "Um perfil pensado para quem precisa confirmar localização, estrutura e serviços antes de seguir a rota.",
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
        title: "Decidir com poucos cliques",
        paragraphs: [
          "Quem procura um posto normalmente precisa decidir rápido. O perfil reúne informações práticas para confirmar o destino antes do deslocamento.",
        ],
      },
      {
        type: "evidence",
        id: "jornada",
        title: "Da busca à rota",
        presentation: "search-journey",
        media: [
          {
            kind: "image",
            src: "/cases/posto-ipiranga/search.webp",
            alt: "Busca local pelo Posto Ipiranga",
            caption: "Localização apresentada no contexto da pesquisa.",
            width: 1425,
            height: 900,
            fit: "contain",
          },
          {
            kind: "image",
            src: "/cases/posto-ipiranga/profile.webp",
            alt: "Perfil do Posto Ipiranga no Google",
            caption: "Fotos, endereço e rota permanecem acessíveis durante a decisão.",
            width: 1600,
            height: 900,
            fit: "contain",
          },
        ],
      },
      {
        type: "insights",
        id: "presenca",
        title: "Decisões para quem está em movimento",
        items: [
          {
            label: "Proximidade",
            body: "O perfil responde às buscas feitas durante o deslocamento.",
          },
          {
            label: "Verificação",
            body: "Fotos e informações ajudam o motorista a confirmar que chegou ao lugar certo.",
          },
          {
            label: "Decisão",
            body: "As informações essenciais permanecem disponíveis em um único lugar.",
          },
        ],
      },
    ],
    cta: {
      label: "Melhorar minha presença",
      body: "Vamos estruturar seu perfil para facilitar que clientes encontrem seu negócio quando mais precisam.",
    },
    seoDescription:
      "Case da presença no Google do Posto Ipiranga com perfil organizado para apresentar localização, estrutura e informações úteis em buscas locais.",
  },
];

export function getCaseStudyV2(slug: string): CaseStudyV2 | undefined {
  return caseStudiesV2.find((study) => study.slug === slug);
}

export function getCaseStudyV2Navigation(slug: CaseStudySlug) {
  const index = caseStudiesV2.findIndex((study) => study.slug === slug);
  return {
    previous: index > 0 ? caseStudiesV2[index - 1] : undefined,
    next: index >= 0 && index < caseStudiesV2.length - 1 ? caseStudiesV2[index + 1] : undefined,
  };
}
