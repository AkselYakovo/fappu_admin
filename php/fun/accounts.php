<?php

$conn = new mysqli('localhost', 'root', '', 'test');
// $dictionary = [
//     0 => '0',
//     1 => '1',
//     2 => '2',
//     3 => '3',
//     4 => '4',
//     5 => '5',
//     6 => '6',
//     7 => '7',
//     8 => '8',
//     9 => '9',
//     10 => 'A',
//     11 => 'B',
//     12 => 'C',
//     13 => 'D',
//     14 => 'E',
//     15 => 'F',
// ];

function create_toast(string $message) {
    return <<<TOAST
                <div class="toast"> 
                    <svg class="warningIcon" width="47" height="40" viewBox="0 0 47 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 -2.5C7.58 -2.5 -2.5 7.58 -2.5 20C-2.5 32.42 7.58 42.5 20 42.5C32.42 42.5 42.5 32.42 42.5 20C42.5 7.58 32.42 -2.5 20 -2.5ZM22.25 31.25H17.75V26.75H22.25V31.25ZM22.25 22.25H17.75V8.75H22.25V22.25Z" fill="#FCFCFC"/>
                    </svg>
                    <p class="message">$message</p>
                    <svg class="closeIcon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                    </svg>
                </div>
TOAST;
}


function new_id() {
    global $__ACCOUNTS;
    $conn = $GLOBALS['conn'];
    $dictionary = array(
    0 => '0',
    1 => '1',
    2 => '2',
    3 => '3',
    4 => '4',
    5 => '5',
    6 => '6',
    7 => '7',
    8 => '8',
    9 => '9',
    10 => 'A',
    11 => 'B',
    12 => 'C',
    13 => 'D',
    14 => 'E',
    15 => 'F',
    );
    // print_r($dictionary);
    $year = date('Y');
    $year = substr($year, 2);

    $month = date('m');

    $trailing_digits = '';

    for ( $i = 0; $i < 5; $i++ ) {
        $trailing_digits = $trailing_digits . $dictionary[rand(0, 15)];
    }

    $new_id = "X$year$month-$trailing_digits";

    $q = "SELECT * FROM `$__ACCOUNTS` WHERE `ACCOUNT_ID` = '$new_id'";
    $results = $conn->query($q);

    // print_r($results);

    if ( $results->fetch_assoc()['num_rows'] == 0 ) {
        return $new_id;
    }

    return false;
    
}

?>