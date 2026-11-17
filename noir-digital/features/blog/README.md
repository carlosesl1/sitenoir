# Blog

Cada post é um arquivo Markdown em `content/blog/`. O nome do arquivo vira o endereço: `meu-post.md` é publicado em `/blog/meu-post`. Use só letras minúsculas, números e hífens no nome.

## Cabeçalho

Todo post começa com este bloco. Os seis campos são obrigatórios, e o build falha com uma mensagem clara se faltar algum.

```md
---
title: Título do artigo
description: Resumo de até 200 caracteres. Aparece na lista, no Google e ao compartilhar.
date: 2026-11-16
image: /blog/meu-post.webp
imageAlt: O que a imagem mostra, em uma frase
category: Sites
---
```

- `date` ordena a lista (mais recente primeiro) e segue o formato `ano-mês-dia`.
- `image` é a imagem de destaque: aparece no cartão da lista e no topo do artigo. Salve o arquivo em `public/blog/`, de preferência em WebP, 1600 × 900 px (16:9). Outras proporções são cortadas para 16:9.
- `imageAlt` descreve a imagem para quem usa leitor de tela.
- `category` cria o filtro na lista. Reaproveite as categorias que já existem antes de criar outra.

## Texto

O leitor entende um subconjunto de Markdown: parágrafos, `##` e `###`, listas com `-` ou `1.`, citações com `>`, `**negrito**`, `*itálico*` e `[links](/contato)`. HTML não é interpretado. Separe os blocos com uma linha em branco.

O tempo de leitura é calculado sozinho.

## Publicar

Um post entra no ar no próximo deploy, ou seja, quando o arquivo chega à `main`. O sitemap é atualizado junto.

Os artigos existem só em português. A interface do blog (menu, rótulos, botões) acompanha o seletor PT/EN.
