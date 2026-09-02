# NOIR WordPress SMTP Configuration Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore notification e-mails for valid NOIR contact submissions while preserving the existing WordPress lead record and frontend behavior.

**Architecture:** Keep the static frontend and deployed `noir/v1/contact` mu-plugin unchanged. Configure PHPMailer through protected `NOIR_*` constants in the production WordPress `wp-config.php`, then prove the full path with one authorized contact submission and inbox verification.

**Tech Stack:** Next.js static export, WordPress REST API, WordPress `wp_mail`, PHPMailer, Hostinger SMTP, Hostinger hPanel.

---

## File map

- Production-only modify: `public_html/wp-config.php` — protected WordPress configuration that supplies the SMTP password and non-secret transport settings to the existing mu-plugin.
- Reference only: `public/wp-content/mu-plugins/noir-contact-endpoint.php` — already deployed integration that reads `NOIR_*` constants, persists the lead, configures PHPMailer, and records mail status.
- Reference only: `features/contact/submit-contact.ts` — existing browser client and response contract; no change is expected.
- Reference only: `components/contact/ContactPage.tsx` — existing contact form; no change is expected.
- Design record: `docs/superpowers/specs/2026-09-02-noir-wordpress-smtp-configuration-design.md`.

No application source or deployment artifact should change unless preflight contradicts the approved design.

### Task 1: Production preflight and recoverable backup

**Files:**
- Inspect: `public_html/wp-config.php`
- Reference: `public/wp-content/mu-plugins/noir-contact-endpoint.php:549`

- [ ] **Step 1: Confirm safe endpoint behavior before configuration**

Send the documented invalid payload to production with the NOIR origin. It must not create a lead or send an e-mail.

```powershell
$headers = @{ Origin = 'https://noirdigital.com.br'; Accept = 'application/json' }
$body = '{"firstName":"","email":"invalido","service":"","message":"","website":""}'
Invoke-WebRequest -UseBasicParsing `
  -Uri 'https://noirdigital.com.br/wp-json/noir/v1/contact' `
  -Method Post `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body $body `
  -SkipHttpErrorCheck
```

Expected: HTTP `400`, JSON content type, and `{"ok":false,"message":"Confira os campos informados."}`.

- [ ] **Step 2: Open the production `wp-config.php` through authenticated Hostinger access**

Use hPanel's file manager for the NOIR WordPress installation. If authentication is required, pause for the account owner to sign in. Do not collect credentials through task messages or command output.

- [ ] **Step 3: Inspect for existing definitions**

Search the file for each exact name below:

```text
NOIR_CONTACT_RECIPIENTS
NOIR_MAIL_FROM_EMAIL
NOIR_MAIL_FROM_NAME
NOIR_SMTP_HOST
NOIR_SMTP_USERNAME
NOIR_SMTP_PASSWORD
NOIR_SMTP_PORT
NOIR_SMTP_SECURE
```

Expected: record whether each definition is absent or present. Never reveal the value of `NOIR_SMTP_PASSWORD`. Existing definitions must be edited in place rather than duplicated.

- [ ] **Step 4: Create a recoverable backup**

Use the hosting file manager's copy or download operation to preserve the current `wp-config.php` before editing. Keep the backup outside the public web path when the control panel permits it. Do not add the backup to Git.

Expected: the original configuration can be restored without reconstructing secrets.

### Task 2: Configure authenticated Hostinger SMTP

**Files:**
- Modify: `public_html/wp-config.php`

- [ ] **Step 1: Add or update the non-secret constants**

Place these definitions before `/* That's all, stop editing! Happy publishing. */`. If the installation uses the Portuguese equivalent marker, place them immediately before that marker.

