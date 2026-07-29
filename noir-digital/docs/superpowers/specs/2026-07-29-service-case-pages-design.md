# Páginas de Cases e Serviços — Modelo Editorial Híbrido

## Objetivo

Transformar o rascunho editorial existente em `/services` em um template reutilizável para os nove cards do portfólio. Cada card abrirá uma rota própria, apresentando primeiro o case real, depois o valor do serviço para a empresa e, por fim, uma chamada comercial.

O trabalho preserva a linguagem visual, o índice lateral, a hierarquia tipográfica, os capítulos, os blocos de mídia, os metadados e a navegação final do `ServicesArticle` atual. O template será complementado com imagens, vídeos, galerias e créditos específicos, sem criar uma identidade paralela para as páginas internas.

## Rotas e navegação

- A rota dinâmica será `/services/[slug]`.
- Os nove slugs serão os mesmos já cadastrados em `data/projects.ts`.
- Cada card da home apontará para sua rota individual.
- `/services` continuará disponível como página geral de serviços.
- As páginas individuais terão retorno para a seção correspondente da home e navegação para o case anterior e o próximo.
- Slugs desconhecidos retornarão a página 404 do Next.js.
- `generateStaticParams` produzirá as nove páginas durante o build.
- Cada case terá título, descrição e imagem social próprios.

## Estrutura editorial compartilhada

### 1. Introdução e prova principal

A abertura reutiliza a introdução do modelo atual e adiciona uma mídia dominante:

- categoria e nome do cliente;
- título do case;
- ano e entregas;
- texto curto sobre o desafio e a transformação;
- imagem principal do card ou vídeo principal do projeto;
- link externo para o site ou perfil somente quando houver destino real confirmado.

A prova visual aparece antes da explicação comercial. Ela deve mostrar o trabalho realizado sem obrigar o visitante a interpretar uma descrição abstrata.

### 2. Visão geral

Explica o contexto da empresa, a necessidade atendida e o objetivo do trabalho. O texto não atribuirá métricas ou resultados que não estejam documentados.

### 3. O que foi feito

Adapta o capítulo “Como trabalhamos” do rascunho e organiza a entrega em três subcapítulos:

- diagnóstico e direção;
- produção ou implementação;
- entrega e continuidade.

O vocabulário muda conforme a categoria, mas a estrutura permanece estável.

### 4. Evidências do projeto

Bloco modular para mídias reais:

- sites: capturas de hero, desktop, mobile e seções relevantes;
- vídeos: player otimizado, poster e seleção de frames;
- Google: capturas do Perfil da Empresa, busca, mapa, avaliações e presença local.

Cada mídia terá legenda que explica o que ela comprova. Imagens não serão usadas apenas como decoração.

### 5. Valor para a empresa

Conecta a entrega aos benefícios do serviço:

- clareza e confiança para o público;
- redução de atrito na jornada;
- presença digital e descoberta;
- conteúdo capaz de apresentar produtos e experiências;
- base técnica ou operacional que pode continuar evoluindo.

O conteúdo será específico para o case e evitará promessas genéricas.

### 6. Crédito de produção

Os cases de vídeo da Strong, Together e ECOX Hostel Cabanas terão um bloco destacado para:

- **Dolomon**;
- especialista em design, motion design e edição de vídeo;
- participação creditada como editor dos vídeos apresentados.

O componente aceitará uma fotografia real. Enquanto ela não estiver disponível, exibirá um retrato tipográfico intencional com a inicial “D”, sem instruções provisórias e sem usar uma pessoa genérica.

### 7. Próximo passo

O fechamento terá uma chamada comercial curta relacionada à categoria:

- sites: planejar ou evoluir a presença digital;
- vídeos: transformar produtos e histórias em conteúdo visual;
- Google: fortalecer descoberta e confiança nas buscas locais.

O CTA apontará para `/#contact`, seguido pela navegação entre cases.

## Conteúdo dos nove cases

### Sites

#### Together

- Serviço: design e desenvolvimento de site.
- Evidências: hero desktop e mobile, captura completa e imagens editoriais já produzidas.
- Valor: tornar serviços de privacidade e tecnologia mais claros, confiáveis e acionáveis.
- Ênfase: conteúdo técnico organizado, responsividade e conversão para diagnóstico/proposta.

