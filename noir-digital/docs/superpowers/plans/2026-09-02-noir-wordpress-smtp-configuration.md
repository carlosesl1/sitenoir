# NOIR WordPress SMTP Defaults Implementation Plan

> **For agentic workers:** Execute directly by default. Use subagents only for independent bounded lanes that satisfy the global harness policy. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy a contact mu-plugin whose Hostinger SMTP transport is fully configured by versioned non-secret defaults and requires only `NOIR_SMTP_PASSWORD` on the server.

**Architecture:** Keep the static frontend and REST payload unchanged. Extend the existing WordPress mu-plugin with overrideable SMTP defaults, prove the password-only behavior in the PHP harness, update operator documentation, and publish through the existing hash-verified Hostinger workflow.

**Tech Stack:** PHP, WordPress REST API, PHPMailer, Hostinger SMTP, Vitest deployment checks, GitHub Actions.

---

## File map

- Modify: `public/wp-content/mu-plugins/noir-contact-endpoint.php` — default SMTP settings and PHPMailer configuration.
- Modify: `tests/wordpress/noir-contact-endpoint.test.php` — password gate and password-only default configuration coverage.
- Modify: `WORDPRESS_BACKEND.md` — one-secret server instructions and optional overrides.
- Modify: `docs/superpowers/specs/2026-09-02-noir-wordpress-smtp-configuration-design.md` — approved architecture record.
- Modify: `docs/superpowers/plans/2026-09-02-noir-wordpress-smtp-configuration.md` — executable plan.
- Verify only: `.github/workflows/deploy-hostinger.yml` and `tests/deploy-hostinger.test.ts` — existing remote upload, hash comparison, and safe endpoint checks.

### Task 1: Prove the password-only SMTP contract

**Files:**
- Modify: `tests/wordpress/noir-contact-endpoint.test.php`
- Test: `tests/wordpress/noir-contact-endpoint.test.php`

- [ ] **Step 1: Expand `TestMailer` with the PHPMailer surface used by the plugin**

Add public properties for `Host`, `SMTPAuth`, `Username`, `Password`, `Port`, `SMTPSecure`, and `CharSet`, plus captured `fromEmail` and `fromName` fields. Add `setFrom(string $email, string $name, bool $auto): void` to capture the sender.

- [ ] **Step 2: Add assertions for password-only setup**

Keep the existing no-password assertion. Then define a test-only `NOIR_SMTP_PASSWORD`, configure a fresh `TestMailer`, and require these exact values:

```text
smtpEnabled=true
Host=smtp.hostinger.com
SMTPAuth=true
Username=contato@noirdigital.com.br
Password=test-only-password
Port=587
SMTPSecure=tls
CharSet=UTF-8
fromEmail=contato@noirdigital.com.br
fromName=NOIR Digital
```

Also define an invalid cross-domain `NOIR_MAIL_FROM_EMAIL` and keep the assertion that the authenticated NOIR sender wins.

- [ ] **Step 3: Run the focused test and confirm it fails before implementation**

Run: `npm run test:wordpress`

Expected before implementation: failure because the plugin does not configure a host or username when only the password exists.

### Task 2: Implement versioned SMTP defaults

**Files:**
- Modify: `public/wp-content/mu-plugins/noir-contact-endpoint.php`
- Test: `tests/wordpress/noir-contact-endpoint.test.php`

- [ ] **Step 1: Add the named defaults and bump the plugin version**

Add exact constants:

```php
const NOIR_CONTACT_DEFAULT_SMTP_HOST = 'smtp.hostinger.com';
const NOIR_CONTACT_DEFAULT_SMTP_USERNAME = 'contato@noirdigital.com.br';
const NOIR_CONTACT_DEFAULT_SMTP_PORT = 587;
const NOIR_CONTACT_DEFAULT_SMTP_SECURE = 'tls';
```

Change the plugin header version from `1.0.0` to `1.1.0`.

- [ ] **Step 2: Use the default username for sender-domain validation**

