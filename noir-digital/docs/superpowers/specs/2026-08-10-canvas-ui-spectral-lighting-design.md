# Iluminacao Espectral para o Vidro Canvas UI

Data: 2026-08-10
Status: Direcao aprovada, aguardando revisao da especificacao

## Objetivo

Aproximar a variante `?glass=canvas-ui` da referencia em dois pontos que ainda faltam:

1. bordas e chanfros brancos mais claros, continuos e legiveis;
2. feixes RGB largos e localizados atravessando o interior do vidro.

O corpo do NOIR deve continuar transparente e neutro. O trabalho nao pode reintroduzir preenchimento rosa, outline RGB uniforme, segunda malha sobre o modelo ou cor emissiva aplicada diretamente nas faces.

A alteracao permanece isolada na branch `codex/noir-prismatic-glass` e na variante Canvas UI. A home padrao e o painel **ATUAL** de `/glass-test` nao mudam.

## Leitura da referencia

A referencia combina tres sinais opticos diferentes:

- faces escuras e transparentes que preservam a leitura do fundo;
- highlights brancos intensos nos chanfros externos e internos;
- poucas concentracoes espectrais largas, com transicao suave entre vermelho, verde e azul, visiveis dentro do volume.

O resultado atual reproduz a transparencia, mas recebe pouca luz branca nas arestas. Sua aberracao cromatica tambem depende apenas do fundo monocromatico, portanto as cores aparecem como pequenos fragmentos e desaparecem quando nao existe contraste adequado atras da geometria.

## Abordagens consideradas

### Fonte espectral no buffer de refracao — escolhida

Uma fonte optica invisivel sera composta no buffer que o vidro ja refrata. Ela existira somente para a transmissao do NOIR, produzindo feixes internos sem pintar sua superficie.

Vantagens:

- feixes confiavelmente visiveis;
- resposta natural a angulo, perspectiva, rotacao e scroll;
- nenhuma segunda malha sobre o NOIR;
- nenhum efeito sobre textos, stickers ou fundo fora do vidro;
- custo limitado a um quad simples no buffer existente.

### Shader aplicado diretamente ao NOIR — rejeitada

Ofereceria controle preciso das faixas, mas repetiria o risco da tentativa anterior: cor com aparencia de pintura, outline ou emissao independente da refracao.

### Pos-processamento de bloom/prisma — rejeitada

Poderia intensificar brilho, mas afetaria outros elementos do hero, exigiria buffers adicionais e nao resolveria a origem dos feixes dentro do vidro.

## Arquitetura escolhida

### Uma unica malha de vidro

`HeroCanvasUiGlassAsset` continuara renderizando uma unica malha com `MeshTransmissionMaterial`. A textura externa de `HeroRefractionBuffer` permanece como a unica fonte de transmissao.

Nao serao adicionados outline, shell, overlay coplanar ou material aditivo ao modelo.

### Fonte espectral invisivel

`HeroRefractionBuffer` recebera uma opcao `spectralSourceActive`, falsa por padrao e verdadeira somente quando `heroGlassVariant === "canvas-ui"`.

Depois de capturar a cena normal no `WebGLRenderTarget`, o buffer renderizara um quad fullscreen aditivo com quatro feixes espectrais. Esse quad pertence a uma cena optica interna do buffer e nunca entra na arvore visivel da pagina.

O passe tera:

- uma `Scene` dedicada;
- uma `OrthographicCamera` fixa;
- uma `PlaneGeometry` fullscreen;
- um `ShaderMaterial` transparente, aditivo, sem depth test, sem depth write e sem tone mapping;
- quatro feixes calculados em UV por funcoes suaves, sem textura externa;
- cleanup explicito de geometria e material.

Os quatro feixes terao posicoes, inclinacoes, larguras e intensidades diferentes. A composicao inicial privilegiara diagonais atravessando regioes distintas das letras, evitando uma faixa unica ou um preenchimento continuo.

O shader nao tera `uTime`. A fonte permanece estavel no espaco de tela, enquanto a geometria, a camera e o vetor de refracao se movem. Essa diferenca faz os feixes mudarem naturalmente dentro do vidro sem ciclo autonomo de cores.

### Ambiente para bordas brancas

O ambiente PMREM da variante Canvas UI sera reorganizado para produzir highlights mais claros:

- o ring light principal passa a branco;
- tres refletores brancos estreitos sao adicionados em angulos diferentes;
- os refletores usam materiais sem tone mapping e intensidades distintas para evitar um contorno uniforme;
- a intensidade do ambiente aumenta, enquanto blur e roughness diminuem;
- clearcoat aumenta e sua roughness diminui para criar uma linha branca mais nitida nos chanfros.

Valores iniciais:

- `clearcoat: 1`;
- `clearcoatRoughness: 0.02`;
- `environmentBlur: 0.02`;
- `environmentIntensity: 1.6`;
- `highlight: "#ffffff"`;
- `roughness: 0.05`;
- `anisotropicBlur: 0.03`;
- `chromaticAberration: 0.07`;
- `ior: 1.58`;
- `samples: 6`;
- `transmission: 1`.

Os refletores sao parte do ambiente optico, nao objetos visiveis da cena.

## Composicao visual

O resultado deve manter aproximadamente 70–80% das arestas neutras ou brancas. Cor espectral aparece somente em trechos localizados e no interior do volume.

A configuracao inicial usa quatro feixes:

- dois principais, largos e mais intensos;
- dois secundarios, estreitos e discretos;
- cores RGB continuas, sem magenta dominante;
- bordas suaves para evitar faixas graficas recortadas;
- intensidade maxima limitada para o fundo continuar visivel.

