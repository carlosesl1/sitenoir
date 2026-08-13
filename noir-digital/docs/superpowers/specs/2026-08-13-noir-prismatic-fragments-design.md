# Fragmentos Prismáticos Naturais do NOIR

Data: 2026-08-13
Status: Design aprovado, aguardando revisão da especificação

## Objetivo

Substituir as quatro faixas espectrais atuais da variante Canvas UI por um campo de aproximadamente dez fragmentos prismáticos localizados. O resultado deve reproduzir a leitura da referência: reflexos distribuídos em vários pontos do NOIR, com formatos, tamanhos, cores dominantes e intensidades diferentes, sem colorir todo o objeto.

O corpo do NOIR continua transparente e neutro nas regiões que não recebem um fragmento. Essas regiões não ganham preto artificial; apenas deixam visível o fundo escuro do hero.

## Problema atual

O contrato `beams` descreve exatamente quatro primitivas grandes. Mesmo depois de adicionar afunilamento, curvatura, irregularidade e ângulo compartilhado, cada primitiva continua atravessando uma área extensa do vidro e permanece visualmente reconhecível como uma faixa RGB.

O problema não é somente largura, intensidade ou ângulo. A primitiva visual está errada para a referência. O novo desenho elimina o conceito de faixa como unidade principal.

## Direção visual aprovada

A fonte espectral terá entre oito e doze fragmentos, inicialmente dez. Todos compartilham uma direção óptica geral de `0.58 rad` — aproximadamente 33°, subindo da esquerda para a direita — mas não compartilham o mesmo formato.

Distribuição inicial:

- três fragmentos com espectro quase completo;
- três fragmentos dominados por azul e verde;
- dois fragmentos dominados por vermelho e amarelo;
- dois reflexos pequenos e discretos próximos a cantos.

Os fragmentos variam em posição, tamanho, força, suavidade, assimetria e recorte cromático. Áreas neutras permanecem entre eles para preservar contraste e transparência.

## Arquitetura

O pipeline atual permanece:

1. uma fonte fullscreen é renderizada em um único quad;
2. `HeroRefractionBuffer` captura essa fonte junto com o conteúdo atrás do modelo;
3. o material transmissivo do NOIR refrata a captura;
4. somente as partes da fonte atravessadas pelo vidro aparecem no objeto.

Não serão adicionados render targets, texturas, assets, luzes, malhas visíveis ou passes de pós-processamento.

O contrato `HeroCanvasUiSpectralBeam` e a propriedade `beams` serão substituídos por `HeroCanvasUiSpectralFragment` e `fragments`. A configuração será compilada em chamadas GLSL, como já ocorre com os feixes, preservando o único draw call.

## Contrato dos fragmentos

Cada fragmento terá:

- `kind`: `lens`, `wedge` ou `glint`;
- `center`: posição normalizada na fonte;
- `size`: comprimento e largura normalizados;
- `strength`: intensidade individual;
- `softness`: queda nas bordas;
- `skew`: assimetria do corpo;
- `phase`: deslocamento controlado dentro da paleta;
- `colorStart` e `colorEnd`: janela utilizada da paleta espectral.

O ângulo não será repetido em cada objeto. Todos os fragmentos usarão a constante compartilhada `HERO_CANVAS_UI_SPECTRAL_FRAGMENT_ANGLE = 0.58`.

Os valores serão declarativos e determinísticos. Não haverá geração aleatória em runtime.

## Formatos

### Lente

Máscara oval assimétrica com concentração suave no centro e queda gradual nas duas dimensões. Serve para reflexos volumétricos de espectro completo ou parcial.

### Cunha

Máscara curta cuja largura cresce de uma ponta para a outra antes de desaparecer. Produz separações prismáticas semelhantes às regiões coloridas formadas em cantos e mudanças de face.

### Reflexo

Máscara estreita e curta, com pontas dissolvidas e intensidade menor. Serve para detalhes cromáticos em cantos sem virar um outline contínuo.

Nenhum formato atravessará a tela como uma faixa infinita. Todos terão limites longitudinais e transversais visíveis na fonte.

## Cor

A paleta continua exatamente:

- vermelho `#d23012`;
- amarelo `#fce609`;
- verde `#21d344`;
- azul `#03357c`.

`colorStart` e `colorEnd` selecionam partes dessa paleta:

- vermelho/amarelo: início da paleta;
- verde/azul: final da paleta;
- espectro completo: intervalo inteiro;
- fragmentos intermediários: sobreposição controlada entre faixas adjacentes.

A janela cromática não cria uma nova paleta. Não haverá magenta, ciano artificial, marrom, pastel ou núcleo branco inserido dentro das manchas.

## Bordas e vidro

O material do vidro, o ambiente, o destaque branco das bordas e a intensidade de reflexão não serão alterados. O novo shader afeta somente a fonte espectral refratada.

As bordas permanecem predominantemente brancas, com a separação cromática delicada já produzida pelo material. O novo campo não desenha outline e não compensa manchas fracas aumentando a iluminação do vidro.

## Movimento

Os fragmentos permanecem estáticos no espaço da fonte. A mudança percebida vem somente do movimento e da perspectiva existentes do modelo ao refratar essa fonte.

Não serão adicionados:

- `uTime`;
- uniforme de ponteiro;
- luz presa ao mouse;
- deslocamento autônomo de cor;
- ruído temporal.

## Desempenho

O custo estrutural permanece um único draw call fullscreen. O número de avaliações de máscara aumenta de quatro para dez, mas cada avaliação usa apenas operações GLSL pequenas e não realiza leitura de textura adicional.

Para manter o custo previsível:

- o total inicial será limitado a dez fragmentos;
- cada fragmento executará somente a máscara do seu `kind`;
- não haverá loops dinâmicos;
- chamadas serão geradas em build time a partir da configuração;
- não haverá noise procedural de alta frequência;
- desktop e mobile continuarão usando intensidades responsivas.

## Superfície de alteração

Arquivos de produção:

- `scene/hero-canvas-ui-spectral-source-config.ts`: substituir o contrato e os quatro feixes pelos dez fragmentos;
- `scene/hero-canvas-ui-spectral-source-shaders.ts`: gerar chamadas de fragmento, adicionar as três máscaras e aplicar janelas cromáticas.

Testes:

- `scene/hero-canvas-ui-spectral-source.test.ts`: substituir as expectativas de feixes por contratos de quantidade, variedade, limites, direção compartilhada e diversidade cromática.

Não serão alterados:

- `HeroRefractionBuffer`;
- material Canvas UI;
- GLB;
- câmera e movimento;
- stickers e sua profundidade;
- fundo do hero;
- loader;
- variante padrão da home.

## Testes

O trabalho seguirá TDD. Os testes devem falhar primeiro ao exigir o novo contrato e depois verificar:

- existência de dez fragmentos e ausência de `beams`;
- presença dos três formatos;
- ângulo compartilhado de `0.58`;
- ao menos três janelas cromáticas diferentes;
- presença de fragmentos de intensidades e tamanhos distintos;
- limites válidos para posição, tamanho, força, suavidade, assimetria e janela de cor;
- geração de dez chamadas `spectralFragment` e ausência de `spectralBeam`;
- existência das máscaras `lensMask`, `wedgeMask` e `glintMask`;
- ausência de `uTime`, ponteiro e núcleo branco;
- preservação de um único quad fullscreen e de seu cleanup.

A verificação integrada incluirá teste focado, Biome, TypeScript, build de produção e inspeção visual em desktop e mobile.

## Critérios de aceitação

1. O resultado não pode ser contado visualmente como quatro faixas grandes.
2. Entre oito e doze reflexos localizados aparecem em diferentes regiões do NOIR.
3. Existem manchas de formato oval, cunha e reflexo curto.
4. Algumas manchas mostram espectro quase completo, outras vermelho/amarelo e outras verde/azul.
5. Tamanho, intensidade e suavidade variam de maneira evidente, mas controlada.
6. Todos os fragmentos preservam a mesma direção óptica geral.
7. O corpo permanece transparente e neutro entre as manchas.
8. Não existe núcleo branco dentro do espectro nem outline RGB criado pela fonte.
9. O efeito não reage ao mouse e não possui animação própria.
10. Material, luz, bordas, stickers, fundo, layout e responsividade permanecem inalterados.
11. O efeito continua em um único draw call fullscreen e sem novos assets.

## Fora de escopo

- alterar ou reotimizar o modelo 3D;
- redesenhar a composição do hero;
- mudar a intensidade do ambiente ou das luzes;
- adicionar bloom ou pós-processamento;
- animar as manchas independentemente;
- introduzir textura prismática;
- publicar, mesclar ou enviar a branch ao remoto.
