<?php

declare(strict_types=1);

define('ABSPATH', __DIR__ . '/wordpress/');
define('NOIR_CONTACT_RECIPIENTS', 'financeiro@noirdigital.com.br,CONTATO@noirdigital.com.br,invalido');

$GLOBALS['wp_hooks'] = array();
$GLOBALS['wp_filters'] = array();
$GLOBALS['wp_post_types'] = array();
$GLOBALS['wp_routes'] = array();
$GLOBALS['wp_meta_boxes'] = array();
$GLOBALS['wp_posts'] = array();
$GLOBALS['wp_post_meta'] = array();
$GLOBALS['wp_transients'] = array();
$GLOBALS['wp_mail_calls'] = array();
$GLOBALS['wp_mail_should_fail'] = false;
$GLOBALS['wp_filter_overrides'] = array();
$GLOBALS['test_count'] = 0;
$GLOBALS['test_failures'] = array();

final class WP_Error
{
    private string $code;
    private string $message;
    private mixed $data;

    public function __construct(string $code = '', string $message = '', mixed $data = null)
    {
        $this->code = $code;
        $this->message = $message;
        $this->data = $data;
    }

    public function get_error_code(): string
    {
        return $this->code;
    }

    public function get_error_message(): string
    {
        return $this->message;
    }

    public function get_error_data(): mixed
    {
        return $this->data;
    }
}

final class WP_REST_Request
{
    public function __construct(
        private array $params = array(),
        private string $route = '/noir/v1/contact',
        private string $method = 'POST'
    ) {
    }

    public function get_json_params(): array
    {
        return $this->params;
    }

    public function get_route(): string
    {
        return $this->route;
    }

    public function get_method(): string
    {
        return $this->method;
    }
}

final class WP_REST_Response
{
    public function __construct(private mixed $data, private int $status = 200)
    {
    }

    public function get_data(): mixed
    {
        return $this->data;
    }

    public function get_status(): int
    {
        return $this->status;
    }
}

final class TestMailer
{
    public bool $smtpEnabled = false;
    public string $Host = '';
    public bool $SMTPAuth = false;
    public string $Username = '';
    public string $Password = '';
    public int $Port = 0;
    public string $SMTPSecure = '';
    public string $CharSet = '';
    public string $fromEmail = '';
    public string $fromName = '';

    public function isSMTP(): void
    {
        $this->smtpEnabled = true;
    }

    public function setFrom(string $email, string $name, bool $auto): void
    {
        $this->fromEmail = $email;
        $this->fromName = $name;
    }
}

function add_action(string $hook, callable|string $callback, int $priority = 10, int $accepted_args = 1): void
{
    $GLOBALS['wp_hooks'][$hook][] = array($callback, $priority, $accepted_args);
}

function remove_action(string $hook, callable|string $callback, int $priority = 10): void
{
    if (!isset($GLOBALS['wp_hooks'][$hook])) {
        return;
    }

    $GLOBALS['wp_hooks'][$hook] = array_values(array_filter(
        $GLOBALS['wp_hooks'][$hook],
        static fn(array $entry): bool => !($entry[0] === $callback && $entry[1] === $priority)
    ));
}

function do_action(string $hook, mixed ...$args): void
{
    foreach ($GLOBALS['wp_hooks'][$hook] ?? array() as $entry) {
        $accepted = array_slice($args, 0, $entry[2]);
        call_user_func_array($entry[0], $accepted);
    }
}

function add_filter(string $hook, callable|string $callback, int $priority = 10, int $accepted_args = 1): void
{
    $GLOBALS['wp_filters'][$hook][] = array($callback, $priority, $accepted_args);
}

function apply_filters(string $hook, mixed $value, mixed ...$args): mixed
{
    if (array_key_exists($hook, $GLOBALS['wp_filter_overrides'])) {
        $value = $GLOBALS['wp_filter_overrides'][$hook];
    }

    foreach ($GLOBALS['wp_filters'][$hook] ?? array() as $entry) {
        $accepted = array_slice(array_merge(array($value), $args), 0, $entry[2]);
        $value = call_user_func_array($entry[0], $accepted);
    }

    return $value;
}

function register_post_type(string $post_type, array $args): void
{
    $GLOBALS['wp_post_types'][$post_type] = $args;
}

