<?php
/**
 * Plugin Name: NOIR Digital - Contatos do site
 * Description: Persiste contatos enviados pelo site e notifica a equipe por e-mail.
 * Version: 1.1.0
 * Author: NOIR Digital
 */

if (!defined('ABSPATH')) {
    return;
}

const NOIR_CONTACT_POST_TYPE = 'noir_contact';
const NOIR_CONTACT_ROUTE_NAMESPACE = 'noir/v1';
const NOIR_CONTACT_ROUTE = '/contact';
const NOIR_CONTACT_DEFAULT_FROM = 'contato@noirdigital.com.br';
const NOIR_CONTACT_DEFAULT_FROM_NAME = 'NOIR Digital';
const NOIR_CONTACT_DEFAULT_RECIPIENTS = array('contato@noirdigital.com.br');
const NOIR_CONTACT_DEFAULT_SMTP_HOST = 'smtp.hostinger.com';
const NOIR_CONTACT_DEFAULT_SMTP_USERNAME = 'contato@noirdigital.com.br';
const NOIR_CONTACT_DEFAULT_SMTP_PORT = 587;
const NOIR_CONTACT_DEFAULT_SMTP_SECURE = 'tls';
const NOIR_CONTACT_DEFAULT_ORIGINS = array(
    'https://noirdigital.com.br',
    'https://www.noirdigital.com.br',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
);

add_action('init', 'noir_contact_register_post_type');
add_action('rest_api_init', 'noir_contact_register_route');
add_action('add_meta_boxes', 'noir_contact_register_meta_box');
add_action('phpmailer_init', 'noir_contact_configure_smtp');
add_filter('rest_pre_dispatch', 'noir_contact_enforce_cors', 5, 3);
add_filter('rest_pre_serve_request', 'noir_contact_send_cors_headers', 5, 4);

function noir_contact_register_post_type()
{
    register_post_type(NOIR_CONTACT_POST_TYPE, array(
        'labels' => array(
            'name' => 'Contatos do site',
            'singular_name' => 'Contato do site',
            'menu_name' => 'Contatos do site',
            'add_new_item' => 'Adicionar contato',
            'edit_item' => 'Visualizar contato',
            'view_item' => 'Visualizar contato',
            'search_items' => 'Buscar contatos',
            'not_found' => 'Nenhum contato encontrado',
        ),
        'public' => false,
        'publicly_queryable' => false,
        'exclude_from_search' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => false,
        'menu_icon' => 'dashicons-email-alt2',
        'supports' => array('title'),
        'map_meta_cap' => true,
        'capability_type' => 'post',
    ));
}

function noir_contact_register_route()
{
    register_rest_route(NOIR_CONTACT_ROUTE_NAMESPACE, NOIR_CONTACT_ROUTE, array(
        'methods' => 'POST',
        'callback' => 'noir_contact_handle_request',
        'permission_callback' => '__return_true',
    ));
}

function noir_contact_is_route($request)
{
    return is_object($request)
        && method_exists($request, 'get_route')
        && $request->get_route() === '/' . NOIR_CONTACT_ROUTE_NAMESPACE . NOIR_CONTACT_ROUTE;
}

function noir_contact_request_origin()
{
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';
    return noir_contact_normalize_origin($origin);
}

function noir_contact_normalize_origin($origin)
{
    if (!is_string($origin) || $origin === '') {
        return '';
    }

    $parts = parse_url(trim($origin));
    if (!is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
        return '';
    }

    $scheme = strtolower((string) $parts['scheme']);
    if ($scheme !== 'https' && $scheme !== 'http') {
        return '';
    }

    $normalized = $scheme . '://' . strtolower((string) $parts['host']);
    if (!empty($parts['port'])) {
        $normalized .= ':' . absint($parts['port']);
    }

    return $normalized;
}

function noir_contact_allowed_origins()
{
    $origins = NOIR_CONTACT_DEFAULT_ORIGINS;
    if (defined('NOIR_ALLOWED_ORIGINS') && is_string(NOIR_ALLOWED_ORIGINS)) {
        $origins = array_merge($origins, explode(',', NOIR_ALLOWED_ORIGINS));
    }

    $normalized = array();
    foreach ($origins as $origin) {
        $candidate = noir_contact_normalize_origin(trim((string) $origin));
        if ($candidate !== '') {
            $normalized[$candidate] = $candidate;
        }
    }

    return array_values($normalized);
}

