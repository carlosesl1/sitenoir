# Material Prismático do NOIR no Hero

Data: 2026-08-10
Status: Direção aprovada

## Objetivo

Transformar somente a leitura material do modelo 3D `NOIR` no hero: sair do volume cinza e opaco atual para um vidro escuro prismático próximo da referência fornecida. O modelo, a geometria, o enquadramento, a escala, a posição, a rotação, a saída por scroll e a interação com o ponteiro permanecem exatamente como estão.

O teste será desenvolvido na branch isolada `codex/noir-prismatic-glass` e não será publicado sem um pedido explícito separado.

## Diagnóstico

O hero já possui quase toda a infraestrutura necessária:

- modelo GLB carregado por `HeroGlassAsset`;
- material `ShaderMaterial` próprio;
- buffer de refração da cena;
- índices de refração separados por canal RGB;
- aberração cromática;
- Fresnel, especular e luz acompanhando o ponteiro;
- pós-processamento de flare já integrado ao canvas.

O aspecto cinza não é causado pelo modelo. Ele vem da composição do fragment shader: a amostra refratada recebe brilho e tint muito uniformes sobre as faces frontais, enquanto Fresnel, especular e dispersão não ficam suficientemente concentrados nas bordas e quinas. Como resultado, a massa inteira lê como metal fosco claro.

## Direção escolhida

Usar o menor caminho que realmente alcança o resultado: refinar o shader atual, sem substituir o pipeline por vidro físico.

O material final deve apresentar:

- centro das faces quase preto, ainda deixando a cena refratada aparecer de forma controlada;
- borda branca e nítida para preservar a silhueta e a profundidade das extrusões;
- dispersão ciano, azul, magenta, vermelho e amarelo concentrada nas quinas, chanfros e ângulos rasantes;
- pequenos picos prismáticos que respondem à luz ligada ao ponteiro;
- contraste alto contra o fundo preto, sem transformar toda a palavra em arco-íris;
- transparência percebida por refração da cena, não por redução global de `opacity`.

A referência é autoridade para o material, não para o layout completo. Stickers, cursor, textos, grid, background óptico e composição do hero não serão redesenhados.

## Design técnico

### Configuração

`scene/hero-glass-config.ts` continuará centralizando os valores ajustáveis. Serão definidos controles explícitos para separar três zonas do material:

1. **Face transmission:** quanto da cena refratada permanece visível nas faces frontais.
2. **Neutral rim:** força e largura aparente do contorno branco.
3. **Spectral rim:** intensidade da dispersão cromática somente em ângulos rasantes.

Os valores do tema escuro serão calibrados para a referência. O tema claro continuará funcional e legível; ele poderá receber apenas os ajustes mínimos necessários para não regredir com a nova matemática compartilhada.

### Fragment shader

`scene/hero-glass-shaders.ts` continuará usando as amostras refratadas RGB existentes. A alteração adicionará máscaras derivadas de `abs(dot(normal, eyeDirection))`:

- uma máscara frontal para comprimir luminosidade e saturação no centro das faces;
- uma máscara de grazing angle para revelar a dispersão já calculada nas bordas;
- uma faixa mais estreita para o rim branco especular.

As máscaras serão combinadas depois da refração e antes da saída final. A face continuará opaca no framebuffer (`alpha = 1`), pois a transparência visual já vem da textura de refração da cena. Isso evita problemas de ordenação, dupla transparência e desaparecimento das extrusões.

### Integração

`scene/HeroGlassAsset.tsx` continuará responsável por criar o mesmo `ShaderMaterial` e atualizar somente a posição da luz. Novos uniforms, se necessários, serão valores escalares estáticos vindos da configuração. Não haverá alocação por frame, novo estado React nem mudança no `useFrame` existente.

## Performance e compatibilidade

A solução não adicionará:

- novo render pass;
- textura, HDRI, environment map ou asset externo;
- `MeshTransmissionMaterial` ou `MeshPhysicalMaterial`;
- `CubeCamera`, PMREM ou renderização da cena múltiplas vezes;
- mudança no DPR, resolução do buffer ou política de qualidade;
- dependência nova.

O custo adicional será limitado a algumas operações escalares no fragment shader. O canvas continuará demand-driven, com os mesmos fallbacks e a mesma `SceneErrorBoundary`.

## Verificação

### Automatizada

- adicionar ou ajustar testes focados para os novos parâmetros e contratos do shader;
- executar os testes focados de `hero-glass`, compilação de shaders, layout e movimento do hero;
- executar Biome nos arquivos alterados;
- executar typecheck;
- executar o build de produção depois do último ajuste visual.

O baseline completo do Vitest neste worktree não concluiu antes da implementação: o runner ficou preso após avisos de `HTMLCanvasElement.getContext()` e terminou com código `1073807364`. Essa limitação será mantida explícita; testes focados e demais provas não serão apresentados como equivalentes a uma suíte completa aprovada.

### Visual

- comparar o hero atual, a referência e a nova versão em tema escuro;
- verificar desktop em 1920 px e mobile em 390 px;
- observar o material parado e durante a resposta ao ponteiro;
- confirmar centro escuro, refração legível, rim branco e espectro localizado;
- confirmar que textos, CTA, cursor, stickers, grid e composição não mudaram;
- verificar que o tema claro continua legível e sem faces estouradas;
- confirmar ausência de erros WebGL e overflow horizontal.

Serão feitas no máximo duas rodadas visuais: uma inspeção agrupada desktop/mobile, seguida por um lote de correções, e uma confirmação final.

## Critérios de aceitação

O teste é aprovado quando:

1. o NOIR deixa de parecer uma massa cinza opaca;
2. as faces leem como vidro escuro refrativo;
3. o contorno branco permanece limpo e reconhecível;
4. o espectro aparece principalmente em bordas e quinas, sem colorir a face inteira;
5. o efeito responde ao ponteiro sem cintilação ou ruído excessivo;
6. nenhuma geometria, posição, escala, movimento ou outra parte do hero é alterada;
7. não há novo pass de renderização nem regressão perceptível de fluidez.

## Fora de escopo

- substituir ou editar o GLB;
- alterar a forma das letras;
- redesenhar o cursor ou os stickers;
- mudar o background óptico, o flare global ou a simulação de fluido;
- modificar textos, grid, CTA, header ou responsividade do hero;
- criar um sistema de vidro fisicamente correto;
- publicar, mesclar ou enviar a branch ao remoto sem solicitação explícita.
