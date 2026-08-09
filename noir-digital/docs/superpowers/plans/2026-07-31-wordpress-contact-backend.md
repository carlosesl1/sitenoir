# WordPress Contact Backend Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar a nova página de contato estática da NOIR Digital a um endpoint seguro do WordPress que persiste cada lead antes de tentar a notificação por e-mail.

**Architecture:** O Next.js continua sendo exportado como site estático e envia JSON por uma função cliente isolada para `https://noirdigital.com.br/wp-json/noir/v1/contact`. Um mu-plugin versionado registra o CPT privado, a rota REST, validação, CORS, antispam, persistência e envio via `wp_mail`; o workflow publica esse plugin separadamente porque a árvore estática não pode espelhar `wp-content` nem arquivos centrais do WordPress.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, Vitest/Testing Library, WordPress REST API/PHP, GitHub Actions, lftp/FTPS.

---

## File map

- `features/contact/submit-contact.ts`: contrato tipado, endpoint público configurável e tradução segura das respostas HTTP/JSON.
- `features/contact/submit-contact.test.ts`: contrato da integração cliente, incluindo respostas não JSON e códigos 400/429/500.
- `components/contact/ContactPage.tsx`: superfície cliente, estado do formulário, honeypot e feedback acessível.
- `components/contact/ContactPage.module.css`: composição responsiva baseada na malha, tipografia e tokens já existentes.
- `components/contact/ContactPage.test.tsx`: submissão, bloqueio de duplicidade, sucesso e preservação dos dados em erro.
- `app/contato/page.tsx`: rota estática, metadata e providers existentes.
- `public/wp-content/mu-plugins/noir-contact-endpoint.php`: CPT privado, rota REST, segurança, persistência, e-mail, SMTP e metabox.
- `tests/wordpress/noir-contact-endpoint.test.php`: harness PHP com doubles somente nas bordas do WordPress para exercitar o comportamento real do plugin.
- `.github/workflows/deploy-hostinger.yml`: exclusões explícitas do WordPress e upload/verificação byte a byte do mu-plugin.
- `WORDPRESS_BACKEND.md`: operação, constantes, payload, instalação, testes e limites de validação.

### Task 1: Contrato cliente e estados do formulário

- [ ] Criar testes que exijam `POST`, `Accept: application/json`, `Content-Type: application/json`, `pageUrl`, `source`, endpoint via `NEXT_PUBLIC_CONTACT_ENDPOINT`, mensagens seguras e detecção de corpo não JSON.
- [ ] Executar `npm test -- features/contact/submit-contact.test.ts` e confirmar falha por módulo ausente.
- [ ] Implementar `submitContact(payload, options?)` retornando `{ ok, leadId?, message }` e lançar `ContactSubmissionError` com apenas `status`, `leadId` e mensagem amigável.
- [ ] Executar novamente o teste focado e confirmar passagem.
- [ ] Criar testes de `ContactPage` para campos reais, honeypot, submissão única durante loading, limpeza apenas em HTTP 200 com `ok: true` e manutenção dos dados em 400/429/500.
- [ ] Implementar o formulário como cliente sem alterar os tokens globais, usando `aria-live`, `aria-invalid`, foco visível e o painel de WhatsApp como canal alternativo.

### Task 2: Mu-plugin WordPress

- [ ] Criar primeiro o harness PHP que exige registro de `noir_contact`, rota `noir/v1/contact`, obrigatórios, e-mail, sanitização, honeypot, rate limit, telefone, destinatários e falha de `wp_mail` sem perda do post.
- [ ] Executar `php tests/wordpress/noir-contact-endpoint.test.php` e confirmar falha por plugin ausente.
- [ ] Implementar funções prefixadas `noir_contact_*` e registrar hooks sem depender de senha SMTP na inicialização.
- [ ] Salvar `post_status=private` antes de `wp_mail`, gravar metadados técnicos sem IP bruto e retornar os quatro contratos JSON especificados.
- [ ] Adicionar metabox somente leitura com `esc_html`, destinatários padrão mais constantes configuradas, captura temporária de `wp_mail_failed` e SMTP condicional a `NOIR_SMTP_PASSWORD` não vazia.
- [ ] Executar o harness novamente e confirmar todos os casos.

### Task 3: Rota, navegação e dados de contato

- [ ] Criar `/contato` com metadata/canonical e providers do projeto.
- [ ] Alterar o CTA compartilhado, o menu e os links de rodapé para `/contato`, mantendo Serviços em `/#selected-work`.
- [ ] Adicionar `+55 77 99845-3006` ao conteúdo central e ao rodapé, com `tel:+5577998453006` e WhatsApp `https://wa.me/5577998453006`.
- [ ] Atualizar sitemap e testes de conteúdo/navegação/metadata.

### Task 4: Deploy seguro

- [ ] Fazer o mirror estático excluir `wp-admin`, `wp-content`, `wp-includes`, `wp-config.php`, `wp-*.php`, `xmlrpc.php` e `index.php`.
- [ ] Validar no job de build que o mu-plugin existe dentro do artefato exportado.
- [ ] Criar `wp-content/mu-plugins` remotamente, enviar apenas `noir-contact-endpoint.php`, baixar uma cópia e comparar SHA-256 local/remoto.
- [ ] Verificar a rota publicada com `OPTIONS` e um `POST` inválido; nunca enviar um lead válido ou e-mail real no workflow.

### Task 5: Documentação e prova integrada

- [ ] Documentar constantes `NOIR_*`, instalação, atualização, SMTP, contrato, diagnóstico e a proibição de versionar senha.
- [ ] Executar `npm test`, `npm run check`, `npm run typecheck`, `npm run build` e o harness PHP.
- [ ] Servir `out/` e inspecionar `/contato/` em desktop e mobile, incluindo loading, validação, foco, texto contido e ausência de alterações visuais na home.
- [ ] Registrar separadamente o que foi validado localmente e o que não foi confirmado em produção; não publicar neste trabalho.
