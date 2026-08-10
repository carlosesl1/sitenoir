# Comparativo Canvas UI Glass para o Hero NOIR

Data: 2026-08-10
Status: Direção aprovada

## Objetivo

Criar um laboratório local lado a lado que compare o material prismático atual do NOIR com uma alternativa inspirada no `GlassObject` do Canvas UI, usando o mesmo GLB otimizado e a composição real da home.

O experimento serve somente para decidir qual leitura material se aproxima mais da referência. Ele não substitui o hero padrão, não aparece na navegação e não será publicado, mesclado ou enviado ao remoto sem um pedido explícito posterior.

## Decisão principal

O código standalone do `GlassObject` não será montado como um segundo canvas sobre a home. Um `MeshPhysicalMaterial` em outro renderer não consegue refratar o conteúdo WebGL do canvas que está atrás dele, o que produziria uma comparação visual enganosa.

A alternativa será adaptada à cena React Three Fiber existente. Dessa forma, as duas variantes compartilham:

- o mesmo `noir-adjusted-afd7a8873be5.glb`;
- geometria, normais, posição, escala e enquadramento;
- câmera, fundo óptico, luz ligada ao ponteiro, grid e stickers;
- movimento de entrada e saída por scroll;
- política de qualidade e movimento reduzido.

A única variável deliberadamente alterada será o material do modelo NOIR.

## Experiência de comparação

### Rota de laboratório

`/glass-test` será uma página sem link público e com metadados `noindex`. Ela exibirá duas instâncias completas da home:

1. **ATUAL** — home sem parâmetro, usando `HeroGlassAsset` e o shader prismático existente.
2. **CANVAS UI** — home com `?glass=canvas-ui`, usando o material físico experimental.

Os painéis terão rótulos discretos e nenhuma decoração que interfira na leitura do hero.

### Viewports equivalentes

Cada painel hospedará a home em um iframe com o mesmo viewport lógico de desktop. O conteúdo será reduzido proporcionalmente para caber lado a lado, evitando que a metade esquerda use layout desktop e a metade direita acione outro breakpoint.

Em telas estreitas, os painéis serão empilhados, mas continuarão usando o mesmo viewport lógico interno. Esse laboratório é uma ferramenta de avaliação local; executar duas cenas WebGL simultâneas é aceitável nele e não altera o custo da home normal.

## Seleção da variante

A leitura do parâmetro `glass` ficará em uma função pura e testável. Somente o valor exato `canvas-ui` selecionará o experimento. Parâmetro ausente, desconhecido ou inválido continuará selecionando o shader atual.

`LazySiteCanvas` passará a variante resolvida para `SiteCanvas`, que a encaminhará a `HeroModel`. O modelo escolherá entre:

- `HeroGlassAsset`, sem nenhuma mudança de comportamento; e
- `HeroCanvasUiGlassAsset`, novo componente experimental.

O HTML padrão da home e a URL sem parâmetro permanecerão visual e funcionalmente iguais ao estado atual da branch.

## Material físico experimental

`HeroCanvasUiGlassAsset` reutilizará a mesma preparação de geometria do material atual: aplicar matrizes dos meshes, unir partes, centralizar e recalcular normais quando necessário.

O material começará com os valores enviados na configuração do Canvas UI:

- `ior: 1.75`;
- `thickness: 4`, convertido para a escala local do hero para conservar a espessura óptica em unidades de cena;
- `roughness: 0.25`;
- `dispersion: 1.5`;
- `clearcoat: 0.5`;
- `clearcoatRoughness: 0.06`;
- `transmission: 1`;
- vidro sem tint, com cor branca neutra;
- intensidade de ambiente `1`;
- highlight de ambiente `#066aff`.

O ambiente de estúdio do Canvas UI será convertido uma vez em um mapa PMREM e aplicado somente ao material experimental. Isso preserva os highlights e a dispersão do exemplo sem trocar o ambiente global da home. O fundo óptico existente continuará presente na própria cena e será visto através da transmissão física.

As opções de órbita, zoom, auto-rotação, flutuação e rocking do componente standalone não serão usadas. O movimento atual do hero será mantido igual nas duas variantes para que o teste meça material, não coreografia.

## Ciclo de vida e falhas

- Geometria clonada, material, PMREM e render target de ambiente serão descartados no unmount.
- A geração do ambiente não ocorrerá por frame.
- A cena continuará demand-driven e respeitará `prefers-reduced-motion`.
- Falha de WebGL ou carregamento no painel experimental ficará restrita àquela home; o painel atual continuará disponível para comparação.
- A rota de laboratório exibirá um estado legível caso um iframe não consiga carregar.

## Testes

### TDD focado

Antes da implementação serão adicionados testes que falham por ausência do experimento e comprovam:

- `canvas-ui` é a única query que seleciona a variante física;
- ausência ou valor desconhecido preserva a variante atual;
- a variante atravessa `LazySiteCanvas`, `SiteCanvas` e `HeroModel` sem alterar o default;
- o material físico mantém os valores iniciais aprovados;
- `/glass-test` contém os dois alvos corretos, rótulos e `noindex`;
- as duas molduras usam o mesmo viewport lógico.

### Verificação técnica

- testes Vitest focados do seletor, cena e rota;
- testes existentes do hero, preload e shaders atuais;
- TypeScript;
- Biome somente nos arquivos alterados;
- build de produção, porque uma nova rota será adicionada;
- ausência de alterações não intencionais na home padrão.

### Verificação visual

- abrir `/glass-test` em desktop;
- confirmar que posição, tamanho, movimento e fundo coincidem nos dois painéis;
- comparar transparência das faces, definição das bordas, refração e dispersão;
- confirmar que o painel esquerdo reproduz exatamente o estado atual;
- inspecionar a rota empilhada em viewport móvel;
- verificar console e carregamento do GLB sem erros.

O resultado será apresentado como experimento local. A avaliação subjetiva de qual material ficou melhor continuará pertencendo ao usuário.

## Critérios de aceitação

1. `/glass-test` apresenta as duas homes lado a lado com o mesmo viewport lógico.
2. O painel atual usa o shader existente sem regressões.
3. O painel Canvas UI usa o mesmo GLB com transmissão física e os parâmetros aprovados.
4. Fundo, câmera, layout e movimento permanecem equivalentes entre as variantes.
5. A home sem `?glass=canvas-ui` não muda visualmente.
6. A rota de teste não aparece na navegação e inclui `noindex`.
7. Recursos WebGL experimentais são liberados ao sair da rota.
8. Testes focados, typecheck, Biome e build passam após a implementação.

## Fora de escopo

- alterar ou reotimizar o GLB;
- substituir o shader atual antes da avaliação do usuário;
- criar controles de sliders para todos os parâmetros;
- redesenhar o background, grid, textos, stickers ou cursor;
- mudar a coreografia do hero;
- otimizar duas cenas simultâneas como se o laboratório fosse uma página de produção;
- publicar, mesclar ou enviar a branch ao remoto.
