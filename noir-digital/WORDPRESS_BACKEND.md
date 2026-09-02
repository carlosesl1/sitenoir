# Backend WordPress do formulário de contato

Esta integração mantém o frontend da NOIR Digital como export estático e usa o WordPress já instalado em `https://noirdigital.com.br` para persistência e envio das notificações.

## Arquivos

- Mu-plugin: `public/wp-content/mu-plugins/noir-contact-endpoint.php`
- Integração do frontend: `features/contact/submit-contact.ts`
- Formulário: `components/contact/ContactPage.tsx`
- Rota: `app/contato/page.tsx`
- Testes do mu-plugin: `tests/wordpress/noir-contact-endpoint.test.php`
- Workflow: `../.github/workflows/deploy-hostinger.yml`

O mu-plugin é carregado automaticamente pelo WordPress. Ele não precisa — e não deve — ser ativado na tela de plugins.

## Endpoint

```text
POST https://noirdigital.com.br/wp-json/noir/v1/contact
Content-Type: application/json
Accept: application/json
```

O frontend pode usar outra URL sem recompilação de código-fonte por meio da variável pública de build:

```bash
NEXT_PUBLIC_CONTACT_ENDPOINT=https://noirdigital.com.br/wp-json/noir/v1/contact
```

Essa variável contém apenas uma URL pública. Senhas e credenciais SMTP nunca podem ser colocadas em variáveis `NEXT_PUBLIC_*`.

### Payload

```json
{
  "firstName": "Nome",
  "lastName": "Sobrenome",
  "email": "pessoa@empresa.com",
  "company": "Empresa",
  "phone": "(11) 99999-9999",
  "service": "Sites e experiências digitais",
  "message": "Mensagem",
  "website": "",
  "pageUrl": "https://noirdigital.com.br/contato/",
  "source": "Formulário de contato"
}
```

Obrigatórios: `firstName`, `email`, `service` e `message`. `website` é o honeypot e deve permanecer vazio para visitantes reais.

### Respostas

Sucesso, HTTP 200:

```json
{
  "ok": true,
  "leadId": 123,
  "message": "Mensagem recebida com sucesso."
}
```

Validação, HTTP 400:

```json
{
  "ok": false,
  "message": "Confira os campos informados."
}
```

Rate limit, HTTP 429:

```json
{
  "ok": false,
  "message": "Muitas tentativas em pouco tempo. Tente novamente mais tarde."
}
```

Lead salvo e notificação não enviada, HTTP 500:

```json
{
  "ok": false,
  "leadId": 123,
  "message": "A mensagem foi registrada, mas a notificação por e-mail não foi enviada."
}
```

## O que o mu-plugin faz

- Registra o CPT privado `noir_contact`, exibido no painel como **Contatos do site**.
- Salva o lead com `post_status=private` antes de chamar `wp_mail`.
- Sanitiza campos de texto, mensagem, e-mail, telefone, URL e User-Agent no servidor.
- Normaliza telefones brasileiros sem código de país para o formato `+55…`.
- Salva somente um hash HMAC SHA-256 do identificador de rede; o IP bruto não é persistido.
- Aplica honeypot e limite padrão de 5 tentativas por 15 minutos.
- Adiciona destinatários configurados aos destinatários padrão, elimina duplicados e ignora e-mails inválidos.
- Usa `Reply-To` com o nome e o e-mail do visitante e `From` pertencente ao domínio da NOIR.
- Registra status, destinatários, horário da tentativa e erro seguro de `wp_mail` nos metadados do lead.
- Expõe os dados em uma meta box escapada; nenhum HTML enviado pelo visitante é renderizado.
- Permite CORS somente para as origens conhecidas e configuradas. Requisições sem `Origin`, como chamadas same-origin, continuam permitidas.

## Configuração no `wp-config.php`

O mu-plugin já contém os valores não secretos usados pela NOIR:

- destinatário: `contato@noirdigital.com.br`;
- remetente: `NOIR Digital <contato@noirdigital.com.br>`;
- servidor: `smtp.hostinger.com`;
- usuário SMTP: `contato@noirdigital.com.br`;
- porta: `587`;
- segurança: `tls`.

Por isso, a única configuração obrigatória no servidor é a senha atual da caixa de e-mail. Adicione esta constante acima da linha `/* That's all, stop editing! */` do WordPress, substituindo o marcador pela senha real diretamente no servidor:

```php
define('NOIR_SMTP_PASSWORD', 'COLOQUE_A_SENHA_SOMENTE_NO_SERVIDOR');
```

`COLOQUE_A_SENHA_SOMENTE_NO_SERVIDOR` é apenas um marcador da documentação e não funciona como senha.

Se algum valor precisar mudar no futuro, estas constantes opcionais sobrescrevem os padrões do mu-plugin:

```php
define('NOIR_CONTACT_RECIPIENTS', 'contato@noirdigital.com.br');
define('NOIR_MAIL_FROM_EMAIL', 'contato@noirdigital.com.br');
define('NOIR_MAIL_FROM_NAME', 'NOIR Digital');
define('NOIR_SMTP_HOST', 'smtp.hostinger.com');
define('NOIR_SMTP_USERNAME', 'contato@noirdigital.com.br');
define('NOIR_SMTP_PORT', 587);
define('NOIR_SMTP_SECURE', 'tls');
define(
    'NOIR_ALLOWED_ORIGINS',
    'https://noirdigital.com.br,https://www.noirdigital.com.br'
);
```

