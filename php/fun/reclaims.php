<?php
// $conn = new mysqli('localhost', 'root', '', 'test') or die('Almost Done!');
require_once(dirname(dirname( __FILE__ )) . "/resources.php");
$conn = $main_conn;

define('RECLAIM_MONTH', 1);
define('RECLAIM_MONTHS', 6);
define('RECLAIM_YEAR', 12);


function get_total_reclaims(int $option) {
    global $conn;
    $today = date('Y-m-d');
    $interval = '';
    
    if ( $option == 1 ) {
        // $now = new DateTime();
        $last_month = new DateTime(date('Y-m-d', time() - ( 30 * 24 * 60 * 60 ) ));
        $interval = $last_month->format('Y-m-d');
        // $final = date_diff($now, $last_month);
    }

    elseif ( $option == 6 ) {
        $six_months = new DateTime(date('Y-m-d', time() - ( 6 * 30 * 24 * 60 * 60 ) ));
        $interval = $six_months->format('Y-m-d');
    }

    elseif ( $option == 12 ) {
        $one_year = new DateTime(date('Y-m-d', time() - ( 12 * 30 * 24 * 60 * 60 ) ));
        $interval = $one_year->format('Y-m-d');
    }

    else {
        $last_month = new DateTime(date('Y-m-d', time() - ( 30 * 24 * 60 * 60 ) ));
        $interval = $last_month->format('Y-m-d');
    }

    $q = "SELECT COUNT(*) AS `RESULT` FROM `$__RECLAIMS` WHERE `DATE` BETWEEN '$interval' AND '$today'";
    $results = $conn->query($q);

    return $results->fetch_assoc()['RESULT'];
}


function get_total_solved_reclaims(int $option) {
    global $conn;
    $today = date('Y-m-d');
    $interval = '';
    
    if ( $option == 1 ) {
        // $now = new DateTime();
        $last_month = new DateTime(date('Y-m-d', time() - ( 30 * 24 * 60 * 60 ) ));
        $interval = $last_month->format('Y-m-d');
        // $final = date_diff($now, $last_month);
    }

    elseif ( $option == 6 ) {
        $six_months = new DateTime(date('Y-m-d', time() - ( 6 * 30 * 24 * 60 * 60 ) ));
        $interval = $six_months->format('Y-m-d');
    }

    elseif ( $option == 12 ) {
        $one_year = new DateTime(date('Y-m-d', time() - ( 12 * 30 * 24 * 60 * 60 ) ));
        $interval = $one_year->format('Y-m-d');
    }

    else {
        $last_month = new DateTime(date('Y-m-d', time() - ( 30 * 24 * 60 * 60 ) ));
        $interval = $last_month->format('Y-m-d');
    }

    $q = "SELECT COUNT(*) AS `RESULT` FROM `$__RECLAIMS` WHERE `DATE` BETWEEN '$interval' AND '$today' AND `STATUS` = 1";
    $results = $conn->query($q);

    return $results->fetch_assoc()['RESULT'];
}



function get_total_unsolved_reclaims(int $option) {
    global $conn;
    $today = date('Y-m-d');
    $interval = '';
    
    if ( $option == 1 ) {
        // $now = new DateTime();
        $last_month = new DateTime(date('Y-m-d', time() - ( 30 * 24 * 60 * 60 ) ));
        $interval = $last_month->format('Y-m-d');
        // $final = date_diff($now, $last_month);
    }

    elseif ( $option == 6 ) {
        $six_months = new DateTime(date('Y-m-d', time() - ( 6 * 30 * 24 * 60 * 60 ) ));
        $interval = $six_months->format('Y-m-d');
    }

    elseif ( $option == 12 ) {
        $one_year = new DateTime(date('Y-m-d', time() - ( 12 * 30 * 24 * 60 * 60 ) ));
        $interval = $one_year->format('Y-m-d');
    }

    else {
        $last_month = new DateTime(date('Y-m-d', time() - ( 30 * 24 * 60 * 60 ) ));
        $interval = $last_month->format('Y-m-d');
    }

    $q = "SELECT COUNT(*) AS `RESULT` FROM `$__RECLAIMS` WHERE `DATE` BETWEEN '$interval' AND '$today' AND `STATUS` = 0";
    $results = $conn->query($q);

    return $results->fetch_assoc()['RESULT'];
}


function solveReclaim(string $reclaim_id) {
    global $conn;
    $conn->query(" UPDATE `$__RECLAIMS` 
                   SET `STATUS` = 1 
                   WHERE `RECLAIM_ID` = '$reclaim_id'");
}

function sendReplacementAccount(string $email) {
    // mail($email, 'Email Sending Test', 'Woosh!');
}

?>