#### Madeireira Fortaleza

- Serviço: design e desenvolvimento de site.
- Evidências: hero, seções de produtos, orçamento e contato.
- Valor: apresentar catálogo e diferenciais com clareza, aproximando demanda local e orçamento.
- Ênfase: linguagem visual ligada à madeira, navegação objetiva e chamadas comerciais.

#### JR Express

- Serviço: design e desenvolvimento de site.
- Evidências: hero, formulário de cotação, serviços e seções institucionais.
- Valor: reduzir atrito para solicitar transporte e comunicar cobertura, confiança e capacidade operacional.
- Ênfase: jornada de cotação e organização dos serviços logísticos.

### Vídeos

#### Strong

- Serviço: motion design e edição de vídeos verticais.
- Evidências: `STRONG WHEY TYPES`, `Gladiator Ultra` e `5 Sabores Potencial Infinito`.
- Valor: transformar atributos de produto em peças rápidas, reconhecíveis e adequadas ao consumo em redes sociais.
- Crédito: Dolomon.

#### Migração Privacy Tools — Together

- Serviço: motion design e edição de vídeo explicativo.
- Evidência: vídeo horizontal de 44,9 segundos sobre a migração para a Privacy Tools.
- Valor: tornar um processo técnico mais compreensível e visualmente consistente com as marcas envolvidas.
- Crédito: Dolomon.

#### ECOX Hostel Cabanas

- Serviço: edição de vídeos verticais de conteúdo e experiência.
- Evidências: `Nova Cabana` e `O que você encontra nas cabanas`.
- Valor: apresentar acomodação e experiência de forma concreta, ajudando o público a imaginar a estadia e avançar para a reserva.
- Crédito: Dolomon.

### Presença no Google

#### Chapada Backpackers

- Serviço: cadastro, estruturação do Perfil da Empresa e SEO local.
- Evidências: perfil, fotos, mapa e avaliação visíveis na captura real.
- Valor: facilitar descoberta, avaliação e contato por pessoas procurando hospedagem em Lençóis.
- Restrições de conteúdo: não transformar avaliações visíveis em alegação de resultado causado pelo serviço.

#### Contábil Sudoeste

- Serviço: cadastro, estruturação do Perfil da Empresa e SEO local.
- Evidências: busca, painel do negócio, endereço e presença local.
- Valor: reforçar legitimidade e facilitar que empresas e pessoas encontrem atendimento contábil na região.

#### Posto Ipiranga

- Serviço: cadastro, estruturação do Perfil da Empresa e SEO local.
- Evidências: busca, fotos, mapa, produtos e painel do estabelecimento.
- Valor: melhorar descoberta em buscas de proximidade e oferecer informações úteis antes da visita.

## Componentes e dados

### Fonte de conteúdo

Um módulo dedicado armazenará os dados editoriais dos cases. Ele será relacionado a `Project.slug`, evitando duplicar título, cliente, ano e imagens principais.

Cada registro terá:

- resumo e contexto;
- entregas;
- capítulos;
- benefícios;
- mídias com tipo, fonte, legenda, proporção e texto alternativo;
- crédito opcional;
- CTA;
- metadados da página.

Testes garantirão que exista exatamente um case para cada projeto e que nenhuma rota dependa de conteúdo incompleto.

### Template

O `ServicesArticle` será generalizado para receber um case como propriedade. Os elementos compartilhados serão divididos apenas quando houver responsabilidade clara:

- introdução;
- índice de capítulos;
- bloco de imagem;
- player de vídeo;
- galeria;
- crédito;
- CTA e navegação entre cases.

O template não introduzirá um segundo sistema de tema, tipografia ou espaçamento.

## Assets e desempenho

- Imagens editoriais serão geradas em WebP com dimensões estáveis.
- Capturas maiores usarão `next/image`, `sizes` responsivo e carregamento tardio abaixo da dobra.
- Somente a mídia principal poderá receber prioridade.
- Os seis vídeos serão transcodificados para versões web:
  - Together em paisagem;
  - Strong e ECOX em retrato;
  - H.264 em MP4, resolução adequada ao maior tamanho renderizado e bitrate reduzido;
  - poster WebP;
  - `preload="metadata"`;
  - sem autoplay;
  - controles nativos e `playsInline`.
