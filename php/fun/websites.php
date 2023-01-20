<?php
function getScreensCollection(mysqli $conn, string $site_code) {
    $q = "SELECT `CHILDREN` FROM `_WEBSITES_CHILDREN` WHERE `SITE_CODE` = '$site_code'";
    $result = $conn->query($q);

    if ( $result ) {
        while($record = $result->fetch_assoc()) 
        {
            $arr = explode('/', $record['CHILDREN']);
            return $arr;
        }
    }
    else {
        return FALSE;
    }
}

function getScreensInt(mysqli $conn, string $site_code) {
    $screens_per_page = 8;

    $q = "SELECT `CHILDREN` FROM `_WEBSITES_CHILDREN` WHERE `SITE_CODE` = '$site_code'";
    $result = $conn->query($q);

    if ( $result ) {
        while($record = $result->fetch_assoc()) 
        {
            $arr = explode('/', $record['CHILDREN']);
            $total_pages = ceil(count($arr) / $screens_per_page);
            return $total_pages;
        }
    }
    else {
        return FALSE;
    }
}

?>