function noir_contact_origin_is_allowed($origin)
{
    $normalized = noir_contact_normalize_origin($origin);
    return $normalized !== '' && in_array($normalized, noir_contact_allowed_origins(), true);
}

function noir_contact_enforce_cors($result, $server, $request)
{
    if (!noir_contact_is_route($request)) {
        return $result;
    }

    if (function_exists('remove_filter')) {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    }

    $origin = noir_contact_request_origin();
    if ($origin !== '' && !noir_contact_origin_is_allowed($origin)) {
        return new WP_Error(
            'noir_contact_origin_forbidden',
            'Origem não autorizada.',
            array('status' => 403)
        );
    }

    return $result;
}

function noir_contact_send_cors_headers($served, $result, $request, $server)
{
    if (!noir_contact_is_route($request) || headers_sent()) {
        return $served;
    }

    header_remove('Access-Control-Allow-Origin');
    header_remove('Access-Control-Allow-Credentials');

    $origin = noir_contact_request_origin();
    if ($origin !== '' && noir_contact_origin_is_allowed($origin)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin', false);
    }

    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Accept, Content-Type');
    header('Access-Control-Max-Age: 600');

    return $served;
}

function noir_contact_limit_text($value, $maximum)
{
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maximum, 'UTF-8');
    }

    return substr($value, 0, $maximum);
}

function noir_contact_value($params, $key)
{
    if (!is_array($params) || !array_key_exists($key, $params) || !is_scalar($params[$key])) {
        return '';
    }

    return wp_unslash((string) $params[$key]);
}

function noir_contact_normalize_phone($phone)
{
    $raw = sanitize_text_field($phone);
    if ($raw === '') {
        return '';
    }

    $has_plus = substr($raw, 0, 1) === '+';
    $digits = preg_replace('/\D+/', '', $raw);
    if (!is_string($digits) || $digits === '') {
        return new WP_Error('noir_contact_invalid_phone', 'Telefone inválido.');
    }

    if (!$has_plus && strlen($digits) >= 10 && strlen($digits) <= 11) {
        $digits = '55' . $digits;
    }

    $normalized = '+' . $digits;
    if (!preg_match('/^\+[1-9][0-9]{9,14}$/', $normalized)) {
        return new WP_Error('noir_contact_invalid_phone', 'Telefone inválido.');
    }

    return $normalized;
}

function noir_contact_validate_payload($params)
{
    $first_name = noir_contact_limit_text(sanitize_text_field(noir_contact_value($params, 'firstName')), 80);
    $last_name = noir_contact_limit_text(sanitize_text_field(noir_contact_value($params, 'lastName')), 80);
    $email = noir_contact_limit_text(sanitize_email(noir_contact_value($params, 'email')), 190);
    $company = noir_contact_limit_text(sanitize_text_field(noir_contact_value($params, 'company')), 120);
    $service = noir_contact_limit_text(sanitize_text_field(noir_contact_value($params, 'service')), 120);
    $message = noir_contact_limit_text(sanitize_textarea_field(noir_contact_value($params, 'message')), 4000);
    $page_url = esc_url_raw(noir_contact_value($params, 'pageUrl'));
    $source = noir_contact_limit_text(sanitize_text_field(noir_contact_value($params, 'source')), 120);
    $phone = noir_contact_normalize_phone(noir_contact_value($params, 'phone'));

    if (
        $first_name === ''
        || $email === ''
        || !is_email($email)
        || $service === ''
        || $message === ''
        || is_wp_error($phone)
    ) {
        return new WP_Error('noir_contact_validation', 'Confira os campos informados.');
    }

    if ($source === '') {
        $source = 'Formulário de contato';
    }

    return array(
        'first_name' => $first_name,
        'last_name' => $last_name,
        'email' => $email,
        'company' => $company,
        'phone' => $phone,
        'service' => $service,
        'message' => $message,
        'page_url' => $page_url,
        'source' => $source,
    );
}