function register_rest_route(string $namespace, string $route, array $args): void
{
    $GLOBALS['wp_routes'][$namespace . $route] = $args;
}

function add_meta_box(string $id, string $title, callable|string $callback, string $screen): void
{
    $GLOBALS['wp_meta_boxes'][$id] = compact('title', 'callback', 'screen');
}

function sanitize_text_field(mixed $value): string
{
    if (!is_scalar($value)) {
        return '';
    }

    $text = strip_tags((string) $value);
    $text = preg_replace('/[\r\n\t]+/', ' ', $text) ?? '';
    return trim(preg_replace('/\s+/', ' ', $text) ?? '');
}

function sanitize_textarea_field(mixed $value): string
{
    if (!is_scalar($value)) {
        return '';
    }

    $text = strip_tags((string) $value);
    $text = str_replace(array("\r\n", "\r"), "\n", $text);
    return trim($text);
}

function sanitize_email(mixed $value): string
{
    if (!is_scalar($value)) {
        return '';
    }

    return strtolower((string) filter_var(trim((string) $value), FILTER_SANITIZE_EMAIL));
}

function is_email(mixed $value): string|false
{
    return filter_var((string) $value, FILTER_VALIDATE_EMAIL) ? (string) $value : false;
}

function esc_url_raw(mixed $value): string
{
    if (!is_scalar($value)) {
        return '';
    }

    $url = filter_var(trim((string) $value), FILTER_VALIDATE_URL);
    return is_string($url) ? $url : '';
}

function wp_unslash(mixed $value): mixed
{
    return $value;
}

function wp_salt(string $scheme = 'auth'): string
{
    return 'test-salt-' . $scheme;
}

function wp_json_encode(mixed $value, int $flags = 0, int $depth = 512): string|false
{
    return json_encode($value, $flags, $depth);
}

function wp_insert_post(array $postarr, bool $wp_error = false): int|WP_Error
{
    $id = count($GLOBALS['wp_posts']) + 100;
    $postarr['ID'] = $id;
    $GLOBALS['wp_posts'][$id] = $postarr;
    return $id;
}

function update_post_meta(int $post_id, string $key, mixed $value): void
{
    $GLOBALS['wp_post_meta'][$post_id][$key] = $value;
}

function get_post_meta(int $post_id, string $key, bool $single = true): mixed
{
    return $GLOBALS['wp_post_meta'][$post_id][$key] ?? '';
}

function get_transient(string $key): mixed
{
    return $GLOBALS['wp_transients'][$key] ?? false;
}

function set_transient(string $key, mixed $value, int $expiration): bool
{
    $GLOBALS['wp_transients'][$key] = $value;
    return true;
}

function wp_mail(array|string $to, string $subject, string $message, array|string $headers = ''): bool
{
    $GLOBALS['wp_mail_calls'][] = compact('to', 'subject', 'message', 'headers');
    if ($GLOBALS['wp_mail_should_fail']) {
        do_action('wp_mail_failed', new WP_Error('wp_mail_failed', 'SMTP authentication failed for test'));
        return false;
    }

    return true;
}

function is_wp_error(mixed $value): bool
{
    return $value instanceof WP_Error;
}

function current_time(string $type, bool $gmt = false): string
{
    return $gmt ? '2026-07-31 19:00:00' : '2026-07-31 16:00:00';
}

function wp_date(string $format, ?int $timestamp = null): string
{
    return '31/07/2026 16:00';
}

function absint(mixed $value): int
{
    return abs((int) $value);
}

