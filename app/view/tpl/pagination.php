<?php

/**
 * @var array $pagination
 * @var int $totalPages
 * @var int $currentPage
 */

$htmlPagination = '';

if ($totalPages > 1) {
    $pages = '';
    for ($i = 1; $i <= $totalPages; $i++) {
        if ($i === $currentPage) {
            /** Если текущая страница */
            $pages .= "<li class=\"page-item active\" aria-current=\"page\"><span class=\"page-link\">$i</span></li>";
            continue;
        }
        $pages .= "<li class=\"page-item\"><a class=\"page-link\" href=\"#\" data-page=\"$i\" onclick=\"renderMessagesWithPagination(this)\">$i</a></li>";
    }

    $htmlPagination = "<nav aria-label=\"paginator\"><ul class=\"pagination pagination-md\">$pages</ul></nav>";
}
?>

<?= $htmlPagination ?>