# Dispersao Natural para o Vidro Canvas UI

Data: 2026-08-10
Status: Direcao aprovada, aguardando revisao da especificacao

## Objetivo

Corrigir a variante experimental `?glass=canvas-ui` para que o NOIR continue neutro e transparente, mas produza pequenos espectros de cor quando o fundo atravessar faces e chanfros com angulos diferentes. A cor deve ser consequencia da refracao do conteudo real atras do modelo, nao uma pintura, emissao ou borda RGB aplicada sobre a geometria.

A tentativa anterior com uma segunda malha aditiva esta rejeitada. Ela coloriu faces de rosa e desenhou contornos cromaticos mesmo onde nao havia luz sendo refratada. Esses modulos serao removidos, e nao apenas atenuados.

O trabalho permanece isolado na branch `codex/noir-prismatic-glass` e na variante Canvas UI. A home padrao, a variante **ATUAL** de `/glass-test` e os demais elementos do hero nao mudam.

## Direcao visual

O resultado esperado combina:

- corpo de vidro incolor, com o fundo claramente visivel atraves das letras;
- faces frontais predominantemente neutras, sem preenchimento rosa, roxo ou arco-iris;
- highlights brancos e leitura dos chanfros preservados;
- separacao RGB curta e irregular apenas onde a refracao do fundo e o angulo do volume justificarem o efeito;
- espectros mais perceptiveis junto a contrastes fortes do fundo, e praticamente ausentes sobre areas uniformes;
- resposta natural ao movimento existente do modelo, sem animacao cromatica independente.

A referencia visual sera tratada como vidro optico com dispersao, nao como objeto emissivo com outline colorido.

## Arquitetura escolhida

### Um unico material transmissivo

`HeroCanvasUiGlassAsset` usara `MeshTransmissionMaterial`, de `@react-three/drei`, como o unico material visivel do modelo. A segunda malha e o `ShaderMaterial` aditivo serao eliminados.

Esse material calcula a transmissao em canais RGB separados, com pequenas variacoes do indice de refracao por comprimento de onda. Assim, a separacao de cores surge do deslocamento diferente da imagem de fundo em cada canal, que e o mecanismo visual adequado para a dispersao optica.

O material parte de valores conservadores:

- `transmission: 1`;
- `ior` entre `1.5` e `1.65`;
- `chromaticAberration` entre `0.04` e `0.07`;
- `roughness` entre `0.05` e `0.12`;
- `samples: 6`;
- cor branca e nenhuma tonalizacao de volume;
- espessura compensada pela escala real da cena;
- blur anisotropico discreto, apenas se ajudar a integrar os highlights;
- sem `backside` na primeira versao, para evitar um passe adicional sem evidencia visual de necessidade.

Os valores finais serao ajustados visualmente dentro dessas faixas. A prioridade e manter neutralidade e transparencia; aumentar saturacao nao sera usado para compensar falta de refracao.

### Reuso do buffer de fundo

`HeroRefractionBuffer` ja renderiza o fundo do hero em um `WebGLRenderTarget`, ocultando a camada do proprio vidro durante a captura. `HeroCanvasUiGlassAsset` consumira esse recurso por `useHeroRefraction()` e passara `texture` como o `buffer` externo do `MeshTransmissionMaterial`.

Fluxo de dados:

1. `HeroRefractionBuffer` captura somente o conteudo atras do NOIR.
2. `useHeroRefraction()` expoe a textura atualizada a cada frame ativo.
3. `MeshTransmissionMaterial` amostra essa textura varias vezes por canal, usando IORs ligeiramente diferentes.
4. O fundo refratado volta a compor as faces do modelo com separacao espectral dependente do angulo.

Passar o buffer externo impede o material de renderizar novamente a cena inteira para produzir seu proprio framebuffer. A resolucao adaptativa ja existente no hero continua sendo a unica captura adicional da cena.

### Ambiente e highlights

O ambiente PMREM local e o ring light branco/azul usados pela variante Canvas UI permanecem para dar leitura aos chanfros. Eles iluminam o vidro, mas nao geram uma camada cromatica artificial. A cor espectral principal deve vir da transmissao do fundo.

Se o highlight azul competir com a neutralidade do material, sua intensidade sera reduzida durante o tuning; nao sera substituido por rosa, roxo ou um gradiente de borda.

## Dependencia

Sera adicionada `@react-three/drei` na versao compativel com a pilha atual. A versao verificada durante a pesquisa foi `10.7.8`, cujos peers aceitam React 19, React Three Fiber 9 e Three.js recente, correspondendo ao projeto.

Somente `MeshTransmissionMaterial` sera importado. Nao havera dependencia de decoder, textura remota ou novo asset para o efeito.

## Superficie de alteracao

