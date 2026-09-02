# NOIR WordPress SMTP Configuration Design

**Date:** 2026-09-02  
**Status:** Approved direction; pending execution plan and production access  
**Scope:** Restore contact notification e-mails without changing the contact page, its payload, or the lead persistence flow.

## Context and evidence

The contact page already posts JSON to `https://noirdigital.com.br/wp-json/noir/v1/contact`. The WordPress mu-plugin persists each valid submission as a private `noir_contact` post before calling `wp_mail`.

The reported response — `A mensagem foi registrada, mas a notificação por e-mail não foi enviada.` — proves that the request reached WordPress and the lead was saved, but `wp_mail` returned a failure. A safe invalid production request also returned the expected HTTP 400 JSON contract, so the REST route itself is active. Public MX records for `noirdigital.com.br` currently point to Hostinger (`mx1.hostinger.com` and `mx2.hostinger.com`).

The existing mu-plugin enables authenticated SMTP only when `NOIR_SMTP_PASSWORD` is defined and non-empty. It also requires a valid `NOIR_SMTP_HOST` and `NOIR_SMTP_USERNAME`. Missing or incomplete constants leave WordPress on its default mail transport, which matches the observed failure mode.

## Decision

Configure authenticated Hostinger SMTP directly in the production WordPress `wp-config.php`, following the same operational pattern used by the TOGETHER site.

This approach is preferred because it:

- uses the integration already implemented and deployed;
- keeps the frontend, REST contract, antispam, CORS, persistence, and admin UI unchanged;
- avoids adding a second SMTP plugin and another update surface;
- keeps the mailbox password outside Git, the static build, browser code, and logs;
- preserves the authenticated sender domain for SPF/DKIM alignment.

## Production configuration

The following constants belong in the production `wp-config.php`, before the WordPress stop-editing marker. The real password must be entered only in the protected server file and must never be copied into this repository, a build variable prefixed with `NEXT_PUBLIC_`, a task message, screenshot, or command output.

```php
define('NOIR_CONTACT_RECIPIENTS', 'contato@noirdigital.com.br');
define('NOIR_MAIL_FROM_EMAIL', 'contato@noirdigital.com.br');
define('NOIR_MAIL_FROM_NAME', 'NOIR Digital');

define('NOIR_SMTP_HOST', 'smtp.hostinger.com');
define('NOIR_SMTP_USERNAME', 'contato@noirdigital.com.br');
define('NOIR_SMTP_PASSWORD', 'SECRET_ENTERED_ONLY_ON_THE_SERVER');
define('NOIR_SMTP_PORT', 587);
define('NOIR_SMTP_SECURE', 'tls');
```

Before editing, the operator must inspect the file for existing `NOIR_*` definitions. Existing definitions should be updated in place rather than duplicated. A recoverable backup of `wp-config.php` must be created through the hosting control panel before the change.

The authenticated username and `From` address remain identical. Visitor addresses are used only in `Reply-To`, avoiding sender spoofing and improving deliverability.

## Runtime flow

1. The browser submits the existing contact payload to the NOIR REST endpoint.
2. WordPress validates CORS, fields, honeypot, and rate limit.
3. WordPress saves the lead as a private `noir_contact` post.
4. `phpmailer_init` applies the Hostinger SMTP constants.
5. `wp_mail` authenticates as `contato@noirdigital.com.br` and sends the notification.
6. The lead receives `mail_status=sent`, or remains stored with `mail_status=failed` and a safe diagnostic message.
7. The frontend shows success only when notification delivery was accepted by `wp_mail`.

## Verification

Verification must be progressive and must not expose credentials:

1. Confirm the endpoint still returns HTTP 400 JSON for an invalid payload; this creates no lead and sends no e-mail.
2. Submit one authorized, clearly labeled valid test through `/contato/`.
3. Confirm the page shows the success response.
4. Confirm the private lead appears in **Contatos do site**.
5. Confirm its e-mail metadata shows `sent`, an empty safe error field, the expected recipient, and the attempt timestamp.
6. Confirm the message arrives at `contato@noirdigital.com.br`, checking spam if necessary.
7. Confirm replying to the notification targets the visitor address from `Reply-To`.

A successful API response alone does not prove inbox delivery. Completion requires both WordPress status evidence and receipt in the destination mailbox.

## Failure handling

If the authorized test still fails, do not submit repeated live leads. Inspect the saved lead's safe mail error first, then verify:

- mailbox password and whether SMTP access is enabled;
- `smtp.hostinger.com`, port `587`, and `tls`;
- that the mailbox exists and can sign in;
- that `NOIR_MAIL_FROM_EMAIL` matches the authenticated account;
- DNS SPF/DKIM status and the spam folder.

Resetting a mailbox password is outside this configuration change and requires separate explicit authorization because it can interrupt other clients using the mailbox.

## Rollback

If WordPress becomes unhealthy after the edit, restore the backed-up `wp-config.php`. This removes the new SMTP transport without deleting saved leads or changing the frontend. The original failure behavior may return, but contact data will continue to be persisted by the mu-plugin.

## Alternatives considered

### WordPress SMTP plugin

This would provide a UI for configuration and test sends, but adds another plugin, update responsibility, and configuration surface. It is unnecessary while the deployed mu-plugin already configures PHPMailer safely.

### External transactional e-mail provider

This could improve observability and future deliverability at scale, but requires a new vendor, DNS changes, credentials, and possibly a different sender. It is disproportionate to the current failure and can be reconsidered if Hostinger SMTP proves unreliable.

## Out of scope

- redesigning the contact page;
- changing form fields or the REST payload;
- changing CORS, rate limits, or honeypot behavior;
- exposing credentials to the frontend or repository;
- resetting the mailbox password without separate approval;
- publishing unrelated local changes or the pending footer/CNPJ branch.
