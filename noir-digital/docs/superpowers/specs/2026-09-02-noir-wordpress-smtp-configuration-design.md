# NOIR WordPress SMTP Defaults Design

**Date:** 2026-09-02  
**Status:** Approved for implementation and production deployment
**Scope:** Make the deployed contact mu-plugin fully configured with non-secret Hostinger defaults so the server owner only needs to add the mailbox password.

## Context and evidence

The contact page already posts to `https://noirdigital.com.br/wp-json/noir/v1/contact`. The WordPress mu-plugin validates the payload, stores each lead as a private `noir_contact` post, then calls `wp_mail`.

The reported message — `A mensagem foi registrada, mas a notificação por e-mail não foi enviada.` — proves the REST request and persistence succeeded while mail delivery failed. The production route also returned its expected HTTP 400 JSON response to a safe invalid request. Public MX records for `noirdigital.com.br` point to Hostinger.

The current plugin enables SMTP only when `NOIR_SMTP_PASSWORD` is non-empty, but it also requires `NOIR_SMTP_HOST` and `NOIR_SMTP_USERNAME` to exist in `wp-config.php`. That creates avoidable server configuration and differs from the TOGETHER pattern, whose mu-plugin contains non-secret transport defaults.

## Decision

Version and deploy the following non-secret defaults inside `noir-contact-endpoint.php`:

```text
Recipients: contato@noirdigital.com.br
From address: contato@noirdigital.com.br
From name: NOIR Digital
SMTP host: smtp.hostinger.com
SMTP username: contato@noirdigital.com.br
SMTP port: 587
SMTP security: tls
```

The plugin will continue to permit `NOIR_*` constants in `wp-config.php` as optional overrides. SMTP will remain disabled until `NOIR_SMTP_PASSWORD` exists and is non-empty. Therefore the only required production secret becomes:

```php
define('NOIR_SMTP_PASSWORD', 'the current mailbox password entered only on the server');
```

The real value must never appear in Git, build variables, screenshots, task messages, browser developer tools, or command output.

## Runtime flow

1. The static contact page sends the existing JSON payload.
2. WordPress applies the existing CORS, validation, honeypot, and rate-limit controls.
3. The lead is saved privately before any e-mail attempt.
4. When `NOIR_SMTP_PASSWORD` is absent, the plugin leaves WordPress's normal mail transport unchanged.
5. When the password is present, `phpmailer_init` applies the versioned Hostinger defaults, with server constants overriding individual values when deliberately configured.
6. The notification authenticates as `contato@noirdigital.com.br`; the visitor remains only in `Reply-To`.
7. The lead records `sent` or `failed` with a safe diagnostic string.

## Code changes

- Add named default constants for host, username, port, and transport security.
- Make `noir_contact_from_email()` use the default SMTP username when no override exists.
- Make `noir_contact_configure_smtp()` fall back to the versioned defaults instead of returning early when host or username constants are absent.
- Preserve the password gate, override support, invalid-security fallback, and sender-domain validation.
- Bump the mu-plugin version to make the deployed revision identifiable.
- Extend the PHP harness to prove SMTP stays disabled without a password and becomes fully configured with only a password.
- Update operations documentation so only the password is required and all other constants are optional overrides.

## Deployment

The existing GitHub Actions workflow will run the frontend and PHP checks, build the static export, upload the mu-plugin separately, download it again, compare SHA-256, and run safe production endpoint checks. Publishing this change must not include the pending footer/CNPJ branch or the dirty primary checkout.

## Verification before the password

Deployment is considered successful when:

- the focused PHP harness passes;
- the repository checks and production workflow pass;
- the workflow proves the remote mu-plugin hash matches the committed file;
- the production route still returns HTTP 400 JSON for an invalid request;
- no valid lead or e-mail is sent during deployment.

## Verification after the password

After the owner adds `NOIR_SMTP_PASSWORD` to the production `wp-config.php`, submit exactly one authorized contact test. Completion of e-mail setup requires:

- a success message on the contact page;
- a private lead in **Contatos do site**;
- `mail_status=sent` with no safe error value;
- one notification received at `contato@noirdigital.com.br`;
- correct `Reply-To` behavior.

If the password is unknown, do not reset it without separate explicit authorization because a reset can disconnect other mail clients.

## Rollback

The remote workflow creates a backup of the prior mu-plugin before replacement. If the plugin or route regresses, restore that backup. If adding the password later causes WordPress health problems, restore the backed-up `wp-config.php`. Neither rollback deletes saved leads.

## Alternatives considered

### Put every constant in `wp-config.php`

This works but duplicates stable non-secret values on the server and increases manual error risk. It no longer matches the requested one-secret setup.

### Install a WordPress SMTP plugin

This adds UI convenience but also another plugin, update responsibility, and configuration surface while the existing mu-plugin already owns PHPMailer configuration.

### Use a transactional e-mail provider

This may be appropriate later for higher volume or richer observability, but it requires a vendor, DNS work, and new credentials. It is unnecessary for the current Hostinger mailbox.

## Out of scope

- changing the contact page, fields, payload, CORS, rate limits, or honeypot;
- storing the mailbox password in the repository;
- resetting the mailbox password;
- publishing unrelated footer/CNPJ work or dirty-checkout changes.