Arquivos de producao:

- `package.json` e lockfile: adicionar `@react-three/drei`;
- `scene/HeroCanvasUiGlassAsset.tsx`: montar uma unica malha com o material transmissivo e o buffer externo;
- `scene/hero-canvas-ui-glass-config.ts`: substituir controles herdados do material fisico pelos parametros de transmissao e dispersao realmente usados.

Arquivos rejeitados a remover:

- `scene/hero-canvas-ui-spectrum-config.ts`;
- `scene/hero-canvas-ui-spectrum-shaders.ts`;
- `scene/hero-canvas-ui-spectrum-material.ts`;
- `scene/hero-canvas-ui-spectrum-layers.ts`;
- `scene/hero-canvas-ui-spectrum.test.ts`.

Testes existentes da configuracao Canvas UI serao atualizados para o novo contrato. A selecao por query string, o comparador `/glass-test`, a geometria GLB, a camera, os stickers, o fundo e o movimento do hero permanecem intactos.

## Ciclo de vida e falhas

- A geometria preparada por `createHeroModelGeometry` continua sendo descartada pelo componente no unmount.
- O ambiente PMREM continua tendo ownership e cleanup explicitos.
- O `MeshTransmissionMaterial` sera desmontado pelo React Three Fiber; recursos locais criados fora do reconciliador continuarao com cleanup explicito.
- A ausencia de `HeroRefractionBuffer` deve continuar falhando cedo pela mensagem de `useHeroRefraction`, protegida pelo `SceneErrorBoundary` existente.
- Falha de carregamento do GLB mantem o comportamento atual da cena; nao sera criado fallback visual novo nesta alteracao.
- A nova dependencia nao busca shaders ou recursos em runtime.

## Desempenho

O desenho evita o custo mais preocupante do material transmissivo:

- o `buffer` externo reutiliza a captura ja existente;
- nao ha segunda malha, outline ou passe aditivo;
- `samples: 6` limita a amostragem cromatica inicial;
- `backside` fica desativado;
- a resolucao do buffer continua em `0.5` no modo completo e `0.375` no modo reduzido;
- nenhuma animacao ou uniforme temporal novo sera adicionado.

Se a verificacao mostrar queda relevante de frame time, o primeiro ajuste sera reduzir `samples`, preservando a arquitetura e a neutralidade visual.

## Estrategia de testes

O trabalho seguira TDD nos contratos que podem ser verificados sem acoplar testes ao shader interno da dependencia.

Antes da implementacao, testes devem falhar para demonstrar a ausencia do novo contrato e depois cobrir:

- configuracao neutra, com transmissao total, aberracao cromatica moderada e amostragem limitada;
- espessura corrigida pela escala da cena;
- uso de uma unica camada/material para a variante Canvas UI;
- consumo explicito da textura de `useHeroRefraction` como buffer externo;
- ausencia dos modulos de spectrum overlay rejeitados;
- preservacao da resolucao de variante: somente `glass=canvas-ui` usa o novo material;
- configuracoes desconhecidas ou ausentes continuam selecionando a variante padrao.

A verificacao integrada incluira:

- Vitest focado nos contratos Canvas UI, na variante e no comparador;
- TypeScript;
- Biome nos arquivos alterados;
- build de producao com Webpack;
- comparacao visual em `/glass-test` no desktop;
- home com `?glass=canvas-ui` em desktop e viewport movel;
- inspecao do console para novos erros ou warnings;
- verificacao de que a home sem query permanece visualmente e funcionalmente inalterada.

## Criterios de aceitacao

1. As faces do NOIR permanecem transparentes e predominantemente incolores.
2. Nao existe preenchimento rosa ou roxo persistente.
3. Nao existe outline RGB uniforme ou independente do conteudo atras do objeto.
4. A separacao RGB aparece de forma localizada quando detalhes contrastantes do fundo sao refratados por faces ou chanfros.
5. Highlights brancos e o volume chanfrado continuam legiveis.
6. O espectro acompanha naturalmente o movimento do vidro, sem ciclo de cores proprio.
7. A variante Canvas UI usa uma unica malha visivel e o buffer de refracao existente.
8. Nao ha novo passe de captura integral da cena por frame.
9. O painel **ATUAL** e a home sem `glass=canvas-ui` permanecem inalterados.
10. Testes, typecheck, Biome e build passam apos a alteracao.

## Fora de escopo

- alterar ou reotimizar o GLB;
- redesenhar o hero, seus textos, fundo, stickers ou movimento;
- adicionar gradiente, emissao, outline ou segunda malha para forcar cores;
- alterar a variante padrao antes da aprovacao visual do experimento;
- expor sliders ou controles publicos no site;
- publicar, mesclar ou enviar a branch ao remoto.