function esc_html(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function esc_attr(mixed $value): string
{
    return esc_html($value);
}

function __($text, $domain = null): string
{
    return (string) $text;
}

function assert_true(bool $condition, string $message): void
{
    $GLOBALS['test_count']++;
    if (!$condition) {
        $GLOBALS['test_failures'][] = $message;
    }
}

function assert_same(mixed $expected, mixed $actual, string $message): void
{
    assert_true($expected === $actual, $message . "\nExpected: " . var_export($expected, true) . "\nActual: " . var_export($actual, true));
}

function reset_request_state(): void
{
    $GLOBALS['wp_posts'] = array();
    $GLOBALS['wp_post_meta'] = array();
    $GLOBALS['wp_transients'] = array();
    $GLOBALS['wp_mail_calls'] = array();
    $GLOBALS['wp_mail_should_fail'] = false;
    $GLOBALS['wp_filter_overrides'] = array();
    $_SERVER = array(
        'REMOTE_ADDR' => '203.0.113.42',
        'HTTP_USER_AGENT' => 'Test Browser <script>alert(1)</script>',
        'HTTP_ORIGIN' => 'https://noirdigital.com.br',
    );
}

function valid_payload(array $overrides = array()): array
{
    return array_merge(array(
        'firstName' => 'Ana',
        'lastName' => 'Silva',
        'email' => 'ana@empresa.com',
        'company' => 'Empresa',
        'phone' => '(77) 99845-3006',
        'service' => 'Sites e experiências digitais',
        'message' => 'Quero conversar sobre um projeto.',
        'website' => '',
        'pageUrl' => 'https://noirdigital.com.br/contato/',
        'source' => 'Formulário de contato',
    ), $overrides);
}

function response_data(WP_REST_Response $response): array
{
    $data = $response->get_data();
    return is_array($data) ? $data : array();
}

$plugin_path = dirname(__DIR__, 2) . '/public/wp-content/mu-plugins/noir-contact-endpoint.php';
require $plugin_path;

do_action('init');
do_action('rest_api_init');
do_action('add_meta_boxes');

assert_true(isset($GLOBALS['wp_post_types']['noir_contact']), 'Registers the noir_contact post type.');
$post_type = $GLOBALS['wp_post_types']['noir_contact'] ?? array();
assert_same(false, $post_type['public'] ?? null, 'The contacts post type is private.');
assert_same(true, $post_type['show_ui'] ?? null, 'The contacts post type is visible in admin.');
assert_same('Contatos do site', $post_type['labels']['menu_name'] ?? null, 'The admin menu uses the approved label.');
assert_true(isset($GLOBALS['wp_routes']['noir/v1/contact']), 'Registers POST /wp-json/noir/v1/contact.');
$route = $GLOBALS['wp_routes']['noir/v1/contact'] ?? array();
assert_same('POST', $route['methods'] ?? null, 'The contact route only declares POST.');
assert_true(is_callable($route['callback'] ?? null), 'The contact route callback is callable.');
assert_same('__return_true', $route['permission_callback'] ?? null, 'The public route uses an explicit permission callback.');
assert_true(isset($GLOBALS['wp_meta_boxes']['noir_contact_details']), 'Registers the safe lead details meta box.');

$mailer_without_password = new TestMailer();
noir_contact_configure_smtp($mailer_without_password);
assert_same(false, $mailer_without_password->smtpEnabled, 'SMTP stays disabled when no password constant is configured.');
define('NOIR_SMTP_PASSWORD', 'test-only-password');
define('NOIR_MAIL_FROM_EMAIL', 'attacker@example.com');
assert_same('contato@noirdigital.com.br', noir_contact_from_email(), 'Rejects a From address outside the authenticated mail domain.');

$mailer_with_password_only = new TestMailer();
noir_contact_configure_smtp($mailer_with_password_only);
assert_same(true, $mailer_with_password_only->smtpEnabled, 'A password alone enables the versioned Hostinger SMTP defaults.');
assert_same('smtp.hostinger.com', $mailer_with_password_only->Host, 'Uses the default Hostinger SMTP host.');
assert_same(true, $mailer_with_password_only->SMTPAuth, 'Enables SMTP authentication.');
assert_same('contato@noirdigital.com.br', $mailer_with_password_only->Username, 'Uses the NOIR mailbox as the default SMTP username.');
assert_same('test-only-password', $mailer_with_password_only->Password, 'Passes the server-only password to PHPMailer.');
assert_same(587, $mailer_with_password_only->Port, 'Uses the default STARTTLS port.');
assert_same('tls', $mailer_with_password_only->SMTPSecure, 'Uses TLS by default.');
assert_same('UTF-8', $mailer_with_password_only->CharSet, 'Uses UTF-8 for contact notifications.');
assert_same('contato@noirdigital.com.br', $mailer_with_password_only->fromEmail, 'Uses the authenticated NOIR mailbox as From.');
assert_same('NOIR Digital', $mailer_with_password_only->fromName, 'Uses the NOIR brand as the sender name.');

reset_request_state();
$invalid = noir_contact_handle_request(new WP_REST_Request(valid_payload(array('firstName' => '', 'email' => 'not-email'))));
assert_same(400, $invalid->get_status(), 'Missing fields and invalid email return HTTP 400.');
assert_same(array('ok' => false, 'message' => 'Confira os campos informados.'), response_data($invalid), 'Validation response does not leak field internals.');
assert_same(0, count($GLOBALS['wp_posts']), 'Invalid payload is not persisted.');

reset_request_state();
$honeypot = noir_contact_handle_request(new WP_REST_Request(valid_payload(array('website' => 'spam.example'))));
assert_same(200, $honeypot->get_status(), 'Filled honeypot receives a neutral success.');
assert_same(true, response_data($honeypot)['ok'] ?? null, 'Honeypot response looks successful.');
assert_same(0, count($GLOBALS['wp_posts']), 'Honeypot request is not saved.');
assert_same(0, count($GLOBALS['wp_mail_calls']), 'Honeypot request sends no email.');

assert_same('+5577998453006', noir_contact_normalize_phone('(77) 99845-3006'), 'Normalizes Brazilian local mobile numbers.');
assert_same('+5511999999999', noir_contact_normalize_phone('+55 (11) 99999-9999'), 'Normalizes explicit country code.');
assert_true(is_wp_error(noir_contact_normalize_phone('123')), 'Rejects an invalid short phone.');

reset_request_state();
$sanitized = noir_contact_handle_request(new WP_REST_Request(valid_payload(array(
    'firstName' => '<b>Ana</b>',
    'lastName' => " Silva\n",
    'company' => '<img src=x>Empresa',
    'message' => '<script>alert(1)</script>Olá',
    'pageUrl' => 'https://noirdigital.com.br/contato/?utm_source=teste',
))));
assert_same(200, $sanitized->get_status(), 'A valid sanitized lead returns HTTP 200.');
$lead_id = response_data($sanitized)['leadId'] ?? 0;
assert_true(is_int($lead_id) && $lead_id > 0, 'A successful response contains the lead ID.');
assert_same('private', $GLOBALS['wp_posts'][$lead_id]['post_status'] ?? null, 'The lead is saved with private status.');
assert_true(str_contains($GLOBALS['wp_posts'][$lead_id]['post_title'] ?? '', 'Ana Silva — Empresa — 31/07/2026 16:00'), 'The private lead title identifies name, company, and date.');
assert_same('alert(1)Olá', $GLOBALS['wp_posts'][$lead_id]['post_content'] ?? null, 'The message is stored without visitor HTML.');
assert_same('Ana', get_post_meta($lead_id, '_noir_contact_first_name'), 'Sanitizes the first name.');
assert_same('Silva', get_post_meta($lead_id, '_noir_contact_last_name'), 'Sanitizes the last name.');
assert_same('Empresa', get_post_meta($lead_id, '_noir_contact_company'), 'Sanitizes the company.');
assert_same('+5577998453006', get_post_meta($lead_id, '_noir_contact_phone'), 'Stores the normalized phone.');
assert_same('Sites e experiências digitais', get_post_meta($lead_id, '_noir_contact_service'), 'Stores the selected service.');
assert_same('Formulário de contato', get_post_meta($lead_id, '_noir_contact_source'), 'Stores the source.');
assert_same('https://noirdigital.com.br/contato/?utm_source=teste', get_post_meta($lead_id, '_noir_contact_page_url'), 'Stores a sanitized page URL.');
$ip_hash = get_post_meta($lead_id, '_noir_contact_ip_hash');
assert_same(64, strlen((string) $ip_hash), 'Stores a SHA-256 IP hash.');
assert_true($ip_hash !== '203.0.113.42', 'Never stores the raw IP.');
assert_true(!str_contains((string) get_post_meta($lead_id, '_noir_contact_user_agent'), '<script>'), 'Sanitizes the User-Agent.');
assert_same('sent', get_post_meta($lead_id, '_noir_contact_mail_status'), 'Marks successful notification.');
assert_same('2026-07-31 19:00:00', get_post_meta($lead_id, '_noir_contact_received_at'), 'Stores receipt time.');
assert_same('2026-07-31 19:00:00', get_post_meta($lead_id, '_noir_contact_mail_attempted_at'), 'Stores mail attempt time.');

$recipients = get_post_meta($lead_id, '_noir_contact_recipients');
assert_same(array('contato@noirdigital.com.br', 'financeiro@noirdigital.com.br'), $recipients, 'Merges defaults and configured recipients, removing duplicates and invalid values.');
assert_same(1, count($GLOBALS['wp_mail_calls']), 'Calls wp_mail once for a valid lead.');
$mail = $GLOBALS['wp_mail_calls'][0];
assert_same($recipients, $mail['to'], 'Uses all sanitized recipients.');
assert_true(str_contains($mail['subject'], 'Novo contato do site'), 'Mail subject identifies the site lead.');
assert_true(str_contains($mail['message'], 'Ana Silva'), 'Plain-text mail includes the visitor name.');
assert_true(in_array('Reply-To: Ana Silva <ana@empresa.com>', $mail['headers'], true), 'Reply-To points to the visitor.');
assert_true(in_array('From: NOIR Digital <contato@noirdigital.com.br>', $mail['headers'], true), 'From uses the authenticated domain address.');

reset_request_state();
$GLOBALS['wp_mail_should_fail'] = true;
$mail_failure = noir_contact_handle_request(new WP_REST_Request(valid_payload()));
assert_same(500, $mail_failure->get_status(), 'A wp_mail failure returns HTTP 500.');
$failure_data = response_data($mail_failure);
$failed_lead_id = $failure_data['leadId'] ?? 0;
assert_true(isset($GLOBALS['wp_posts'][$failed_lead_id]), 'The lead remains saved when wp_mail fails.');
assert_same('failed', get_post_meta($failed_lead_id, '_noir_contact_mail_status'), 'Records failed mail status.');
assert_true(str_contains((string) get_post_meta($failed_lead_id, '_noir_contact_mail_error'), 'SMTP authentication failed'), 'Records the safe wp_mail error in post meta.');
assert_same('A mensagem foi registrada, mas a notificação por e-mail não foi enviada.', $failure_data['message'] ?? null, 'The API hides the technical mail error.');

reset_request_state();
$GLOBALS['wp_filter_overrides']['noir_contact_rate_limit_max'] = 2;
$first = noir_contact_handle_request(new WP_REST_Request(valid_payload(array('email' => 'one@example.com'))));
$second = noir_contact_handle_request(new WP_REST_Request(valid_payload(array('email' => 'two@example.com'))));
$limited = noir_contact_handle_request(new WP_REST_Request(valid_payload(array('email' => 'three@example.com'))));
assert_same(200, $first->get_status(), 'First request is below the rate limit.');
assert_same(200, $second->get_status(), 'Second request is below the rate limit.');
assert_same(429, $limited->get_status(), 'Request above the limit returns HTTP 429.');
assert_same('Muitas tentativas em pouco tempo. Tente novamente mais tarde.', response_data($limited)['message'] ?? null, 'Rate-limit message is stable and friendly.');
assert_same(2, count($GLOBALS['wp_posts']), 'Rate-limited request creates no lead.');

assert_true(noir_contact_origin_is_allowed('https://noirdigital.com.br'), 'Allows the production origin.');
assert_true(noir_contact_origin_is_allowed('http://localhost:3000'), 'Allows the configured local development origin.');
assert_true(!noir_contact_origin_is_allowed('https://attacker.example'), 'Rejects unconfigured origins.');
$_SERVER['HTTP_ORIGIN'] = 'https://attacker.example';
$cors_error = noir_contact_enforce_cors(null, null, new WP_REST_Request());
assert_true(is_wp_error($cors_error), 'The REST pre-dispatch guard blocks an unconfigured origin.');
assert_same(403, $cors_error->get_error_data()['status'] ?? null, 'A blocked origin receives HTTP 403 metadata.');

$GLOBALS['test_count']++;
$GLOBALS['test_failures'] = array_values($GLOBALS['test_failures']);

if ($GLOBALS['test_failures'] !== array()) {
    fwrite(STDERR, "\nFAILURES:\n- " . implode("\n- ", $GLOBALS['test_failures']) . "\n");
    exit(1);
}

fwrite(STDOUT, sprintf("PASS: %d WordPress contact assertions.\n", $GLOBALS['test_count']));