- Os vídeos originais permanecerão em `asset-sources` ou fora de `public`; apenas versões otimizadas serão entregues ao navegador.
- O layout reservará a proporção da mídia para evitar mudança de tamanho durante o carregamento.
- Nenhum novo canvas, WebGL ou loop contínuo será adicionado às páginas.

## Direção visual

- **Tese visual:** documentação editorial de um trabalho real, com a mídia do cliente como prova e a malha técnica da NOIR DIGITAL como estrutura.
- **Tipografia:** reutilizar as funções existentes de display, interface e pixel.
- **Cores:** superfícies e textos continuam usando os tokens globais; cores dos clientes aparecem somente em detalhes de mídia, marcadores e estados de interação.
- **Layout:** índice lateral no desktop, coluna editorial central e mídias que podem ultrapassar a largura do texto sem romper a malha.
- **Assinatura:** cada mídia recebe numeração, categoria e legenda técnica, transformando imagens e vídeos em evidências documentadas.
- **Risco controlado:** usar escala visual maior nas mídias sem transformar a página em uma galeria solta ou ocultar a narrativa.

## Interação e movimento

- O índice continuará acompanhando o capítulo ativo.
- Links de capítulos usarão o comportamento de rolagem já existente.
- Imagens poderão entrar com uma transição curta de opacidade e deslocamento, respeitando `prefers-reduced-motion`.
- Players não iniciarão automaticamente.
- Controles importantes serão acessíveis por teclado e terão foco visível.
- Nenhum conteúdo dependerá de hover.

## Responsividade

### Desktop

- Índice fixo lateral.
- Coluna editorial central mais larga nos trechos de mídia.
- Galerias de sites e Google alternam uma mídia ampla e pares menores.
- Vídeos verticais aparecem em uma faixa de até três players, preservando a proporção.

### Tablet

- Índice deixa de ser fixo quando a largura lateral for insuficiente.
- Galerias usam duas colunas quando houver espaço.
- Texto e mídia mantêm hierarquia sem reduzir excessivamente a tipografia.

### Mobile

- Página em uma coluna.
- Índice vira uma faixa navegável ou permanece acessível semanticamente sem ocupar a primeira dobra.
- Mídias ocupam a largura disponível.
- Vídeos verticais são apresentados individualmente.
- Metadados e navegação entre cases empilham.
- Nenhum texto, controle ou mídia causa rolagem horizontal.

## Acessibilidade

- Um `h1` único e hierarquia sequencial de títulos.
- Textos alternativos descrevem a evidência, não repetem o nome do cliente.
- Vídeos terão identificação textual e suporte a legenda quando houver arquivo de legenda disponível.
- Controles nativos de vídeo permanecem disponíveis.
- Contraste e foco reutilizam os padrões do site.
- O CTA terá rótulo específico para a ação.
- O retrato tipográfico de Dolomon será decorativo quando o nome já estiver adjacente.

## Verificação

### Testes automatizados

- nove projetos apontam para nove rotas individuais;
- todo projeto possui um case correspondente;
- `generateStaticParams` contém todos os slugs;
- metadados são específicos por case;
- páginas de vídeo exibem o crédito de Dolomon;
- páginas sem vídeo não exibem o crédito;
- mídias possuem proporção e texto alternativo;
- CTA e navegação entre cases têm destinos válidos;
- slugs desconhecidos retornam 404.

### Verificação de integração

- checagem de tipos;
- suíte de testes;
- build de produção;
- inspeção do HTML gerado para as rotas estáticas;
- confirmação de que somente assets referenciados são entregues.

### Verificação visual

- desktop e mobile para um case de cada categoria;
- abertura dos nove cards;
- carregamento e controles dos seis vídeos;
- índice ativo, foco por teclado e navegação anterior/próximo;
- ausência de overflow e texto cortado;
- comportamento com movimento reduzido;
- comparação visual com a página editorial existente para confirmar continuidade de identidade.
