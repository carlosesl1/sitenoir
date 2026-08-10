# Capas Gráficas para Contábil Sudoeste e Posto Ipiranga

Data: 2026-08-10
Status: Direção aprovada

## Objetivo

Substituir as capas excessivamente textuais dos projetos Contábil Sudoeste e Posto Ipiranga, exibidas no grupo de serviços de presença no Google, por duas composições gráficas quadradas que funcionem como uma família visual. As novas capas devem comunicar organização, localização e presença digital sem reproduzir telas, resultados de busca ou interfaces do Google.

## Direção visual

As duas capas usam a mesma gramática estrutural:

- fundo preto e grafite integrado à linguagem visual da NOIR;
- composição central formada por volumes arquitetônicos modulares;
- linhas finas de rota, coordenadas e pontos luminosos;
- iluminação cinematográfica controlada, alto contraste e bastante espaço negativo;
- enquadramento frontal em perspectiva suave, com o objeto ocupando a mesma área nas duas imagens;
- acabamento editorial e tecnológico, sem aparência de dashboard, anúncio ou mockup de navegador.

A identidade de cada cliente aparece pelo significado dos volumes e pela cor de destaque:

- **Contábil Sudoeste:** blocos organizados como livros-caixa, edifícios e gráficos ascendentes, com luz dourada e cobre;
- **Posto Ipiranga:** a mesma lógica modular reorganizada como cobertura, pista e rota de mobilidade, com luz amarela e azul.

As capas não incluem palavras, números, logotipos reconstruídos por IA, telas do Google, estrelas, avaliações, barras de busca ou pequenos elementos que pareçam texto. O nome do projeto e sua categoria continuam sendo apresentados pela legenda HTML já existente no card.

## Sistema de pares

O par deve parecer concebido em conjunto, não apenas duas imagens escuras independentes. Para isso, ambos preservam:

- proporção 1:1;
- mesma câmera, horizonte e escala do objeto principal;
- mesma densidade de elementos e posição dos pontos de luz;
- fundo e tratamento de materiais equivalentes;
- diferença cromática limitada aos acentos próprios de cada cliente.

O estado `main` utiliza iluminação mais contida. O estado `hover` mantém exatamente a mesma composição e recebe uma gradação mais luminosa nos pontos, rotas e arestas. O `hover` será derivado do mesmo master aprovado, evitando que o objeto mude de forma quando o usuário passa o cursor.

## Geração e tratamento de ativos

Os dois masters quadrados serão gerados prioritariamente pelo GPT na web, na sessão autenticada indicada pelo usuário, com a ferramenta `Criar imagem` explicitamente selecionada. Cada cliente será gerado como uma imagem real separada, nunca como grade, colagem, SVG, canvas, código ou pacote compactado.

Depois da escolha dos masters:

1. salvar um master por cliente na pasta de fontes já usada pelo projeto;
2. produzir o estado `hover` por tratamento de luz e cor sobre o mesmo master;
3. executar o pipeline existente de `scripts/build-work-assets.mjs`;
4. atualizar somente os arquivos públicos de Contábil Sudoeste e Posto Ipiranga.

Para cada cliente, o contrato público permanece:

- `*-google-main.webp` em 1200 x 1200;
- `*-google-main-480.webp`, `*-720.webp` e `*-960.webp`;
- `*-google-hover.webp` em 1200 x 1200;
- `*-google-hover-480.webp`, `*-720.webp` e `*-960.webp`.

Os caminhos consumidos por `data/projects.ts` permanecem inalterados. Os textos alternativos devem ser ajustados apenas se necessário para descrever com precisão as novas composições gráficas.

## Integração e comportamento

Não haverá mudança de layout, proporção dos cards, animação, transição de hover, ordem dos projetos ou navegação para os estudos de caso. A troca se limita aos ativos e, se necessário, aos respectivos textos alternativos.

Se uma geração apresentar texto ilegível, marcas deformadas, objetos incoerentes ou estilo incompatível, ela será rejeitada e regenerada no GPT web. Se o master for válido mas o hover ficar excessivamente diferente, o hover será refeito a partir do master, sem alterar a composição.

## Verificação

- Confirmar que somente os ativos de Contábil Sudoeste e Posto Ipiranga, além de eventuais textos alternativos, foram modificados.
- Verificar dimensões, proporção e integridade dos 16 WebPs resultantes.
- Comparar os dois cards lado a lado em desktop para validar câmera, escala e estrutura compartilhadas.
- Validar os estados `main` e `hover` sem salto de enquadramento.
- Inspecionar os cards em 390 px e 1920 px, nos temas suportados.
- Executar os testes focados da seção de projetos, o typecheck e o build de produção após a integração.

## Fora de escopo

- Alterar o projeto Chapada Backpackers.
- Redesenhar os estudos de caso completos ou seus ativos internos.
- Modificar a estrutura da seção de serviços, WebGL, movimentos ou tipografia.
- Inserir métricas, avaliações ou resultados comerciais não verificados.
- Publicar as novas capas sem um pedido explícito separado.
