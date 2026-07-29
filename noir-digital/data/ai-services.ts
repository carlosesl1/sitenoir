export const aiServices = [
  {
    id: "custom-software",
    label: "Software sob medida",
    description: "Sistemas e ferramentas construídos para o fluxo real da sua operação.",
  },
  {
    id: "process-automation",
    label: "Automação de processos",
    description: "Integrações que eliminam tarefas repetitivas e reduzem gargalos.",
  },
  {
    id: "agents-copilots",
    label: "Agentes e copilotos",
    description: "Assistentes com contexto do negócio para apoiar equipes e decisões.",
  },
  {
    id: "ai-implementation",
    label: "Implantação de IA",
    description: "Diagnóstico, priorização e implantação segura de casos de uso.",
  },
  {
    id: "smart-integrations",
    label: "Integrações inteligentes",
    description: "Conectamos dados, sistemas e modelos sem romper sua operação atual.",
  },
  {
    id: "operational-optimization",
    label: "Otimização operacional",
    description: "Monitoramento e melhoria contínua para ampliar produtividade e margem.",
  },
] as const;

export type AiService = (typeof aiServices)[number];
export type AiServiceId = AiService["id"];