No desktop, a intensidade global inicial do passe sera `0.62`. Em viewports abaixo de 768 px, sera `0.48`, preservando legibilidade e reduzindo saturacao sobre a palavra menor.

Em um frame comum:

- todas as letras devem exibir algum highlight branco nos chanfros;
- pelo menos dois feixes RGB devem ser claramente reconheciveis;
- nenhum feixe deve preencher uma letra inteira;
- nao deve existir outline RGB continuo;
- faces nao podem parecer rosa, roxas ou cinza solido.

## Componentes e responsabilidades

### `SiteCanvas`

Continua resolvendo a variante ativa e informa ao `HeroRefractionBuffer` se a fonte espectral deve ser composta.

### `HeroRefractionBuffer`

Mantem a captura atual do fundo, preserva o isolamento da camada do vidro e adiciona o quad somente depois do render da cena. Ele permanece proprietario do render target e passa a ser tambem proprietario do recurso optico auxiliar.

Durante cada frame ativo:

1. salva render target, mascara da camera e `autoClear`;
2. captura o fundo normal;
3. se `spectralSourceActive`, desativa o clear e renderiza o quad aditivo no mesmo target;
4. restaura todos os estados do renderer e da camera;
5. expoe a textura final pelo contexto existente.

A restauracao ocorre em um bloco `finally`, inclusive se o passe optico falhar, para nao contaminar os renders seguintes do site.

### Fonte espectral Canvas UI

Um modulo isolado cria a cena, camera, geometria, shader e API de render/cleanup. O modulo nao conhece React, o modelo GLB nem a home; recebe apenas renderer e intensidade.

### `HeroCanvasUiGlassAsset`

Permanece responsavel pelo GLB, geometria, `MeshTransmissionMaterial` e ambiente PMREM. A construcao do ambiente podera ser extraida para um helper puro para tornar refletores e cleanup testaveis sem aumentar o componente.

### Configuracao

Os valores de material, refletores e feixes ficam em configuracoes puras proximas aos modulos que os consomem. Numeros de tuning nao serao espalhados pelo loop de render ou JSX.

## Desempenho

O passe espectral nao cria uma segunda captura da pagina. Ele adiciona somente um draw call fullscreen depois da captura que ja existe.

Limites:

- quatro feixes calculados em um unico fragment shader;
- nenhuma textura externa;
- nenhuma animacao temporal;
- mesmo render target HalfFloat e mesma resolucao adaptativa do hero;
- passe desativado quando a variante padrao esta ativa;
- `samples: 6` mantido no material transmissivo;
- intensidade menor no mobile, sem aumentar resolucao ou amostras.

Se a medicao visual mostrar queda relevante, o primeiro ajuste sera simplificar a funcao dos feixes. A captura da cena nao sera duplicada e a variante padrao nao sera degradada.

## Ciclo de vida e falhas

- Geometria e material do quad espectral sao descartados no unmount.
- Refletores e materiais temporarios do PMREM sao descartados depois da geracao do ambiente.
- O render target continua sendo descartado por `HeroRefractionBuffer`.
- Estados alterados durante a captura sao restaurados mesmo quando o passe espectral esta inativo.
- Nao ha fetch, decoder, imagem remota ou asset adicional que possa falhar em runtime.
- Erros de shader permanecem protegidos pelo `SceneErrorBoundary` existente e devem ser detectados na verificacao local.

## Estrategia de testes

O trabalho seguira TDD.

Testes puros devem falhar antes da producao e depois validar:

- exatamente quatro definicoes de feixe;
- intensidades desktop e mobile limitadas;
- shader sem `uTime`;
- material do passe transparente, aditivo, sem depth test/write e sem tone mapping;
- API de render que usa um unico quad e possui cleanup idempotente;
- `HeroRefractionBuffer` compondo a fonte apenas quando solicitado;
- `SiteCanvas` ativando a fonte somente para `canvas-ui`;
- configuracao de highlights brancos e clearcoat mais intenso;
- `HeroCanvasUiGlassAsset` mantendo uma unica malha;
- variante padrao e comparador preservados.

Verificacao integrada:

- Vitest focado nos novos modulos e contratos existentes;
- TypeScript estrito;
- Biome nos arquivos alterados;
- build de producao com Webpack;
- `/glass-test` em desktop;
- home Canvas UI em 1440 × 900 e 390 × 844;
- console sem novos erros da variante;
- comparacao visual contra as duas imagens aprovadas.

## Criterios de aceitacao

1. O NOIR continua sendo uma unica malha transparente.
2. Chanfros internos e externos exibem highlights brancos mais claros em todas as letras.
3. Pelo menos dois feixes RGB largos aparecem em um frame comum.
4. A fonte espectral permanece invisivel fora do vidro.
5. Os feixes respondem a perspectiva e movimento do modelo, sem animacao propria.
6. Nao existe preenchimento rosa, magenta dominante ou outline RGB continuo.
7. O fundo permanece visivel pelas faces.
8. A variante padrao nao recebe refletores ou feixes novos.
9. O passe adiciona um quad, nao uma nova captura completa da cena.
10. Testes, typecheck, Biome e build passam.

## Fora de escopo

- alterar ou reotimizar o GLB;
- mudar layout, camera, textos, stickers ou movimento do hero;
- adicionar bloom ou pos-processamento global;
- recolocar a camada prismatica aditiva removida;
- expor sliders publicos;
- modificar a variante padrao antes da aprovacao visual do experimento;
- publicar, mesclar ou enviar a branch ao remoto.