function noir_contact_request_fingerprint()
{
    $remote = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '';
    $cloudflare = isset($_SERVER['HTTP_CF_CONNECTING_IP'])
        ? sanitize_text_field(wp_unslash($_SERVER['HTTP_CF_CONNECTING_IP']))
        : '';

    $remote = filter_var($remote, FILTER_VALIDATE_IP) ? $remote : 'unknown';
    $cloudflare = filter_var($cloudflare, FILTER_VALIDATE_IP) ? $cloudflare : '';
    return $remote . ($cloudflare !== '' ? '|' . $cloudflare : '');
}

function noir_contact_ip_hash()
{
    return hash_hmac('sha256', noir_contact_request_fingerprint(), wp_salt('auth'));
}

function noir_contact_rate_limit_allows($ip_hash)
{
    $maximum = max(1, absint(apply_filters('noir_contact_rate_limit_max', 5)));
    $window = max(60, absint(apply_filters('noir_contact_rate_limit_window', 15 * 60)));
    $key = 'noir_contact_' . substr($ip_hash, 0, 32);
    $attempts = absint(get_transient($key));

    if ($attempts >= $maximum) {
        return false;
    }

    set_transient($key, $attempts + 1, $window);
    return true;
}

function noir_contact_get_recipients()
{
    $candidates = NOIR_CONTACT_DEFAULT_RECIPIENTS;
    if (defined('NOIR_CONTACT_RECIPIENTS')) {
        $configured = is_array(NOIR_CONTACT_RECIPIENTS)
            ? NOIR_CONTACT_RECIPIENTS
            : explode(',', (string) NOIR_CONTACT_RECIPIENTS);
        $candidates = array_merge($candidates, $configured);
    }

    $recipients = array();
    foreach ($candidates as $candidate) {
        $email = sanitize_email(trim((string) $candidate));
        if ($email !== '' && is_email($email)) {
            $recipients[strtolower($email)] = $email;
        }
    }

    return array_values($recipients);
}

function noir_contact_from_email()
{
    $configured = defined('NOIR_MAIL_FROM_EMAIL') ? sanitize_email(NOIR_MAIL_FROM_EMAIL) : '';
    $smtp_username = defined('NOIR_SMTP_USERNAME')
        ? sanitize_email(NOIR_SMTP_USERNAME)
        : NOIR_CONTACT_DEFAULT_SMTP_USERNAME;
    $authenticated_email = $smtp_username !== '' && is_email($smtp_username)
        ? $smtp_username
        : NOIR_CONTACT_DEFAULT_FROM;
    $authenticated_separator = strrpos($authenticated_email, '@');
    $configured_separator = strrpos($configured, '@');
    $authenticated_domain = $authenticated_separator === false
        ? ''
        : strtolower(substr($authenticated_email, $authenticated_separator + 1));
    $configured_domain = $configured_separator === false
        ? ''
        : strtolower(substr($configured, $configured_separator + 1));

    if (
        $configured !== ''
        && is_email($configured)
        && $configured_domain !== ''
        && $configured_domain === $authenticated_domain
    ) {
        return $configured;
    }

    return $authenticated_email;
}

function noir_contact_from_name()
{
    $configured = defined('NOIR_MAIL_FROM_NAME') ? sanitize_text_field(NOIR_MAIL_FROM_NAME) : '';
    return $configured !== '' ? $configured : NOIR_CONTACT_DEFAULT_FROM_NAME;
}

function noir_contact_meta_key($field)
{
    return '_noir_contact_' . $field;
}

function noir_contact_store_meta($lead_id, $data, $ip_hash, $recipients, $received_at)
{
    $user_agent = isset($_SERVER['HTTP_USER_AGENT'])
        ? noir_contact_limit_text(sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])), 255)
        : '';

    $meta = array(
        'first_name' => $data['first_name'],
        'last_name' => $data['last_name'],
        'email' => $data['email'],
        'company' => $data['company'],
        'phone' => $data['phone'],
        'service' => $data['service'],
        'source' => $data['source'],
        'page_url' => $data['page_url'],
        'ip_hash' => $ip_hash,
        'user_agent' => $user_agent,
        'received_at' => $received_at,
        'mail_status' => 'pending',
        'recipients' => $recipients,
        'mail_attempted_at' => '',
        'mail_error' => '',
    );

    foreach ($meta as $key => $value) {
        update_post_meta($lead_id, noir_contact_meta_key($key), $value);
    }
}

