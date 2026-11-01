<?php
/**
 * Plugin Name: Ultiwrite Investigative Intelligence
 * Plugin URI: https://dwsoffshorepartners.com
 * Description: Asymmetric diligence: access secure evidence intake and saved investigation results from a private administrator page.
 * Version: 0.1.0
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * Author: DWS Offshore Fund
 * Author URI: https://dwsoffshorepartners.com
 * License: GPL-2.0-or-later
 * Text Domain: ultiwrite
 */
if (!defined('ABSPATH')) { exit; }

function ultiwrite_route(string $operation, string $identifier = ''): array {
    $fixed = ['account' => '/me', 'usage' => '/usage', 'cases' => '/cases?limit=10', 'upload' => '/upload-links'];
    if (isset($fixed[$operation])) {
        return ['method' => $operation === 'upload' ? 'POST' : 'GET', 'path' => $fixed[$operation]];
    }
    if (!in_array($operation, ['case', 'brief', 'export'], true) || !preg_match('/\A[A-Za-z0-9_-]{1,80}\z/', $identifier)) {
        throw new InvalidArgumentException('Invalid operation or identifier.');
    }
    return ['method' => 'GET', 'path' => $operation === 'export' ? '/reports/' . $identifier . '/export' : '/cases/' . $identifier . ($operation === 'brief' ? '/brief' : '')];
}
function ultiwrite_safe_url($value): ?string {
    if (!is_string($value)) { return null; }
    $parts = parse_url($value);
    if (!$parts || ($parts['scheme'] ?? '') !== 'https' || ($parts['host'] ?? '') !== 'dwsoffshorepartners.com' || isset($parts['user']) || isset($parts['pass']) || (isset($parts['port']) && $parts['port'] !== 443)) { return null; }
    return $value;
}
function ultiwrite_request(string $operation, string $identifier = '', bool $forensics = false) {
    if (!current_user_can('manage_options')) { return new WP_Error('forbidden', 'Administrator access is required.'); }
    if (!defined('ULTIWRITE_API_KEY') || !is_string(ULTIWRITE_API_KEY) || ULTIWRITE_API_KEY === '' || preg_match('/[\r\n]/', ULTIWRITE_API_KEY)) {
        return new WP_Error('configuration', 'Configure ULTIWRITE_API_KEY securely in wp-config.php or through your hosting secret configuration.');
    }
    try { $route = ultiwrite_route($operation, $identifier); }
    catch (InvalidArgumentException $e) { return new WP_Error('invalid_input', $e->getMessage()); }
    $args = ['method' => $route['method'], 'timeout' => 20, 'redirection' => 0, 'limit_response_size' => 2097152, 'headers' => ['Authorization' => 'Bearer ' . ULTIWRITE_API_KEY, 'Accept' => 'application/json']];
    if ($operation === 'upload') {
        $args['headers']['Content-Type'] = 'application/json';
        $args['body'] = wp_json_encode(['documentForensics' => $forensics]);
    }
    $response = wp_remote_request('https://dwsoffshorepartners.com/api/v1' . $route['path'], $args);
    if (is_wp_error($response)) { return new WP_Error('network', 'Ultiwrite could not be reached. No success is established.'); }
    $status = wp_remote_retrieve_response_code($response);
    if ($status < 200 || $status >= 300) {
        return new WP_Error('api', 'Ultiwrite returned HTTP ' . (int)$status . '. Check API approval, credentials, quota and the saved case.');
    }
    if (stripos((string)wp_remote_retrieve_header($response, 'content-type'), 'application/json') === false) { return new WP_Error('response', 'Unexpected non-JSON response.'); }
    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) { return new WP_Error('response', 'Invalid JSON response.'); }
    return $data;
}
add_action('admin_menu', function () {
    add_menu_page('Ultiwrite', 'Ultiwrite', 'manage_options', 'ultiwrite', 'ultiwrite_admin_page', 'dashicons-search');
});
function ultiwrite_admin_page(): void {
    if (!current_user_can('manage_options')) { wp_die('Administrator access required.'); }
    $result = null;
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
        check_admin_referer('ultiwrite_action');
        $op = isset($_POST['operation']) && is_string($_POST['operation']) ? sanitize_text_field(wp_unslash($_POST['operation'])) : '';
        $id = isset($_POST['identifier']) && is_string($_POST['identifier']) ? sanitize_text_field(wp_unslash($_POST['identifier'])) : '';
        $result = ultiwrite_request($op, $id, isset($_POST['documentForensics']) && $_POST['documentForensics'] === '1');
    }
    echo '<div class="wrap"><h1>Ultiwrite</h1><h2>Asymmetric diligence &amp; investigative intelligence</h2><p>Go beyond the evidence you are given. Use authorized evidence intake and read the saved investigation. Nothing is submitted when this plugin is installed.</p>';
    echo '<p>This private page uses a site-level Ultiwrite account. Site administrators can access that connected account. API approval and normal account limits apply.</p>';
    if (!defined('ULTIWRITE_API_KEY')) { echo '<div class="notice notice-warning"><p>Add ULTIWRITE_API_KEY in your server configuration. Never put it in a page, shortcode or public JavaScript.</p></div>'; }
    echo '<form method="post">'; wp_nonce_field('ultiwrite_action');
    echo '<label>Operation <select name="operation">';
    foreach (['account' => 'Check connected account', 'usage' => 'Read usage', 'cases' => 'Read first case page', 'upload' => 'Create secure upload link', 'case' => 'Read case status', 'brief' => 'Read saved Decision Brief', 'export' => 'Read report delivery options'] as $value => $label) {
        echo '<option value="' . esc_attr($value) . '">' . esc_html($label) . '</option>';
    }
    echo '</select></label><p><label>Case or report identifier <input name="identifier" maxlength="80" autocomplete="off"></label></p><p><label><input type="checkbox" name="documentForensics" value="1"> Request optional document forensics when creating an upload link</label></p><p>Upload links are sensitive, short-lived and single use. Creating a link does not mean an analysis has completed. Upload only evidence you are authorized to use.</p>';
    submit_button('Run selected action'); echo '</form>';
    if (is_wp_error($result)) { echo '<div class="notice notice-error"><p>' . esc_html($result->get_error_message()) . '</p></div>'; }
    elseif (is_array($result)) {
        $link = ultiwrite_safe_url($result['url'] ?? null);
        if ($link) { echo '<p><a class="button button-primary" target="_blank" rel="noopener noreferrer" href="' . esc_url($link) . '">Open secure evidence uploader</a></p>'; }
        $preview = $result; unset($preview['url']);
        echo '<p>Saved API response. A case-list page may be incomplete; preserve nextCursor. Workflow completion is not an approval or verified conclusion. Report downloads require website sign-in.</p><pre style="white-space:pre-wrap">' . esc_html(wp_json_encode($preview, JSON_PRETTY_PRINT)) . '</pre>';
    }
    echo '<p><a href="https://dwsoffshorepartners.com/docs/api" target="_blank" rel="noopener noreferrer">API documentation</a> | <a href="https://dwsoffshorepartners.com/privacy">Privacy</a></p></div>';
}
