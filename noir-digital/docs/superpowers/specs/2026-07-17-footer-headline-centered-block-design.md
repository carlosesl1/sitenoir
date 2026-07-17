# Headline Centralizado do Footer

## Objetivo

Reorganizar a frase sobre o 3D do footer para que sua ordem de leitura seja imediata. A composição prioriza clareza textual, aceitando uma sobreposição maior sobre o objeto central.

## Conteúdo aprovado

O headline passa de quatro para três linhas:

1. `O PRÓXIMO PASSO`
2. `DO SEU NEGÓCIO`
3. `COMEÇA AQUI.`

O texto e seu significado permanecem os mesmos; somente a quebra de linha é alterada.

## Composição

- As três linhas formam um único bloco centralizado horizontalmente.
- A leitura ocorre linearmente de cima para baixo, sem alternar entre lados opostos da tela.
- O bloco permanece à frente do 3D, usando a camada tipográfica existente.
- O 3D continua centralizado, animado e interativo; escala, shader, flare e movimento não serão modificados.
- A largura do headline será limitada para evitar que a primeira linha encoste nas margens em viewports intermediários.

## Responsividade

### Desktop

- Bloco centralizado sobre a região principal do 3D.
- As três linhas usam alinhamento central.
- A escala tipográfica mantém o impacto atual, com ajuste apenas se necessário para a primeira linha caber em uma única linha.

### Tablet e mobile

- As mesmas três quebras são preservadas.
- O bloco ocupa a largura disponível entre as margens do site.
- O tamanho usa `clamp` ou valores responsivos já existentes para impedir overflow.
- Nenhuma palavra será dividida e nenhuma linha será ocultada atrás do viewport.

## Escopo técnico

- Atualizar `contactHeadlineLines` em `data/content.ts`.
- Simplificar o grid de `.headline` em `ContactFooter.module.css` para três linhas centralizadas.
- Atualizar o teste do footer para esperar as três linhas aprovadas.
- Não alterar o componente 3D, os materiais, o canvas, o footer informativo ou as rotas.

## Verificação

- Executar o teste direcionado de `ContactFooter`.
- Executar o build de produção.
- Inspecionar o bloco no localhost em desktop e mobile, confirmando leitura clara, ausência de overflow e preservação do 3D.