```php
define('NOIR_CONTACT_RECIPIENTS', 'contato@noirdigital.com.br');
define('NOIR_MAIL_FROM_EMAIL', 'contato@noirdigital.com.br');
define('NOIR_MAIL_FROM_NAME', 'NOIR Digital');

define('NOIR_SMTP_HOST', 'smtp.hostinger.com');
define('NOIR_SMTP_USERNAME', 'contato@noirdigital.com.br');
define('NOIR_SMTP_PORT', 587);
define('NOIR_SMTP_SECURE', 'tls');
```

Expected: every name is defined exactly once and the authenticated username matches the `From` address.

- [ ] **Step 2: Add or update the password through the protected editor**

Define `NOIR_SMTP_PASSWORD` with the current password of the Hostinger mailbox `contato@noirdigital.com.br`. Enter the actual secret only in the authenticated `wp-config.php` editor. Do not copy it into this plan, Git, browser developer tools, screenshots, shell history, or task messages.

If the password is unknown, stop. Do not reset it without separate explicit authorization because a reset can disconnect existing mail clients.

Expected: `NOIR_SMTP_PASSWORD` is defined exactly once with a non-empty server-only value.

- [ ] **Step 3: Save and verify WordPress health**

Save the file, reload `https://noirdigital.com.br/wp-json/noir/v1/contact` with the invalid request from Task 1, and compare the response.

Expected: the endpoint still returns the same HTTP `400` JSON response. A PHP syntax error, HTTP 500, HTML body, or unavailable site triggers immediate rollback from the backup.

### Task 3: One authorized end-to-end submission

**Files:**
- Exercise only: `components/contact/ContactPage.tsx`
- Exercise only: production WordPress `noir_contact` data

- [ ] **Step 1: Submit one clearly labeled test through the page**

Open `https://noirdigital.com.br/contato/` and submit exactly one test with:

```text
Nome: Teste
Sobrenome: SMTP NOIR
E-mail: contato@noirdigital.com.br
Empresa: NOIR Digital
Serviço de interesse: Outro
Mensagem: Teste autorizado de configuração SMTP em 02/09/2026. Pode ser desconsiderado.
Website honeypot: empty
```

Expected: the button enters its pending state once and the page reports `Mensagem recebida com sucesso.`. Do not retry automatically if the result is ambiguous.

- [ ] **Step 2: Verify the saved lead in WordPress**

Open **Contatos do site**, locate the unique `Teste SMTP NOIR` lead, and inspect its metadata.

Expected:

```text
Status do e-mail: sent
Erro de e-mail: empty
Destinatários: contato@noirdigital.com.br
Tentativa de e-mail: populated
```

If the status is `failed`, record only the safe error text, stop further sends, and diagnose that evidence before changing any settings.

- [ ] **Step 3: Verify actual mailbox receipt**

Open the mailbox for `contato@noirdigital.com.br`, search for the subject beginning with `[NOIR Digital] Novo contato do site`, and check spam if it is not in the inbox.

Expected: one notification arrives, its body contains the test values, and `Reply-To` resolves to `contato@noirdigital.com.br` for this controlled test.

### Task 4: Final evidence and rollback decision

**Files:**
- Inspect: production `public_html/wp-config.php`
- Inspect: production WordPress contact entry and mailbox

- [ ] **Step 1: Confirm the final evidence set**

Completion requires all of the following:

```text
Invalid endpoint request: HTTP 400 JSON
Valid page submission: success message
WordPress lead: saved privately
WordPress mail status: sent
Destination mailbox: notification received
Credential exposure: none
```

- [ ] **Step 2: Roll back if site health regressed**

If saving `wp-config.php` caused a PHP error or made WordPress unavailable, restore the pre-change backup immediately and repeat only the invalid endpoint health check.

Expected after rollback: WordPress and the REST validation route are healthy again. Do not claim the SMTP issue resolved.

- [ ] **Step 3: Preserve scope**

Do not deploy frontend files, publish the documentation branch, modify the mu-plugin, reset the mailbox password, or publish unrelated footer/CNPJ work as part of this production configuration.

Expected: the only production mutation is the approved `wp-config.php` SMTP configuration plus one explicitly labeled test lead/e-mail.
