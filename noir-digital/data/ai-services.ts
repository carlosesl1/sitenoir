export const aiServices = [
  {
    id: "process-automation",
    label: "Automação de processos",
    code: "AUTOMATION",
    glyph: "automation",
    description:
      "Eliminamos tarefas repetitivas e construímos fluxos inteligentes para ganhar tempo, reduzir erros e escalar com eficiência.",
  },
  {
    id: "custom-software",
    label: "Softwares sob medida",
    code: "SOFTWARE",
    glyph: "software",
    description:
      "Soluções inteligentes e personalizadas com IA no core, alinhadas aos seus objetivos, dados e processos.",
  },
  {
    id: "ai-copilots",
    label: "Copilotos de IA",
    code: "COPILOTS",
    glyph: "copilots",
    description:
      "Assistentes inteligentes que trabalham com seu time, aceleram entregas e elevam a produtividade.",
  },
  {
    id: "ai-agents",
    label: "Agentes de IA",
    code: "AGENTS",
    glyph: "agents",
    description:
      "Agentes autônomos que executam, monitoram e otimizam processos com autonomia e consistência.",
  },
  {
    id: "smart-integration",
    label: "Integração inteligente",
    code: "INTEGRATION",
    glyph: "integration",
    description:
      "Conectamos a IA aos seus sistemas, dados e ferramentas para uma operação fluida e centralizada.",
  },
  {
    id: "ai-first-company",
    label: "Empresa AI First",
    code: "AI FIRST",
    glyph: "ai-first",
    description:
      "Transformamos sua cultura, estratégia e operação para colocar a IA no centro das decisões e do crescimento.",
  },
] as const;

export type AiService = (typeof aiServices)[number];
