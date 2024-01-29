<?php

/**
 * @var array $messages
 */

$html = '';

if (count($messages) === 0) {
    $html = '<div class="alert alert-warning" role="alert">Сообщений нет</div>';
}

foreach ($messages as $message) {
    $html .= <<<HTML
<div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative" id="message_{$message['id']}">
    <div class="col p-4 d-flex flex-column position-static">
        <h3 class="mb-0">{$message['user_name']}</h3>
        <div class="mb-1 text-muted">Отправлено: {$message['date']}</div>
        <p class="mb-auto">{$message['message']}</p>
    </div>
</div>
HTML;
}
?>

<?= $html ?>
