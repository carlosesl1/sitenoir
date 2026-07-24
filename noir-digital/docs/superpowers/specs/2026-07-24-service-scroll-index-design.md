# Índice de serviços orientado pelo scroll

## Objetivo

Adicionar à seção de serviços da home um índice editorial que acompanhe o título fixo, destaque o serviço correspondente à posição de leitura e permita navegar por clique. A mesma infraestrutura deve substituir o rastreamento contínuo usado pelo sumário da página de projeto.

## Escopo

### Home

- Exibir o índice abaixo do título “Serviços que estruturam sua empresa para crescer”.
- Mostrar os itens:
  1. Sites
  2. Vídeos
  3. Presença no Google
  4. Redes sociais
- Manter o índice dentro do mesmo bloco fixo do título.
- Exibir o índice somente em viewports desktop a partir de 1024 px.
- Preservar a composição mobile atual, sem índice.
- Destacar automaticamente o item correspondente ao grupo em leitura.
- Permitir scroll suave até o grupo ao clicar.

### Página de projeto

- Preservar conteúdo, aparência, breakpoints e comportamento de clique do sumário existente.
- Substituir o rastreamento baseado em eventos contínuos de `scroll` e leituras de `getBoundingClientRect()` pelo observer compartilhado.

## Direção visual

O índice deve parecer parte do sistema editorial técnico da NOIR DIGITAL, não um novo componente sobreposto.

- Tipografia: reutilizar as famílias de interface já existentes.
- Cor inativa: `var(--text-secondary)`.
- Cor ativa: `var(--text-primary)`.
- Marcador ativo: ponto circular discreto, alinhado à primeira linha.
- Peso ativo: maior que os itens inativos.
- Movimento: apenas transição curta de cor e opacidade.
- Espaçamento: o índice ocupa a área livre abaixo do título sem competir com ele.

## Arquitetura

Criar um hook compartilhado `useScrollSpy`.

### Interface

O hook recebe:

- lista ordenada de IDs;
- ID inicial;
- configuração da linha de leitura por `rootMargin`, com padrão `-18% 0px -72% 0px`.

O hook devolve:

- ID atualmente ativo.

### Comportamento

- Usar `IntersectionObserver`.
- Observar somente os elementos cujos IDs foram fornecidos.
- Selecionar o item mais relevante na faixa de leitura configurada.
- Manter o primeiro item ativo antes de qualquer interseção.
- Desconectar o observer ao desmontar.
- Não registrar listeners contínuos de `scroll`.
- Se `IntersectionObserver` não existir, manter o ID inicial e preservar a navegação por hash.

## Componentes

### `ServiceStatement`

- Receber ou importar os grupos já definidos em `data/projects.ts`.
- Renderizar um `nav` abaixo do título.
- Usar o hook compartilhado para definir `aria-current="location"`.
- Usar o `ScrollProvider` existente para o clique suave.
- Atualizar o hash sem provocar salto nativo.

### `ServicesArticle`

- Remover o estado atualizado por listener manual de scroll.
- Consumir `useScrollSpy` com os IDs dos capítulos existentes.
- Preservar `scrollToChapter`, hashes e marcação acessível.

## Linha de leitura

O observer deve considerar ativo o conteúdo que atravessa uma faixa próxima ao topo útil da viewport, abaixo do cabeçalho. A configuração inicial usará uma faixa estreita por meio de `rootMargin`, evitando alternância prematura entre grupos longos.

Se dois elementos forem relevantes durante a mesma atualização, vence o último item na ordem do documento que já alcançou a faixa de leitura.

## Acessibilidade e fallback

- O índice deve usar `nav` com nome acessível.
- Links devem manter `href` real para cada hash.
- O item ativo deve usar `aria-current="location"`.
- O foco por teclado deve ser visível.
- A navegação deve continuar funcional sem observer.
- `prefers-reduced-motion` deve remover transições não essenciais; o conteúdo e a navegação permanecem intactos.

## Responsividade

- Home: ocultar o índice abaixo de 1024 px.
- Página de projeto: manter o breakpoint existente de 1180 px.
- Não alterar dimensões ou posição do título atual.
- Garantir que o bloco fixo completo caiba na viewport desktop sem sobrepor o status inferior.

## Testes

### Unitários

- Retorna o primeiro ID como estado inicial.
- Atualiza o ID quando um alvo entra na faixa observada.
- Resolve múltiplas interseções pela ordem dos IDs.
- Desconecta o observer no cleanup.
- Mantém fallback estável sem `IntersectionObserver`.

### Componentes

- Home renderiza os quatro links na ordem correta.
- O item ativo recebe `aria-current="location"`.
- Clique atualiza o hash e chama o scroll suave.
- Página de projeto preserva seus sete links e seleção.
- CSS da home oculta o índice abaixo de 1024 px.

### Navegador

- Confirmar troca de destaque durante scroll em desktop.
- Confirmar clique e destino de cada serviço.
- Confirmar ausência do índice na home mobile.
- Confirmar ausência de overflow e sobreposição.
- Confirmar que o sumário da página de projeto continua funcional.

## Fora de escopo

- Alterar nomes ou ordem dos serviços.
- Mudar a estrutura dos cards.
- Exibir o índice da home no mobile.
- Redesenhar o sumário da página de projeto.
- Adicionar animações de entrada ou efeitos gráficos ao índice.