O host `smtp.hostinger.com` com TLS/STARTTLS na porta 587 é o padrão versionado para esta caixa Hostinger Email. Consulte **hPanel → E-mails → Gerenciar → Conectar apps e dispositivos** e a [documentação oficial de configuração de e-mail da Hostinger](https://support.hostinger.com/en/articles/1575756-how-to-get-email-account-configuration-details-for-hostinger-email) antes de criar qualquer sobrescrita.

### Regra de segurança do SMTP

O modo SMTP só é ativado quando `NOIR_SMTP_PASSWORD` existe e não está vazio. Sem a senha, o WordPress continua inicializando e o plugin usa o comportamento normal de `wp_mail`.

> **Nunca versione a senha SMTP, tokens, credenciais do painel ou o conteúdo do `wp-config.php`.**

## Instalação e atualização

### Manual

1. Garanta que a pasta `public_html/wp-content/mu-plugins` exista.
2. Envie somente `noir-contact-endpoint.php` para essa pasta.
3. Compare o SHA-256 do arquivo local e da cópia baixada do servidor.
4. Abra o painel do WordPress e confirme o menu **Contatos do site**.
5. Faça um `POST` inválido antes de qualquer teste válido.

### GitHub Actions

O workflow:

1. Executa os testes TypeScript e PHP.
2. Gera o export estático.
3. Exclui explicitamente `wp-admin`, `wp-content`, `wp-includes`, `wp-config.php`, `wp-*.php`, `xmlrpc.php` e `index.php` do mirror estático.
4. Faz backup do mu-plugin remoto.
5. Envia o mu-plugin separadamente.
6. Baixa o arquivo publicado e compara os hashes SHA-256.
7. Verifica CORS e faz apenas um `POST` inválido, que não salva lead nem envia e-mail.

Um push ou build bem-sucedido não comprova sozinho que o plugin está ativo. A rota publicada precisa responder aos testes do job de produção.

## Testes locais

Frontend e configuração do deploy:

```bash
npm test
npm run check
npm run typecheck
npm run build
```

Mu-plugin, com PHP 8.3+ disponível no PATH:

```bash
npm run test:wordpress
```

O harness prova registro da rota/CPT, validação, sanitização, honeypot, rate limit, telefone, post privado, metadados, destinatários, `wp_mail`, `Reply-To`, falha de e-mail sem perda do lead e CORS.

## Testes HTTP seguros

### Payload inválido — não salva nem envia

```bash
curl -i https://noirdigital.com.br/wp-json/noir/v1/contact \
  -H 'Origin: https://noirdigital.com.br' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"firstName":"","email":"invalido","service":"","message":"","website":""}'
```

Resultado esperado: HTTP 400 e `Confira os campos informados.`

### Honeypot — sucesso neutro, sem salvar nem enviar

```bash
curl -i https://noirdigital.com.br/wp-json/noir/v1/contact \
  -H 'Origin: https://noirdigital.com.br' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"website":"robô.example"}'
```

Resultado esperado: HTTP 200, sem `leadId` e sem novo item no painel.

### Origem bloqueada

```bash
curl -i https://noirdigital.com.br/wp-json/noir/v1/contact \
  -H 'Origin: https://origem-nao-autorizada.example' \
  -H 'Content-Type: application/json' \
  --data '{"website":""}'
```

Resultado esperado: HTTP 403.

### Payload válido

Execute somente com um endereço de teste autorizado e após configurar SMTP. Depois confirme:

1. O lead privado em **Contatos do site**.
2. `Status do e-mail` como `sent` ou `failed`.
3. Os destinatários usados.
4. A data da tentativa.
5. O `Reply-To` apontando para o visitante no e-mail recebido.

## Diagnóstico de falhas

1. Confirme se o arquivo está em `wp-content/mu-plugins`, não dentro de uma subpasta adicional.
2. Abra `/wp-json/noir/v1/contact` com `OPTIONS` ou faça o `POST` inválido acima.
3. Verifique se o WordPress consegue executar a REST API e se o `.htaccess` encaminha `/wp-json` para `index.php`.
4. No lead salvo, confira `Status do e-mail`, `Erro de e-mail`, destinatários e horário da tentativa.
5. Confira a senha no `wp-config.php`; se houver sobrescritas `NOIR_*`, confira também usuário, host, porta, segurança e endereço `From`.
6. Confirme SPF/DKIM/MX no provedor de e-mail e verifique a pasta de spam.
7. Se `wp_mail` falhar, o lead continua salvo; não apague o registro durante o diagnóstico.

## Limites da validação desta implementação

- Os testes unitários e de integração local não acessam o banco de dados de produção.
- Nenhuma senha foi configurada ou testada no servidor por este código.
- Nenhum e-mail real deve ser enviado sem autorização explícita.
- O painel administrativo, o status real de `wp_mail`, a caixa de destino e o CORS publicado só podem ser confirmados após instalação autorizada do mu-plugin e configuração do `wp-config.php`.
