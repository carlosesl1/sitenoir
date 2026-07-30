# Deploy da Noir Digital na Hostinger

Este projeto usa exportação estática porque o plano Web/WordPress da Hostinger
não executa um servidor Node.js. O workflow
`.github/workflows/deploy-hostinger.yml` valida o projeto, gera
`noir-digital/out` e publica esse diretório por FTPS em `public_html`.

## Segurança da migração

O deploy não usa `--delete` na raiz. Os arquivos do WordPress permanecem no
servidor como contingência e os links antigos continuam caindo no `index.php`
quando não correspondem a uma rota estática.

Antes de cada publicação, o workflow:

1. baixa o `.htaccess` e o `index.html` atuais, caso exista;
2. guarda uma cópia remota em
   `public_html/.noir-rollback/<run-id>-<tentativa>`;
3. envia assets e páginas sem excluir os arquivos antigos;
4. publica `index.html` e `.htaccess` por último;
5. verifica o SHA exato, a página inicial e `/services/`;
6. restaura automaticamente os arquivos de entrada anteriores se algo falhar.

## Environment `production`

Cadastre no GitHub, em **Settings > Environments > production**:

Secrets:

- `HOSTINGER_FTP_HOST`: `noirdigital.com.br` ou o host FTP informado pelo
  hPanel;
- `HOSTINGER_FTP_USER`;
- `HOSTINGER_FTP_PASSWORD`.

Variable:

- `HOSTINGER_FTP_PORT`: `21`.

Não salve a senha FTP no repositório. Como a senha atual foi compartilhada em
texto, troque-a depois do primeiro deploy e atualize somente o secret do GitHub.

## Ativação

Cada push em `main` executa testes, tipagem, build estático, backup dos arquivos
de entrada, publicação por FTPS e verificação com cache bust em:

```text
https://noirdigital.com.br
```

O deploy só é considerado concluído quando o manifesto publicado contém o SHA
da execução e as rotas públicas respondem com sucesso.
