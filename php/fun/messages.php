<?php
// $p = dirname( dirname(__FILE__) ) . '/_general.php';
// echo $p;
// include_once( __DIR__ . "./../_general.php");
require_once(dirname( dirname(__FILE__) ) . '/_general.php');

function count_rows_from_table(string $table) {
    global $main_conn, $__MESSAGES;
    $results = $main_conn->query("SELECT COUNT(*) FROM $table");

    if ( !$results ) 
        throw new Exception("Incorrect Table Name", 1);
        
    return $results->fetch_row()[0];
}

function get_total_messages() {
    global $main_conn, $__MESSAGES;
    $results = $main_conn->query("SELECT COUNT(*) FROM `$__MESSAGES`");

    if ( !$results ) 
        throw new Exception("No Messages Found");

    return $results->fetch_row()[0];
}

function get_total_unique_emails() {
    global $main_conn, $__MESSAGES;
    $results = $main_conn->query("SELECT COUNT(DISTINCT `USER_EMAIL`) FROM `$__MESSAGES`");

    if ( !$results )
        throw new Exception("No Messages Found");

    return $results->fetch_row()[0];
}


?>