In `noir_contact_from_email()`, use `NOIR_CONTACT_DEFAULT_SMTP_USERNAME` when `NOIR_SMTP_USERNAME` is absent. Preserve sanitization and the same-domain check.

- [ ] **Step 3: Apply defaults in `noir_contact_configure_smtp()`**

Keep the non-empty password gate. Resolve host, username, port, and security from matching `NOIR_*` overrides when defined, otherwise from the new constants. Preserve the validation guard and use the default constants as fallbacks for invalid port or security values.

- [ ] **Step 4: Run the focused PHP harness**

Run: `npm run test:wordpress`

Expected: all WordPress contact assertions pass, including the new password-only SMTP checks.

### Task 3: Document the one-secret server setup

**Files:**
- Modify: `WORDPRESS_BACKEND.md`

- [ ] **Step 1: Replace the required configuration block**

Document that the plugin already contains recipient, sender, Hostinger host, username, port, and TLS defaults. Make `NOIR_SMTP_PASSWORD` the only required production definition. State explicitly that documentation uses a marker instead of a real password and that it must never be copied as the value.

- [ ] **Step 2: Document optional overrides**

List `NOIR_CONTACT_RECIPIENTS`, `NOIR_MAIL_FROM_EMAIL`, `NOIR_MAIL_FROM_NAME`, `NOIR_SMTP_HOST`, `NOIR_SMTP_USERNAME`, `NOIR_SMTP_PORT`, `NOIR_SMTP_SECURE`, and `NOIR_ALLOWED_ORIGINS` as optional server overrides. Keep the password security warning and update diagnosis to distinguish defaults from overrides.

### Task 4: Verify the coherent change

**Files:**
- Verify: all modified files
- Verify: `.github/workflows/deploy-hostinger.yml`
- Verify: `tests/deploy-hostinger.test.ts`

- [ ] **Step 1: Run focused checks**

Run:

```powershell
npm run test:wordpress
npx vitest run tests/deploy-hostinger.test.ts
```

Expected: both commands pass.

- [ ] **Step 2: Run the project verification gates**

Run:

```powershell
npm run check
npm run typecheck
npm run build
```

Expected: no new errors and a successful static export.

- [ ] **Step 3: Inspect the final diff and secret scan**

Run:

```powershell
git diff --check
rg -n "NOIR_SMTP_PASSWORD" . --glob '!node_modules/**' --glob '!out/**'
git status --short
```

Expected: only the test-only password and documentation markers appear; no real credential is present. Only the five scoped files are modified.

- [ ] **Step 4: Commit the implementation**

Stage only the scoped paths and commit with `fix(contact): add Hostinger SMTP defaults`.

### Task 5: Publish and verify production deployment

**Files:**
- Publish: committed branch to `origin/main`
- Deploy: `public/wp-content/mu-plugins/noir-contact-endpoint.php`

- [ ] **Step 1: Refresh the remote and confirm a fast-forward base**

Run `git fetch origin main` and verify `origin/main` remains an ancestor of `HEAD`. Stop if remote changes require integration.

- [ ] **Step 2: Push the reviewed commit range to `origin/main`**

Run `git push origin HEAD:main`.

Expected: GitHub accepts a fast-forward update and starts `.github/workflows/deploy-hostinger.yml`.

- [ ] **Step 3: Wait for the exact deployment run**

Identify the Actions run by the pushed HEAD SHA and wait for terminal `success`. Do not treat push acceptance as deployment proof.

- [ ] **Step 4: Reuse workflow proof and run one safe production check**

The workflow must report successful remote mu-plugin SHA-256 comparison and safe REST checks. Then send the documented invalid payload once.

Expected: HTTP `400`, JSON content type, and `{"ok":false,"message":"Confira os campos informados."}`. No lead or e-mail is created.

- [ ] **Step 5: Hand off the password-only server action**

Tell the owner to add only this constant before the WordPress stop-editing marker:

```php
define('NOIR_SMTP_PASSWORD', 'the current password entered directly in hPanel');
```

Do not ask the owner to paste the value into the task. A valid end-to-end send remains pending until this server-only action is complete.
