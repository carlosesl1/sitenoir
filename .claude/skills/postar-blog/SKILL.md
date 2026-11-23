---
name: postar-blog
description: Escreve e publica um post no blog da NOIR Digital (texto em Markdown, capa no estilo de desenho técnico, PR). Use quando pedirem "posta no blog", "escreve um post sobre X", "cria um artigo", "mais posts no blog" ou para trocar a capa de um post.
---

# Postar no blog da NOIR

Um post é um arquivo Markdown mais uma capa. Não há painel nem banco de dados: o post entra no ar quando chega à `main`.

Os caminhos abaixo partem de `noir-digital/`. O formato completo do arquivo está em `features/blog/README.md`; leia antes do primeiro post da sessão.

## 1. Tema e endereço

- Liste `content/blog/` e confira que o tema ainda não foi coberto. Se já existe um post próximo, escolha outro ângulo ou avise quem pediu.
- O nome do arquivo vira o endereço (`meu-post.md` → `/blog/meu-post`). Use um slug curto, só com minúsculas, números e hífens, sem data e sem acento.
- Categorias em uso: `Sites`, `Google`, `IA`, `Vídeo`, `Design`, `Posicionamento`. Reaproveite uma delas. Só crie outra se o post não couber em nenhuma, e avise, porque cada categoria vira um botão no filtro.

## 2. Texto

O leitor é dono ou gestor de pequena ou média empresa, sem formação técnica. O post responde a uma dúvida real dele e termina com algo que ele consegue aplicar.

- **Tamanho:** de 350 a 550 palavras, com quatro a seis seções `##`.
- **Abertura:** uma situação concreta que o leitor reconhece, em um ou dois parágrafos curtos, sem título antes.
- **Tom:** direto, em português do Brasil, frases curtas, "você". Explique qualquer termo técnico na primeira vez.
- **Fatos:** não invente números, pesquisas, citações nem nomes de clientes. Sem fonte verificada, escreva em termos gerais ("costuma", "na maioria dos casos").
- **Venda:** o post ensina, não vende. A chamada para contato já aparece sozinha no fim da página; não escreva outra.
- **Formato:** só o que o leitor de Markdown entende: parágrafos, `##`, `###`, listas com `-` ou `1.`, uma citação `>` no máximo, `**negrito**`, `*itálico*` e links. HTML, tabelas, imagens e blocos de código não são interpretados.
- **Links:** internos começam com `/` (`/contato`, `/blog/outro-post`). Confira que o destino existe.

Cabeçalho, com os seis campos obrigatórios:

```md
---
title: Título que diz o benefício ou a dúvida
description: Resumo de até 200 caracteres, que aparece na lista, no Google e ao compartilhar.
date: 2026-11-24
image: /blog/meu-post.webp
imageAlt: Desenho técnico de ... com ... em destaque
category: Sites
---
```

- `date` ordena a lista. Use a data de hoje, salvo pedido diferente. Em um lote, use uma data por post, porque o primeiro da lista vira o destaque.
- `imageAlt` descreve a capa do jeito que ela ficou, então escreva depois de ver a imagem.

## 3. Capa

Toda capa segue o mesmo estilo: desenho técnico em linhas claras sobre preto, vista isométrica, com um único elemento destacado por um brilho prismático suave. O estilo está fixo no script; você só descreve a cena.

```powershell
node scripts/blog-cover.mjs meu-post "an isometric street of small shops with a magnifying glass floating over one of them; the magnifying glass is the highlighted element (a blog cover about local search)."
```

- A cena é escrita em inglês, descreve objetos concretos e diz qual elemento recebe o destaque.
- Não peça texto, números, logotipos nem pessoas reconhecíveis. Pessoas, se houver, são figuras simples em linha.
- O script usa o Codex CLI, leva de um a dois minutos e grava `public/blog/meu-post.webp` em 1600 × 900. Em um lote, rode no máximo cinco ao mesmo tempo.
- Abra a imagem e confira antes de seguir: fundo preto, só linhas, um único destaque e nenhuma letra. Recuse faixas de cor chapadas lado a lado e verde-limão, que não são da marca. Se falhar, ajuste a cena e gere de novo.
- Sem o Codex CLI na máquina, pare e peça a imagem a quem solicitou o post. Não publique com capa de outro estilo.

## 4. Conferência

O build recusa posts com campo faltando, data fora do formato ou imagem fora de `/blog/`. Antes do commit, confira à mão:

- os seis campos do cabeçalho estão preenchidos e `image` aponta para o arquivo que existe em `public/blog/`;
- o slug do arquivo e o da imagem são iguais;
- nenhum bloco usa formato fora da lista da etapa 2.

Não rode `npm run build`, a suíte de testes nem um servidor local na máquina do Carlos: são pesados e o deploy já valida tudo. Um comando curto e pontual é aceitável.

## 5. Publicação

1. Crie uma branch a partir de `origin/main` atualizada (por exemplo `claude/blog-<slug>`).
2. Faça o commit só com o `.md` e o `.webp` do post.
3. Abra o PR com o título do post, a categoria e a capa descrita.
4. **Pare aqui.** O merge na `main` publica no site real, então só faça o merge com um pedido explícito do Carlos naquela conversa. Um "ok" de outra tarefa não vale.
5. Depois do merge, acompanhe o workflow `deploy-hostinger` até o fim e confira no ar, com chamadas leves, que `https://noirdigital.com.br/blog/<slug>/` e a capa respondem 200.

Diga no relato final que o texto foi escrito por IA e precisa da revisão do Carlos, e aponte qualquer afirmação que mereça checagem.
