export type LegalInlineSegment =
  | string
  | {
      readonly kind: "strong";
      readonly text: string;
    }
  | {
      readonly href: string;
      readonly kind: "link";
      readonly text: string;
    };

export type LegalBlock =
  | {
      readonly kind: "paragraph";
      readonly segments?: readonly LegalInlineSegment[];
      readonly text?: string;
    }
  | {
      readonly items: readonly string[];
      readonly kind: "list";
    }
  | {
      readonly blocks: readonly LegalBlock[];
      readonly kind: "subsection";
      readonly title: string;
    };

export interface LegalSectionContent {
  readonly blocks: readonly LegalBlock[];
  readonly id: string;
  readonly title: string;
}

export interface LegalDocumentContent {
  readonly code: string;
  readonly counterpart: {
    readonly href: string;
    readonly label: string;
  };
  readonly description: string;
  readonly lastUpdated: string;
  readonly sections: readonly LegalSectionContent[];
  readonly title: string;
}

export const privacyPolicy: LegalDocumentContent = {
  code: "PRIVACIDADE / 01",
  title: "Política de Privacidade",
  description:
    "Informações sobre coleta, uso, armazenamento, proteção e direitos relacionados aos dados pessoais tratados pela NOIR Digital.",
  lastUpdated: "31 de julho de 2026",
  counterpart: {
    href: "/termos",
    label: "Termos de Uso",
  },
  sections: [
    {
      id: "introducao",
      title: "Introdução",
      blocks: [
        {
          kind: "paragraph",
          text: 'A NOIR Digital ("NOIR", "nós" ou "nosso") respeita a sua privacidade e está comprometida com a proteção dos dados pessoais tratados por meio deste site.',
        },
        {
          kind: "paragraph",
          text: "Esta Política de Privacidade explica quais informações coletamos, por que as coletamos, como elas são utilizadas, armazenadas e protegidas, bem como os direitos dos titulares de dados, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).",
        },
        {
          kind: "paragraph",
          text: "Ao utilizar este site, você declara estar ciente das práticas descritas nesta Política.",
        },
      ],
    },
    {
      id: "controlador-dos-dados",
      title: "Controlador dos dados",
      blocks: [
        {
          kind: "paragraph",
          text: "O controlador responsável pelo tratamento dos dados pessoais é:",
        },
        {
          kind: "paragraph",
          segments: [{ kind: "strong", text: "NOIR Digital" }],
        },
        {
          kind: "paragraph",
          text: "Caso deseje exercer seus direitos previstos na LGPD ou esclarecer dúvidas sobre esta Política, entre em contato pelos canais disponibilizados no site.",
        },
      ],
    },
    {
      id: "dados-coletados",
      title: "Quais dados coletamos",
      blocks: [
        {
          kind: "paragraph",
          text: "Podemos coletar as seguintes informações:",
        },
        {
          kind: "subsection",
          title: "Dados fornecidos pelo usuário",
          blocks: [
            {
              kind: "list",
              items: [
                "Nome",
                "E-mail",
                "Telefone",
                "Empresa",
                "Mensagens enviadas através do formulário de contato",
                "Demais informações que o próprio usuário decidir compartilhar.",
              ],
            },
          ],
        },
        {
          kind: "subsection",
          title: "Dados coletados automaticamente",
          blocks: [
            {
              kind: "paragraph",
              text: "Durante a navegação podem ser coletadas informações como:",
            },
            {
              kind: "list",
              items: [
                "endereço IP;",
                "navegador utilizado;",
                "dispositivo utilizado;",
                "páginas acessadas;",
                "tempo de permanência;",
                "origem do acesso;",
                "interações realizadas no site;",
                "cookies e identificadores semelhantes.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "finalidade-do-tratamento",
      title: "Finalidade do tratamento",
      blocks: [
        {
          kind: "paragraph",
          text: "Os dados pessoais são utilizados para:",
        },
        {
          kind: "list",
          items: [
            "responder solicitações enviadas pelo formulário;",
            "prestar atendimento comercial;",
            "elaborar propostas comerciais;",
            "manter contato com potenciais clientes;",
            "melhorar a experiência de navegação;",
            "analisar métricas de acesso e desempenho do site;",
            "garantir segurança, estabilidade e funcionamento da plataforma;",
            "cumprir obrigações legais e regulatórias.",
          ],
        },
        {
          kind: "paragraph",
          text: "Não utilizamos os dados para finalidades incompatíveis com aquelas informadas nesta Política.",
        },
      ],
    },
    {
      id: "bases-legais",
      title: "Bases legais",
      blocks: [
        {
          kind: "paragraph",
          text: "O tratamento de dados poderá ocorrer com fundamento nas seguintes bases legais previstas na LGPD:",
        },
        {
          kind: "list",
          items: [
            "consentimento do titular;",
            "execução de procedimentos preliminares relacionados à contratação de serviços;",
            "cumprimento de obrigação legal;",
            "legítimo interesse da NOIR Digital, quando aplicável;",
            "exercício regular de direitos.",
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      blocks: [
        {
          kind: "paragraph",
          text: "Este site utiliza cookies e tecnologias semelhantes para melhorar a experiência de navegação.",
        },
        {
          kind: "paragraph",
          text: "Os cookies podem ser utilizados para:",
        },
        {
          kind: "list",
          items: [
            "funcionamento do site;",
            "medição de audiência;",
            "análise de comportamento;",
            "estatísticas de acesso;",
            "campanhas de marketing.",
          ],
        },
        {
          kind: "paragraph",
          text: "O usuário poderá gerenciar ou bloquear cookies diretamente em seu navegador, observadas as limitações decorrentes dessa escolha.",
        },
      ],
    },
    {
      id: "ferramentas-utilizadas",
      title: "Ferramentas utilizadas",
      blocks: [
        {
          kind: "paragraph",
          text: "Para a operação deste site utilizamos serviços de terceiros, incluindo:",
        },
        {
          kind: "list",
          items: ["Google Analytics;", "Google Tag Manager;", "Meta Pixel;", "Cloudflare."],
        },
        {
          kind: "paragraph",
          text: "Esses serviços poderão processar informações técnicas necessárias para suas respectivas finalidades, observando suas próprias políticas de privacidade.",
        },
      ],
    },
    {
      id: "compartilhamento-de-dados",
      title: "Compartilhamento de dados",
      blocks: [
        {
          kind: "paragraph",
          text: "Os dados pessoais poderão ser compartilhados apenas quando necessário para:",
        },
        {
          kind: "list",
          items: [
            "prestação dos serviços contratados;",
            "funcionamento da infraestrutura tecnológica;",
            "cumprimento de obrigação legal;",
            "proteção de direitos da NOIR Digital;",
            "atendimento de determinações judiciais ou administrativas.",
          ],
        },
        {
          kind: "paragraph",
          text: "A NOIR Digital não comercializa dados pessoais.",
        },
      ],
    },
    {
      id: "armazenamento-e-seguranca",
      title: "Armazenamento e segurança",
      blocks: [
        {
          kind: "paragraph",
          text: "Adotamos medidas técnicas e administrativas razoáveis para proteger os dados pessoais contra acesso não autorizado, perda, destruição, alteração ou divulgação indevida.",
        },
        {
          kind: "paragraph",
          text: "Embora empreguemos boas práticas de segurança, nenhum sistema conectado à internet pode ser considerado absolutamente inviolável.",
        },
      ],
    },
    {
      id: "retencao-dos-dados",
      title: "Retenção dos dados",
      blocks: [
        {
          kind: "paragraph",
          text: "Os dados serão mantidos apenas pelo período necessário para cumprir as finalidades desta Política, atender obrigações legais, resolver disputas e resguardar direitos da NOIR Digital.",
        },
        {
          kind: "paragraph",
          text: "Após esse período, poderão ser eliminados ou anonimizados, quando aplicável.",
        },
      ],
    },
    {
      id: "direitos-do-titular",
      title: "Direitos do titular",
      blocks: [
        {
          kind: "paragraph",
          text: "Nos termos da LGPD, o titular poderá solicitar:",
        },
        {
          kind: "list",
          items: [
            "confirmação da existência de tratamento;",
            "acesso aos dados;",
            "correção de dados incompletos, inexatos ou desatualizados;",
            "anonimização, bloqueio ou eliminação quando cabível;",
            "portabilidade;",
            "revogação do consentimento;",
            "informação sobre compartilhamento;",
            "eliminação dos dados tratados mediante consentimento, quando aplicável.",
          ],
        },
        {
          kind: "paragraph",
          text: "As solicitações poderão ser realizadas pelos canais de contato disponibilizados pela NOIR Digital.",
        },
      ],
    },
    {
      id: "alteracoes-desta-politica",
      title: "Alterações desta Política",
      blocks: [
        {
          kind: "paragraph",
          text: "Esta Política poderá ser atualizada periodicamente para refletir alterações legais, operacionais ou tecnológicas.",
        },
        {
          kind: "paragraph",
          text: "A versão mais recente estará sempre disponível nesta página.",
        },
      ],
    },
    {
      id: "contato",
      title: "Contato",
      blocks: [
        {
          kind: "paragraph",
          text: "Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento de dados pessoais, utilize os canais oficiais disponibilizados pela NOIR Digital em seu site.",
        },
      ],
    },
  ],
};

export const termsOfUse: LegalDocumentContent = {
  code: "TERMOS / 02",
  title: "Termos de Uso",
  description:
    "Condições aplicáveis ao acesso e à utilização do site institucional da NOIR Digital.",
  lastUpdated: "31 de julho de 2026",
  counterpart: {
    href: "/privacidade",
    label: "Política de Privacidade",
  },
  sections: [
    {
      id: "aceitacao",
      title: "Aceitação",
      blocks: [
        {
          kind: "paragraph",
          text: "Ao acessar ou utilizar este site, o usuário declara ter lido, compreendido e aceitado os presentes Termos de Uso.",
        },
        {
          kind: "paragraph",
          text: "Caso não concorde com qualquer disposição, recomenda-se interromper a utilização do site.",
        },
      ],
    },
    {
      id: "objeto",
      title: "Objeto",
      blocks: [
        {
          kind: "paragraph",
          text: "O site da NOIR Digital possui caráter institucional e informativo, apresentando informações sobre seus serviços, portfólio, conteúdos e canais de contato.",
        },
        {
          kind: "paragraph",
          text: "As informações disponibilizadas não constituem garantia de contratação ou prestação automática de serviços.",
        },
      ],
    },
    {
      id: "utilizacao-do-site",
      title: "Utilização do site",
      blocks: [
        {
          kind: "paragraph",
          text: "O usuário compromete-se a utilizar este site de forma ética, responsável e em conformidade com a legislação vigente.",
        },
        {
          kind: "paragraph",
          text: "É proibido:",
        },
        {
          kind: "list",
          items: [
            "utilizar o site para atividades ilícitas;",
            "tentar comprometer sua segurança;",
            "copiar conteúdos sem autorização;",
            "utilizar ferramentas automatizadas para coleta indevida de dados;",
            "praticar qualquer ação que possa prejudicar o funcionamento da plataforma.",
          ],
        },
      ],
    },
    {
      id: "propriedade-intelectual",
      title: "Propriedade intelectual",
      blocks: [
        {
          kind: "paragraph",
          text: "Todo o conteúdo disponível neste site, incluindo:",
        },
        {
          kind: "list",
          items: [
            "textos;",
            "imagens;",
            "ilustrações;",
            "identidade visual;",
            "marcas;",
            "logotipos;",
            "layouts;",
            "interfaces;",
            "elementos gráficos;",
            "código-fonte quando aplicável;",
          ],
        },
        {
          kind: "paragraph",
          text: "é protegido pela legislação de propriedade intelectual e pertence à NOIR Digital ou aos respectivos titulares licenciantes.",
        },
        {
          kind: "paragraph",
          text: "É vedada sua reprodução, distribuição, modificação ou utilização sem autorização prévia.",
        },
      ],
    },
    {
      id: "conteudo-de-terceiros",
      title: "Conteúdo de terceiros",
      blocks: [
        {
          kind: "paragraph",
          text: "O site poderá conter links para páginas externas.",
        },
        {
          kind: "paragraph",
          text: "A NOIR Digital não possui controle sobre esses ambientes e não se responsabiliza por seus conteúdos, políticas ou práticas.",
        },
      ],
    },
    {
      id: "disponibilidade",
      title: "Disponibilidade",
      blocks: [
        {
          kind: "paragraph",
          text: "Empregamos esforços para manter este site disponível continuamente.",
        },
        {
          kind: "paragraph",
          text: "Entretanto, poderão ocorrer interrupções decorrentes de:",
        },
        {
          kind: "list",
          items: [
            "manutenção;",
            "atualizações;",
            "falhas técnicas;",
            "eventos externos;",
            "casos fortuitos ou força maior.",
          ],
        },
        {
          kind: "paragraph",
          text: "A NOIR Digital não garante disponibilidade ininterrupta.",
        },
      ],
    },
    {
      id: "limitacao-de-responsabilidade",
      title: "Limitação de responsabilidade",
      blocks: [
        {
          kind: "paragraph",
          text: "A NOIR Digital não será responsável por:",
        },
        {
          kind: "list",
          items: [
            "danos decorrentes do uso inadequado do site;",
            "indisponibilidades temporárias;",
            "falhas causadas por terceiros;",
            "decisões tomadas exclusivamente com base nas informações disponibilizadas neste site.",
          ],
        },
      ],
    },
    {
      id: "protecao-de-dados",
      title: "Proteção de dados",
      blocks: [
        {
          kind: "paragraph",
          segments: [
            "O tratamento de dados pessoais realizado através deste site é disciplinado pela ",
            {
              kind: "link",
              href: "/privacidade",
              text: "Política de Privacidade da NOIR Digital",
            },
            ", que integra estes Termos de Uso.",
          ],
        },
      ],
    },
    {
      id: "alteracoes",
      title: "Alterações",
      blocks: [
        {
          kind: "paragraph",
          text: "A NOIR Digital poderá modificar estes Termos de Uso a qualquer momento.",
        },
        {
          kind: "paragraph",
          text: "A versão vigente será sempre aquela publicada nesta página.",
        },
      ],
    },
    {
      id: "legislacao-aplicavel",
      title: "Legislação aplicável",
      blocks: [
        {
          kind: "paragraph",
          text: "Estes Termos são regidos pela legislação brasileira, especialmente pela Constituição Federal, pelo Código Civil, pelo Código de Defesa do Consumidor, quando aplicável, e pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
        },
      ],
    },
    {
      id: "foro",
      title: "Foro",
      blocks: [
        {
          kind: "paragraph",
          text: "Fica eleito o foro da comarca do domicílio do consumidor, quando aplicável, ou outro competente nos termos da legislação brasileira para dirimir eventuais controvérsias decorrentes destes Termos.",
        },
      ],
    },
    {
      id: "contato",
      title: "Contato",
      blocks: [
        {
          kind: "paragraph",
          text: "Em caso de dúvidas sobre estes Termos de Uso, utilize os canais oficiais disponibilizados pela NOIR Digital em seu site.",
        },
      ],
    },
  ],
};
