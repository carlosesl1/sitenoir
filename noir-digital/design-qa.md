# Design QA — Anotações tipográficas da página de contato

## Evidência

- Fonte visual: sete recortes de `preview_annotation` enviados pelo usuário nesta conversa para a rota de contato.
- Implementação: snapshots do navegador colaborativo T3, aba `tab_a`, rota `/contato/?effects=off`.
- Desktop: viewport e screenshot de `1280 × 800` CSS px, densidade padrão do navegador.
- Mobile: viewport e screenshot de `390 × 844` CSS px, densidade padrão do navegador.
- Estado: tema escuro, página carregada, sem interação com o formulário.

## Comparação completa

- A composição, o grid, os painéis, o fundo e os ícones permaneceram inalterados.
- A linha de localização foi removida sem deixar uma divisão ou altura residual na lista.
- No mobile, `documentElement.scrollWidth` e o viewport mediram `390px`; não há overflow horizontal.

## Comparação focada

- E-mail: `Geist Mono`, `10px`, `text-transform: none`; texto renderizado em minúsculas.
- Telefone: `Geist Mono`, `10px`, sem transformação para caixa alta.
- Horário: `Geist Mono`, `10px`, preservando `Seg - Sex, 09h às 18h`.
- Privacidade: `Geist Mono`, `10px`, duas linhas preservadas.
- Tag internacional: `Geist Mono`, `10px`, texto e ícones preservados.
- CTA do WhatsApp: `TikTok Sans`, peso `700`, reduzido de `14px` para `10px`, mantendo o estilo Spectrum da home.

## Superfícies de fidelidade

- Tipografia: valores informativos migrados de Departure Mono para Geist Mono; o CTA continua na família display aprovada.
- Espaçamento: a remoção da localização compactou naturalmente a lista; nenhum padding ou grid track foi alterado.
- Cores: tokens e contrastes existentes foram preservados.
- Imagens e ícones: nenhuma alteração; ícones Solar e WhatsApp existentes foram mantidos.
- Copy: localização removida; demais textos permanecem exatamente como anotados.

## Histórico

- P2 anterior: fontes informativas divergiam da anotação e o e-mail aparecia em caixa alta. Corrigido com `--font-interface` e `text-transform: none`.
- P2 anterior: localização ainda era exibida. O nó foi removido do componente e há cobertura de regressão no teste.
- P2 anterior: texto do CTA do WhatsApp estava em `14px`. Corrigido para `10px` somente nesse CTA.
- Evidência pós-correção: snapshots desktop/mobile e estilos computados no T3 confirmam as três correções.

## Verificação visual

- Interações principais preservadas: links de e-mail, telefone e WhatsApp continuam com os mesmos destinos.
- Console: nenhum erro da aplicação; somente o aviso de desenvolvimento já existente do React Grab.
- Testes focados: 2 arquivos, 12 testes aprovados.
- Suíte completa: 79 arquivos, 344 testes aprovados.
- Biome focado: aprovado.
- Typecheck: aprovado.
- Build: aprovado, com 19 páginas estáticas geradas.

## Iteração — grid mobile da página de contato

- Referência visual: screenshot mobile enviado pelo usuário nesta conversa; a home foi usada como benchmark direto do eixo horizontal existente.
- Viewports comparados: referência aproximada de `405 × 729` px e implementação em `390 × 844` CSS px.
- Na home, logo, conteúdo do título e CTA usam o eixo visual de `24px`: container externo em `16px` e respiro interno de `8px`.
- Na página de contato, logo, título, descrição e primeiro campo agora medem `x = 24px` no mesmo viewport de `390px`.
- O limite estrutural do grid permanece em `x = 16px`; somente o inset interno dos painéis mobile passou de `16px` para `8px`.
- A seção do projeto compensa o novo inset com margens de `-8px`, mantendo a linha divisória alinhada ao grid externo sem deslocar os campos.
- Mobile: `documentElement.scrollWidth = 390px`; não há overflow horizontal.
- Desktop: verificado em `1280 × 800` CSS px; a regra é restrita ao breakpoint mobile e a composição desktop permaneceu inalterada.
- Interações, conteúdo, animações e comportamento responsivo do formulário não foram alterados.
- Console: nenhum erro novo da aplicação; permanecem apenas avisos já existentes do ambiente de desenvolvimento.
- Verificação final: 79 arquivos e 345 testes aprovados; typecheck e build de 19 páginas concluídos com sucesso; `git diff --check` sem erros.

final result: passed
