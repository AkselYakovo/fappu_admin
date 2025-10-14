<?php
require "../vendor/autoload.php";

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

$main_conn = new mysqli($_ENV["DB_USER"], $_ENV["DB_PASS"], '', $_ENV["DB_NAME"])
    or die('An error occured while trying to initialize the connection to the database.');

# Navigation Links:
define('__LINKS', array('accounts', 'websites', 'statistics', 'sales', 'reclaims', 'vendors', 'messages'));

// Link to assets/
define('_ASSETS', dirname(dirname(__FILE__)) . "/assets");
define('__URL_ROOT', $_ENV['ROOT_DIR']);

// Pagination Constants:
define('__MESSAGES_PER_PAGE', 1);
define('__SALES_PER_PAGE', 10);
define('__RECLAIMS_PER_PAGE', 10);

// Tables References:
$__WEBSITES = $_ENV['DB_TB_WEBSITES'];
$__WEBSITES_CHILDREN = $_ENV['DB_TB_WEBSITES_CHILDREN'];
$__ACCOUNTS = $_ENV['DB_TB_ACCOUNTS'];
$__ACCOUNTS_KILLED = $_ENV['DB_TB_ACCOUNTS_KILLED'];
$__RECLAIMS = $_ENV['DB_TB_RECLAIMS'];
$__SALES = $_ENV['DB_TB_SALES'];
$__MESSAGES = $_ENV['DB_TB_MESSAGES'];
$__VENDORS = $_ENV['DB_TB_VENDORS'];

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