function noir_contact_mail_body($data, $received_at)
{
    $name = trim($data['first_name'] . ' ' . $data['last_name']);
    return implode("\n", array(
        'Novo contato recebido pelo site da NOIR Digital',
        '',
        'Nome: ' . $name,
        'E-mail: ' . $data['email'],
        'Empresa: ' . ($data['company'] !== '' ? $data['company'] : 'Não informada'),
        'Telefone: ' . ($data['phone'] !== '' ? $data['phone'] : 'Não informado'),
        'Serviço: ' . $data['service'],
        'Origem: ' . $data['source'],
        'Página: ' . ($data['page_url'] !== '' ? $data['page_url'] : 'Não informada'),
        'Recebido em (UTC): ' . $received_at,
        '',
        'Mensagem:',
        $data['message'],
    ));
}

function noir_contact_send_mail($lead_id, $data, $recipients, $received_at)
{
    $name = trim($data['first_name'] . ' ' . $data['last_name']);
    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . noir_contact_from_name() . ' <' . noir_contact_from_email() . '>',
        'Reply-To: ' . $name . ' <' . $data['email'] . '>',
    );
    $subject = '[NOIR Digital] Novo contato do site — ' . $name;
    $mail_error = '';
    $failure_listener = static function ($error) use (&$mail_error) {
        if (is_wp_error($error)) {
            $mail_error = noir_contact_limit_text(sanitize_text_field($error->get_error_message()), 500);
        }
    };

    update_post_meta($lead_id, noir_contact_meta_key('mail_attempted_at'), current_time('mysql', true));
    add_action('wp_mail_failed', $failure_listener, 10, 1);
    $sent = wp_mail(
        $recipients,
        $subject,
        noir_contact_mail_body($data, $received_at),
        $headers
    );
    remove_action('wp_mail_failed', $failure_listener, 10);

    if ($sent) {
        update_post_meta($lead_id, noir_contact_meta_key('mail_status'), 'sent');
        update_post_meta($lead_id, noir_contact_meta_key('mail_error'), '');
        return true;
    }

    if ($mail_error === '') {
        $mail_error = 'wp_mail retornou false sem detalhes adicionais.';
    }
    update_post_meta($lead_id, noir_contact_meta_key('mail_status'), 'failed');
    update_post_meta($lead_id, noir_contact_meta_key('mail_error'), $mail_error);
    return false;
}

function noir_contact_handle_request($request)
{
    $params = is_object($request) && method_exists($request, 'get_json_params')
        ? $request->get_json_params()
        : array();
    $params = is_array($params) ? $params : array();

    if (sanitize_text_field(noir_contact_value($params, 'website')) !== '') {
        return new WP_REST_Response(array(
            'ok' => true,
            'message' => 'Mensagem recebida com sucesso.',
        ), 200);
    }

    $ip_hash = noir_contact_ip_hash();
    if (!noir_contact_rate_limit_allows($ip_hash)) {
        return new WP_REST_Response(array(
            'ok' => false,
            'message' => 'Muitas tentativas em pouco tempo. Tente novamente mais tarde.',
        ), 429);
    }

    $data = noir_contact_validate_payload($params);
    if (is_wp_error($data)) {
        return new WP_REST_Response(array(
            'ok' => false,
            'message' => 'Confira os campos informados.',
        ), 400);
    }

    $received_at = current_time('mysql', true);
    $name = trim($data['first_name'] . ' ' . $data['last_name']);
    $title = $name;
    if ($data['company'] !== '') {
        $title .= ' — ' . $data['company'];
    }
    $title .= ' — ' . wp_date('d/m/Y H:i');

    $lead_id = wp_insert_post(array(
        'post_type' => NOIR_CONTACT_POST_TYPE,
        'post_status' => 'private',
        'post_title' => $title,
        'post_content' => $data['message'],
    ), true);

    if (is_wp_error($lead_id)) {
        return new WP_REST_Response(array(
            'ok' => false,
            'message' => 'Não foi possível registrar a mensagem. Tente novamente mais tarde.',
        ), 500);
    }

    $recipients = noir_contact_get_recipients();
    noir_contact_store_meta($lead_id, $data, $ip_hash, $recipients, $received_at);

    if (!noir_contact_send_mail($lead_id, $data, $recipients, $received_at)) {
        return new WP_REST_Response(array(
            'ok' => false,
            'leadId' => $lead_id,
            'message' => 'A mensagem foi registrada, mas a notificação por e-mail não foi enviada.',
        ), 500);
    }

    return new WP_REST_Response(array(
        'ok' => true,
        'leadId' => $lead_id,
        'message' => 'Mensagem recebida com sucesso.',
    ), 200);
}

