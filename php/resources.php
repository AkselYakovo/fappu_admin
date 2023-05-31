<?php
define('__LINKS', array('accounts', 'websites', 'statistics', 'sales', 'reclaims', 'vendors', 'messages'));
$main_conn = new mysqli('localhost', 'root', '', 'test') or die('Almost Done!');

// Link to assets/
define('_ASSETS', dirname(dirname(__FILE__)) . "/assets");
define('__URL_ROOT', '/projects/fappu_admin/');

// Pagination Constants:
define('__MESSAGES_PER_PAGE', 1);
define('__SALES_PER_PAGE', 10);
define('__RECLAIMS_PER_PAGE', 10);

// Tables References:
$__WEBSITES = '_websites';
$__WEBSITES_CHILDREN = '_websites_children';
$__ACCOUNTS = '_accounts';
$__ACCOUNTS_KILLED = '_accounts_killed';
$__RECLAIMS = '_reclaims';
$__SALES = '_sales';
$__MESSAGES = '_messages';
$__VENDORS = '_vendors';

function get_date_diff(string $str) 
{
    $now = new DateTime();
    $past = new DateTime($str);

    $diff = $now->diff($past);
    return $diff->format('%a');
    // date('YYYY-mm-dd');
}



function get_all_reclaims_number() {
    $main_conn = new mysqli('localhost', 'root', '', 'test') or die('Almost Done!');
    $query = "SELECT COUNT(*) AS `TOTAL_RECLAIMS` FROM _RECLAIMS";
    $results = $main_conn->query($query);
    $result = $results->fetch_assoc();
    return $result['TOTAL_RECLAIMS'];
}

?>