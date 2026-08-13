# Feixes Prismáticos Naturais do NOIR

Data: 2026-08-13
Status: Direção visual aprovada, aguardando revisão da especificação

## Objetivo

Refinar somente a forma das cores espectrais da variante Canvas UI do hero. O NOIR deve continuar escuro, transparente e legível, mas os reflexos coloridos precisam se aproximar da referência aprovada: feixes prismáticos diagonais, estreitos e localizados, acompanhados por bordas claras com separação cromática muito fina.

O trabalho permanece isolado na branch `codex/noir-prismatic-glass`. Não serão alterados o modelo GLB, a composição do hero, os stickers, o fundo, o loader, o movimento do objeto ou a home padrão.

## Leitura da referência aprovada

A referência combina duas respostas ópticas distintas:

1. **Borda do vidro:** filete quase branco e contínuo, com deslocamentos vermelho, amarelo, verde e azul extremamente finos nas laterais. A borda é clara antes de ser colorida; não existe outline RGB grosso.
2. **Interior do volume:** poucos feixes diagonais de espectro, com tamanho e posição diferentes. Eles têm centro saturado, largura moderadamente variável, pontas suaves e zonas escuras entre as cores. Não atravessam cada letra como uma fita regular.

O corpo frontal permanece predominantemente preto/transparente. A cor aparece em segmentos selecionados, especialmente próximos a mudanças de face e chanfros.

## Forma escolhida

Cada feixe será uma **riscada prismática alongada**, não uma elipse, mancha circular ou faixa infinita.

- eixo diagonal definido por feixe;
- envelope longitudinal assimétrico, com entrada e saída suaves;
- leve afunilamento nas pontas;
- largura variável ao longo do eixo, sem ondulação excessiva;
- pequena curvatura estática para evitar aparência geométrica perfeita;
- espectro transversal na ordem vermelho, amarelo, verde e azul;
- intensidade irregular e controlada, com trechos parcialmente ocultos;
- sem núcleo branco atravessando o centro do arco-íris;
- sem animação temporal e sem resposta ao ponteiro.

Os feixes continuarão estáticos no espaço da tela. A mudança percebida virá apenas do movimento e da perspectiva do vidro ao refratar a fonte.

## Arquitetura

O efeito continuará usando a fonte espectral fullscreen existente e o pipeline de refração atual. Não serão adicionadas texturas, novas luzes, novos render targets ou novas malhas visíveis.

O shader da fonte trocará a máscara retangular/Gaussiana uniforme por uma máscara de riscadas prismáticas composta por:

- coordenadas locais rotacionadas por feixe;
- envelope longitudinal com controles independentes de ataque e queda;
- largura interpolada entre início, centro e fim;
- deslocamento curvo estático de baixa amplitude;
- recortes suaves que criam irregularidade sem ruído pixelado;
- separação transversal com pequenas zonas de baixa energia entre as quatro cores.

A configuração de cada feixe passará a descrever forma, e não apenas posição:

- centro, ângulo e comprimento;
- largura inicial, máxima e final;
- curvatura e assimetria;
- força e fase cromática;
- recorte/irregularidade determinística.

Serão usados poucos feixes, com escalas diferentes, para evitar repetição visual e preservar o preto do corpo.

## Bordas

O material de vidro atual continuará responsável pelo highlight branco principal. O shader espectral não pintará todo o contorno.

O ajuste cromático de borda permanecerá subordinado ao branco:

- separação RGB com espessura visual mínima;
- brilho concentrado em chanfros e cantos;
- nenhuma borda colorida uniforme;
- nenhuma ampliação do highlight branco que volte a estourar as faces.

## Cores

A paleta permanece exatamente:

- vermelho `#d23012`;
- amarelo `#fce609`;
- verde `#21d344`;
- azul `#03357c`.

As cores poderão receber compensação de luminância no shader para manter leitura óptica, mas não serão substituídas por magenta, ciano, marrom ou tons pastel. A mistura entre bandas deve conservar as quatro cores reconhecíveis.

## Desempenho

O efeito continua sendo um único draw call fullscreen com quatro feixes e sem uniforme de tempo. A nova máscara usa apenas operações matemáticas pequenas e determinísticas. Não haverá nova captura da cena, textura externa, luz dinâmica ou trabalho dependente do mouse.

## Testes e verificação

Antes da implementação, os testes de configuração serão atualizados para falhar com o contrato atual e cobrir os novos parâmetros de forma.

A verificação incluirá:

- testes focados da configuração e geração do shader;
- TypeScript e Biome nos arquivos alterados;
- build de produção;
- comparação visual da home Canvas UI no desktop e mobile;
- inspeção com o modelo em diferentes ângulos;
- confirmação de que não há luz ou cor ligada ao ponteiro;
- confirmação de que a variante padrão permanece inalterada.

## Critérios de aceitação

1. Os espectros são riscadas diagonais localizadas, não faixas retas uniformes nem manchas circulares.
2. As pontas desaparecem suavemente e a largura varia de modo discreto.
3. Vermelho, amarelo, verde e azul continuam identificáveis, sem branco no meio da faixa.
4. O corpo do NOIR permanece predominantemente escuro e transparente.
5. As bordas são claras e finas, com cromatismo secundário e delicado.
6. O efeito não reage ao mouse e não possui animação cromática própria.
7. A intensidade não volta a estourar as faces frontais.
8. O custo de renderização permanece equivalente ao efeito atual.
9. Stickers, fundo, layout, movimento e responsividade não mudam.

## Fora de escopo

- alterar ou reotimizar o GLB;
- criar novos feixes fora do vidro;
- adicionar bloom ou pós-processamento global;
- recolocar luz presa ao mouse;
- redesenhar o hero ou seus stickers;
- publicar, mesclar ou enviar a branch ao remoto.
