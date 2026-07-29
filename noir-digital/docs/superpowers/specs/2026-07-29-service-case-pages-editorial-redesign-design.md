# Redesign editorial das páginas de cases

## Objetivo

Elevar as nove páginas de cases da NOIR DIGITAL sem romper a identidade do site. A revisão deve corrigir proporções inadequadas, enquadramentos inconsistentes, repetição de conteúdo e a sensação de que todos os projetos foram encaixados no mesmo artigo.

O novo sistema terá três estruturas editoriais, uma para cada categoria do portfólio:

- Sites;
- Vídeos;
- Presença no Google.

As categorias compartilham o sistema NOIR, mas conduzem a narrativa de formas diferentes. Cada cliente altera acentos cromáticos, ritmo e composição das evidências sem criar um tema paralelo.

## Critérios de sucesso

- As nove páginas continuam reconhecíveis como partes do mesmo portfólio.
- Sites, Vídeos e Google deixam de parecer variações idênticas do mesmo template.
- Nenhuma imagem relevante é cortada, esticada ou colocada em proporção arbitrária.
- Cada case apresenta somente conteúdo necessário e específico.
- Mockups editoriais valorizam o projeto sem substituir a evidência real.
- Vídeos preservam suas proporções originais e permanecem controláveis.
- Desktop e mobile apresentam a mesma narrativa sem overflow.
- O estado atual dos cases pode ser restaurado sem afetar outras áreas do site.

## Sistema compartilhado

### Identidade

Todas as páginas reutilizam:

- cabeçalho, controles e transições existentes;
- tokens de fundo, texto, borda e superfícies;
- tipografia de display, interface e pixel;
- grid editorial e margens do site;
- metadados, navegação entre cases e CTA final;
- estados de foco, redução de movimento e comportamento responsivo.

Os títulos usam peso `600`. A hierarquia depende de escala, espaço e contraste, não de pesos excessivamente bold.

### Grid e ritmo

- A largura editorial permanece limitada e centralizada.
- Texto corrido usa uma medida de leitura de aproximadamente 60 a 68 caracteres.
- Mídias podem ultrapassar a coluna de texto quando a evidência precisa de escala.
- Legendas, numeração e metadados usam o mesmo alinhamento em todas as categorias.
- Espaçamentos seguem uma escala comum; cada categoria altera a cadência, não os valores fundamentais.

### Cor

A interface permanece predominantemente neutra. A identidade do cliente aparece em:

- marcadores;
- linhas;
- pequenos fundos;
- índices;
- estados de interação;
- detalhes dos mockups.

Não haverá uma troca completa de tema por cliente.

## Estrutura de Sites

Os cases de Sites funcionam como apresentações de projetos digitais.

### Abertura

- Categoria, cliente e metadados discretos.
- Título curto e resumo de até duas linhas.
- Mockup editorial novo e amplo.
- Proporção definida pelo mockup, sem um frame global obrigatório em 16:9.
- Acento cromático baseado no cliente:
  - Together: amarelo;
  - Madeireira Fortaleza: verde;
  - JR Express: vermelho e azul.

### Narrativa por cliente

#### Together

1. Desafio de comunicar serviços técnicos.
2. Arquitetura e hierarquia do conteúdo.
3. Experiência responsiva e caminhos comerciais.

#### Madeireira Fortaleza

1. Produto e confiança local.
2. Organização das categorias e aplicações.
3. Jornada até orçamento e contato.

#### JR Express

1. Necessidade de explicar capacidade logística.
2. Organização dos serviços.
3. Cotação como ação principal.

### Galeria

- Uma captura ampla da interface.
- Uma composição desktop/mobile quando houver material adequado.
- Recortes reais das seções mais importantes.
- Proporções nativas registradas nos dados.
- Legendas curtas que explicam a decisão mostrada.
- Sequência assimétrica, evitando uma pilha de três imagens iguais.

### Fechamento

Um bloco comercial relaciona o case ao serviço de desenvolvimento de sites, sem repetir todos os benefícios anteriores.

## Estrutura de Vídeos

Os cases de Vídeos são conduzidos pelo audiovisual e usam menos texto.

### Abertura

- Título, contexto em uma frase e metadados.
- Hero editorial criado a partir de frames reais.
- Player principal próximo da abertura.
- Sem autoplay.
- Proporção original preservada.

### Strong

