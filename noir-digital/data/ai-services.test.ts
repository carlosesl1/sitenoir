import { describe, expect, it } from "vitest";

import { aiServices } from "@/data/ai-services";

describe("aiServices", () => {
  it("publishes the six approved services in order", () => {
    expect(aiServices).toEqual([
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
    ]);
  });

  it("keeps every service id unique", () => {
    expect(new Set(aiServices.map(({ id }) => id)).size).toBe(aiServices.length);
  });
});