function noir_contact_register_meta_box()
{
    add_meta_box(
        'noir_contact_details',
        'Dados do contato',
        'noir_contact_render_meta_box',
        NOIR_CONTACT_POST_TYPE
    );
}

function noir_contact_render_meta_box($post)
{
    $fields = array(
        'first_name' => 'Nome',
        'last_name' => 'Sobrenome',
        'email' => 'E-mail',
        'company' => 'Empresa',
        'phone' => 'Telefone',
        'service' => 'Serviço',
        'source' => 'Origem',
        'page_url' => 'URL da página',
        'ip_hash' => 'Hash do IP',
        'user_agent' => 'User-Agent',
        'received_at' => 'Recebido em (UTC)',
        'mail_status' => 'Status do e-mail',
        'recipients' => 'Destinatários',
        'mail_attempted_at' => 'Tentativa de envio (UTC)',
        'mail_error' => 'Erro de e-mail',
    );

    echo '<table class="widefat striped" style="table-layout:fixed"><tbody>';
    foreach ($fields as $key => $label) {
        $value = get_post_meta($post->ID, noir_contact_meta_key($key), true);
        if (is_array($value)) {
            $value = implode(', ', array_map('sanitize_email', $value));
        }
        echo '<tr><th style="width:220px">' . esc_html($label) . '</th><td style="overflow-wrap:anywhere">' . esc_html($value) . '</td></tr>';
    }
    echo '<tr><th>Mensagem</th><td><pre style="white-space:pre-wrap;margin:0">' . esc_html($post->post_content) . '</pre></td></tr>';
    echo '</tbody></table>';
}

function noir_contact_configure_smtp($phpmailer)
{
    if (!defined('NOIR_SMTP_PASSWORD') || trim((string) NOIR_SMTP_PASSWORD) === '') {
        return;
    }

    $host = defined('NOIR_SMTP_HOST')
        ? sanitize_text_field(NOIR_SMTP_HOST)
        : NOIR_CONTACT_DEFAULT_SMTP_HOST;
    $username = defined('NOIR_SMTP_USERNAME')
        ? sanitize_email(NOIR_SMTP_USERNAME)
        : NOIR_CONTACT_DEFAULT_SMTP_USERNAME;
    if ($host === '' || $username === '' || !is_email($username)) {
        return;
    }

    $port = defined('NOIR_SMTP_PORT')
        ? absint(NOIR_SMTP_PORT)
        : NOIR_CONTACT_DEFAULT_SMTP_PORT;
    $secure = defined('NOIR_SMTP_SECURE')
        ? strtolower(sanitize_text_field(NOIR_SMTP_SECURE))
        : NOIR_CONTACT_DEFAULT_SMTP_SECURE;
    if (!in_array($secure, array('tls', 'ssl'), true)) {
        $secure = NOIR_CONTACT_DEFAULT_SMTP_SECURE;
    }

    $phpmailer->isSMTP();
    $phpmailer->Host = $host;
    $phpmailer->SMTPAuth = true;
    $phpmailer->Username = $username;
    $phpmailer->Password = (string) NOIR_SMTP_PASSWORD;
    $phpmailer->Port = $port > 0 ? $port : NOIR_CONTACT_DEFAULT_SMTP_PORT;
    $phpmailer->SMTPSecure = $secure;
    $phpmailer->CharSet = 'UTF-8';
    $phpmailer->setFrom(noir_contact_from_email(), noir_contact_from_name(), false);
}
