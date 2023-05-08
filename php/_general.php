<?php

$__ACCOUNTS = '_accounts';
$__WEBSITES = '_websites';

function clean_txt(string $txt) {
    $txt = trim($txt);
    $txt = htmlentities($txt);
    $txt = stripslashes($txt);
    return $txt;
}

function printTotalAccounts(mysqli $conn) 
{
    global $__ACCOUNTS; 

    $q = "SELECT COUNT(*) AS 'TOTAL_ACCOUNTS' FROM  `$__ACCOUNTS`";
    $results = $conn->query($q);

    foreach($results as $result) {
        print_r($result['TOTAL_ACCOUNTS']);
    }
    
}

function printTotalActiveAccounts(mysqli $conn) 
{
    global $__ACCOUNTS; 
    
    $q = "SELECT COUNT(*) AS 'TOTAL_ACTIVE_ACCOUNTS' FROM  `$__ACCOUNTS` WHERE `ACCESS_STATE` = '1'";
    $results = $conn->query($q);

    foreach($results as $result) {
        print_r($result['TOTAL_ACTIVE_ACCOUNTS']);
    }
    
}

function getRecords(mysqli $conn, string $q, bool $flag) {
    #$flag = 1 : Return an Associative array.
    #$flag = 0 : Return an Sequential array.
    $results = $conn->query($q);
    if ($results) {
        if ($flag)
            return $results->fetch_assoc();
        else 
            return $results->fetch_array();
    }
    else  {
        return FALSE;
    }
}



?>