- Um vídeo vertical em destaque.
- Dois vídeos complementares em uma galeria de campanha.
- Frames de produto usados como pausas visuais.
- Variações cromáticas respeitam a identidade dos produtos sem alterar o tema da página.

### Together Motion

- Player horizontal dominante.
- Pequena sequência visual das etapas exportar, tratar e importar.
- Texto focado em clareza de processo e comunicação técnica.

### ECOX Hostel Cabanas

- Dois players verticais lado a lado no desktop.
- Players empilhados no mobile.
- Frames ambientais intercalados para apresentar atmosfera, estrutura e experiência.

### Crédito do Dolomon

O crédito integra a direção da página, em vez de aparecer como um anexo:

- nome;
- design, motion design e edição de vídeo;
- função específica no projeto;
- espaço para fotografia real;
- retrato tipográfico usado somente enquanto a foto não estiver disponível.

### Fechamento

CTA curto para produção de vídeo, sem uma nova lista de benefícios.

## Estrutura de Presença no Google

Os cases de Google são documentais e organizam a jornada real de busca.

### Abertura

- Título ligado à intenção local.
- Hero editorial híbrido com resultado de pesquisa, perfil e contexto geográfico.
- Capturas reais permanecem legíveis.
- Não serão inventadas avaliações, métricas ou posições.

### Jornada

1. A pessoa realiza uma busca.
2. Encontra o perfil.
3. Verifica fotos, categoria, localização e contato.
4. Decide visitar, solicitar rota ou iniciar contato.

### Chapada Backpackers

- Descoberta de hospedagem.
- Imagens do espaço.
- Localização e intenção de reserva.

### Contábil Sudoeste

- Legitimidade e identidade do escritório.
- Endereço e presença regional.
- Formas de contato.

### Posto Ipiranga

- Proximidade e rota.
- Fotos, produtos e informações do estabelecimento.
- Dados úteis antes da visita.

### Evidências

- Capturas sempre em proporção nativa.
- Uma moldura editorial consistente.
- Observações vinculadas diretamente às imagens.
- Nenhuma avaliação visível é apresentada como resultado causado pelo trabalho de SEO.

### Fechamento

CTA para estruturação de presença local, seguido pela navegação entre cases.

## Produção híbrida de imagens

### Princípio

Imagens geradas valorizam a apresentação; capturas reais comprovam o trabalho.

### Processo

1. Selecionar as melhores capturas e frames reais.
2. Criar cenários, fundos e atmosferas com GPT Images.
3. Inserir screenshots e logos reais depois da geração.
4. Exportar mockups em aproximadamente duas vezes o maior tamanho renderizado.
5. Produzir WebP otimizado e manter as fontes em `asset-sources`.

O modelo de imagem não deve redesenhar telas com texto. Isso evita interfaces falsas, logos incorretos e tipografia deformada.

### Proporções

- Vídeos verticais: `9:16`.
- Vídeos horizontais: `16:9`.
- Capturas de sites: proporção nativa ou composição editorial declarada.
- Capturas do Google: proporção nativa.
- Heroes: proporção específica por categoria e case.

`object-fit: contain` será usado quando a mídia precisar permanecer completa. `cover` só poderá ser usado em cenários ou fundos sem informação essencial nas bordas.

### Qualidade

- Não ampliar uma captura além de sua resolução útil.
- Gerar novos fundos em resolução suficiente para telas de alta densidade.
- Usar compressão que preserve texto e bordas de interface.
- Inspecionar individualmente cada exportação.
- Reservar dimensões no layout para evitar mudança de tamanho durante o carregamento.

## Conteúdo

### Regras

- Cada página terá de três a cinco blocos editoriais.
- Nenhum capítulo existe apenas para manter simetria com outro case.
- Títulos são curtos e específicos.
- Resumos não repetem a abertura do primeiro parágrafo.
- Legendas explicam o que a mídia demonstra.
- CTAs não repetem listas de benefícios.
- Nenhuma métrica será criada sem evidência.

### Modelo de dados

Os dados deixam de exigir a mesma sequência para todos os cases. Cada registro define:

- `categoryLayout`;
- hero e proporção;
- blocos editoriais ordenados;
- mídias associadas a cada bloco;
- acento do cliente;
- crédito opcional;
- CTA;
- metadados.

Os blocos editoriais terão tipos pequenos e explícitos, como:

- texto;
- imagem ampla;
- comparação de dispositivos;
- galeria;
- player;
- sequência de frames;
- jornada de busca;
- crédito;
- CTA.

O template compartilhado renderiza o shell e delega a composição central ao layout da categoria.

## Arquitetura de componentes

### Shell compartilhado

Responsável por:

- cabeçalho;
- metadados;
- largura geral;
- navegação entre cases;
- estados de carregamento;
- acessibilidade;
- tema.

### Layouts por categoria

- `SiteCaseLayout`;
- `VideoCaseLayout`;
- `GoogleCaseLayout`.

### Componentes de evidência

- `CaseHero`;
- `EditorialImage`;
- `DeviceComparison`;
- `CaseVideoPlayer`;
- `FrameSequence`;
- `SearchJourney`;
- `ProductionCredit`;
- `CaseClosing`.

Esses componentes recebem dimensões e conteúdo pelos dados e não inferem cortes automaticamente.

## Interação

- Mídias podem entrar com transições curtas de opacidade e deslocamento.
- Players não iniciam automaticamente.
- Links e CTAs têm hover, pressed e foco visível.
- Nenhum conteúdo depende exclusivamente de hover.
- `prefers-reduced-motion` remove transições não essenciais.
- A navegação de capítulos só aparece quando a página possui blocos suficientes para justificá-la.

## Responsividade

### Desktop

- Composições assimétricas e sobreposições leves.
- Mídias amplas e galerias específicas por categoria.
- Navegação lateral apenas quando útil.

### Tablet

- Grades reduzem colunas sem cortar o conteúdo.
- Players verticais podem permanecer em duas colunas.
- Mockups mantêm leitura mínima das interfaces.

### Mobile

- Uma coluna.
- Imagens horizontais permanecem horizontais.
- Não transformar capturas em quadrados.
- Vídeos mantêm a proporção original.
- Metadados e navegação empilham.
- Nenhum elemento causa rolagem horizontal.

## Acessibilidade e desempenho

- Um `h1` por página.
- Hierarquia sequencial de títulos.
- Texto alternativo específico.
- Controles nativos de vídeo.
- Contraste e foco compatíveis com o sistema atual.
- Imagem principal com prioridade; demais mídias com carregamento tardio.
- `sizes` responsivo por composição.
- Vídeos com `preload="metadata"`.
- Nenhum novo canvas ou loop contínuo.
- Somente versões otimizadas ficam em `public`.

## Estratégia de retorno

Antes da implementação:

1. Registrar o conjunto exato de arquivos dos cases.
2. Não incluir alterações concorrentes de outras áreas.
3. Manter a especificação e os assets atuais disponíveis.
4. Comparar a nova versão com o estado atual em desktop e mobile.

Se a nova direção for rejeitada, restaurar apenas:

- template e estilos dos cases;
- dados editoriais;
- rotas relacionadas;
- assets criados para a revisão.

Nenhuma restauração poderá afetar a seção de IA, a home ou alterações de outros agentes.

## Verificação

### Conteúdo e dados

- Nove cases válidos.
- Nenhum bloco vazio ou repetido por obrigação.
- Créditos somente nos cases de vídeo.
- Legendas e textos alternativos presentes.
- Rotas e metadados preservados.

### Assets

- Dimensões reais correspondem aos dados.
- Sem upscale indevido.
- Sem imagens esticadas.
- Sem cortes de informação essencial.
- Sem caminhos de `asset-sources` no build.

### Testes

- testes unitários dos dados e layouts;
- rotas dos nove cards;
- build estático das nove páginas;
- players e créditos;
- navegação anterior e próxima;
- ausência de overflow;
- movimento reduzido;
- foco por teclado.

### Auditoria visual

- Desktop e mobile para os nove cases.
- Comparação lado a lado com o estado anterior.
- Hero, primeira dobra, galeria, CTA e navegação.
- Carregamento real das imagens abaixo da dobra.
- Consistência de grid, semibold, legendas e espaçamento.
- Verificação de cada asset na proporção final.

## Decisão de permanência

A nova versão permanece quando:

- cada categoria possui identidade editorial reconhecível;
- as páginas continuam claramente NOIR;
- a evidência real está mais legível;
- o conteúdo está mais curto e específico;
- nenhuma regressão funcional ou responsiva foi introduzida.

Se esses critérios não forem atendidos, o conjunto dos cases retorna ao estado registrado antes da implementação.
