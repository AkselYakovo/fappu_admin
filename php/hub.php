<?php
require_once('./fun/accounts.php');
require_once('./fun/reclaims.php');
require_once'./_general.php';
require_once'./resources.php';

// print_r($_POST);

$dictionary = array(
    '__WBEGINS' => 'WARRANTY_BEGINS',
    '__WENDS' => 'WARRANTY_ENDS',
    '__NICKNAME' => 'ACCOUNT_NICK',
    '__PASSWORD' => 'ACCOUNT_PASS',
    '__PRICE' => 'PRICE_PAID',
    '__AVAILABLE_ACCOUNTS' => 'N_AVAILABLE'
);


// CRUD Coding & Validation...

// Create New Account Code & Validation... 
//
// Receive, Validate & Storage A New Account...
if ( isset($_POST['__FUN']) && $_POST['__FUN'] == 'New Account' ) {
    
    $id = new_id();
    $website = clean_txt( $_POST['__WEBSITE'] );
    $nickname = clean_txt( $_POST['__NICK'] );
    $password = clean_txt( $_POST['__PASS'] );
    $price = clean_txt( $_POST['__PRICE'] );
    $offers = clean_txt( $_POST['__OFFERS'] );
    $vendor = clean_txt( $_POST['__VENDOR'] );
    $warranty_begins = clean_txt( $_POST['__WBEGINS'] );
    $warranty_ends = clean_txt( $_POST['__WENDS'] );

    if ( $id && $nickname && $password && $website && $offers && $price && $vendor && $warranty_begins && $warranty_ends ) 
    {
        $new_account_query = "INSERT INTO `_ACCOUNTS` (`ACCOUNT_ID`, `SITE_CODE`, `ACCOUNT_NICK`, `ACCOUNT_PASS`, `PRICE_PAID`,
                                          `VENDOR_ID`, `WARRANTY_BEGINS`, `WARRANTY_ENDS`, `ACCESS_STATE`, `N_AVAILABLE`, `N_SOLD`)
                              VALUES('$id', '$website', '$nickname', '$password', '$price', '$vendor', 
                                     '$warranty_begins', '$warranty_ends', 1 /*ACCESS_STATE**/, '$offers', 0/**SOLD ACCOUNTS**/)";
        $final_result = $main_conn->query($new_account_query);

        if ( $final_result ) 
        {
            $final_message = "ACCOUNT CREATED CORRECTLY...";
            echo create_toast($final_message);
        }

        elseif ( !$final_result ) 
        {
            $final_message = "SOMETHING WENT WRONG!";
            echo create_toast($final_message);
        }
    }

    else {
        $final_message = "FAILED, CHECK THE DATA ENTERED...";
        echo create_toast($final_message);
    }
}

// CREATE: New Website...
if ( isset($_POST['__PUT']) && isset($_POST['__WEBSITE']) && isset($_FILES) )  
{
    $original_price = clean_txt($_POST['__ORIGINAL_PRICE']);
    $offer_price = clean_txt($_POST['__SALE_PRICE']);

    $site_code = strtoupper(clean_txt($_POST['__SITE_CODE']));
    $site_title = strtoupper(clean_txt($_POST['__SITE_TITLE']));
    $site_url = strtolower(clean_txt($_POST['__SITE_URL']));

    // Check If Website Exists Already.
    if ( is_dir("../assets/thumbs/$site_code") ) {
        throw new Exception('Website Already Exists..');
    }

    // Make Thumbs Dir & Sub Dir "blur".
    mkdir("../assets/thumbs/$site_code/");
    mkdir("../assets/thumbs/$site_code/blur/");
    // Make Screens Dir.
    mkdir("../assets/screens/$site_code/");
    mkdir("../assets/screens/$site_code/blur/");
    // Make Subsites Dir.
    mkdir("../assets/subsites_logos/$site_code/");
    mkdir("../assets/subsites_logos/$site_code/blur/");
    // Upload Logo.
    move_uploaded_file($_FILES['__LOGO']['tmp_name'], "../assets/websites_logos/" . strtolower($site_code) . ".png");

    // Create New Website Record.
    $new_website_query = "INSERT INTO `_WEBSITES` VALUES('$site_code', '$site_title', '$site_url', $original_price, $offer_price)";

    try { $new_website = $main_conn->query($new_website_query); } 
    catch(Exception $error) { echo $error; }

    // Create New Children Website Record.
    $new_children_website_query = "INSERT INTO _WEBSITES_CHILDREN VALUES('$site_code', '')";

    try { $new_children_website = $main_conn->query($new_children_website_query); } 
    catch(Exception $error) { echo $error; }


    // Upload Edited Pictures.
    for($i = 1; $i <= 3; $i++) {
        $picture = new Imagick($_FILES["__PICTURE_$i"]['tmp_name']);
        $picture_scale = $_POST["__PICTURE_$i" . "_SCALE"];
        
        $origin_arr = explode('/', $_POST["__PICTURE_$i" . '_COORDS']);
        $new_width = (int) ( ($picture->getImageWidth() / $picture->getImageHeight() ) * 500) * $picture_scale;
        $new_height = (int) 500 * $picture_scale;

        $picture->resizeImage($new_width, $new_height, Imagick::FILTER_UNDEFINED, 0);
        $picture->cropImage(510,510, $origin_arr[0], $origin_arr[1]);
        $picture->setImageCompressionQuality(80);
        $blurred_picture = clone $picture;
        $picture->writeImage(realpath("./../assets/thumbs/$site_code/") . "/" . strtolower($site_title) . "_$i.jpg");

        // $blurred_picture = new Imagick($_FILES["__PICTURE_$i"]['tmp_name']);
        $blurred_picture->blurImage(4,4);
        $blurred_picture->scaleImage($blurred_picture->getImageWidth() / 2, 0);
        $blurred_picture->setImageCompressionQuality(50);
        $blurred_picture->writeImage(realpath("./../assets/thumbs/$site_code/") . "/blur/" . strtolower($site_title) . "_$i.jpg");
    }
    
}


// CREATE: New Subsite Screen... 
if ( isset($_POST['__PUT']) && isset($_POST['__SUBTITLE']) && isset($_FILES) ) 
{
    $logo_file = $_FILES['__LOGO'];
    $picture_file = $_FILES['__PICTURE'];

    $subtitle = strtolower((clean_txt($_POST['__SUBTITLE'])));
    $site_code = strtoupper(clean_txt(($_POST['__SITE_CODE'])));

    // Get Important Picture's Data.
    $picture_origin = clean_txt($_POST['__ORIGIN']);
    $picture_scale = clean_txt($_POST['__SCALE']);

    // Get Origin Coordenates.
    $origin = explode('/', $picture_origin);
    $x = $origin[0];
    $y = ( $picture_scale != 1 ) ? $origin[1] : 0;

    // ~ Screen Picture Resizing And Cropping. ~
    // Create New Resource Pictures..
    $original_picture = new Imagick($picture_file['tmp_name']);
    $blurred_picture = clone $original_picture;
    // Resize Resource Picture.
    $original_picture->scaleImage(0, (500 * $picture_scale) );
    // Crop Picture With Origin Point.
    $original_picture->cropImage(310, 500, $x, $y);
    // Save Original Picture.
    $original_picture->writeImage(realpath("./../assets/screens/$site_code/") . "/$subtitle.jpg");
    // Config Blurred Image.
    $blurred_picture->scaleImage(0, $blurred_picture->getImageHeight() / 2 );
    $blurred_picture->cropImage(310, 500, $x, $y);
    $blurred_picture->blurImage(16,16);
    // Save Blurred Image.
    $blurred_picture->writeImage(realpath("./../assets/screens/$site_code/blur/") . "/$subtitle.jpg");
    
    // Create New Logo Pictures.
    $logo_picture = new Imagick($logo_file['tmp_name']);
    $logo_picture_blurred = clone $logo_picture;
    $logo_picture_reduced = clone $logo_picture;
    // Blurred Logo Picture Resize & Blur.
    $logo_picture_blurred->scaleImage( (int) ($logo_picture_blurred->getImageWidth() / 10), 0);
    $logo_picture_blurred->blurImage(16,8);
    // Reduced Logo Picture Resize.
    $aspect_ration = (float) $logo_picture_reduced->getImageWidth() / $logo_picture_reduced->getImageHeight();
    if ( $aspect_ration <= 2.5 )
        $logo_picture_reduced->scaleImage(0, 75);
    elseif ( $logo_aspect_ration > 2.5)
        $logo_picture_reduced->scaleImage(150, 0);
    
    // Upload Logo Files...
    $logo_picture->writeImage(realpath("./../assets/subsites_logos/$site_code/") . "/$subtitle.png");
    $logo_picture_blurred->writeImage(realpath("./../assets/subsites_logos/$site_code/blur/") . "/$subtitle.png");
    $logo_picture_reduced->writeImage(realpath("./../assets/subsites_logos/$site_code/reduced/") . "/$subtitle.png");
    

    // Get All Children Subsites First..
    $children_query = "SELECT `CHILDREN` FROM `_WEBSITES_CHILDREN` WHERE `SITE_CODE` = '$site_code'";
    $children_results = $main_conn->query($children_query);
    $children = $children_results->fetch_array();

    
    // Update Table With Newest Subsite...
    if ( $children[0] != '' ) {
        $new_children = $children[0] . "/$subtitle";
    }
    else {
        $new_children = $subtitle;
    }
    $new_children_query = "UPDATE `_WEBSITES_CHILDREN` SET `CHILDREN` = '$new_children' WHERE `SITE_CODE` = '$site_code'";
    $new_children_results = $main_conn->query($new_children_query);
    
}


// CREATE: New Vendor.
if ( isset($_POST['__PUT']) && isset($_POST['__VENDOR']) && isset($_FILES) ) {
    $vendor_id = strtoupper(clean_txt($_POST['__VENDOR_ID']));
    $vendor_email = strtolower(clean_txt($_POST['__VENDOR_EMAIL']));
    $vendor_url = strtolower(clean_txt($_POST['__VENDOR_URL']));

    $date = date('Y-m-d');
    $image_format = '.' . substr( $_FILES['__AVATAR']['type'], strpos($_FILES['__AVATAR']['type'], '/') + 1);
    $image_uri = strtolower($vendor_id) . $image_format;

    $vendor_query = "INSERT INTO `_VENDORS` VALUES('$vendor_id', '$vendor_email', '$vendor_url', '$date', NULL)";
    $vendor = $main_conn->query($vendor_query);

    print_r($image_format);
    if ( $vendor ) {
        $vendor_avatar = new Imagick($_FILES['__AVATAR']['tmp_name']);
        $vendor_avatar->scaleImage(98, 0);
        $vendor_avatar->writeImage(realpath('./../assets/vendors/') . '/' . $image_uri);
    }

    else {
        var_dump($vendor);
    }
}


// CREATE: New Replacement Account..
if ( isset($_POST['__PUT']) && isset($_POST['__REPLACE_ACCOUNT']) && isset($_POST['__ACCOUNT_ID']) ) {
    $account_id = clean_txt($_POST['__ACCOUNT_ID']);
    $nickname = clean_txt($_POST['__NICKNAME']);
    $password = clean_txt($_POST['__PASS']);

    $replace_created = false;

    $account_information_query = "SELECT * 
                                  FROM _ACCOUNTS 
                                  WHERE `ACCOUNT_ID` = '$account_id'";

    $account_information = $main_conn->query($account_information_query);
    
    if ( $account_information ) {
        $information = $account_information->fetch_assoc();
        $new_id = new_id();
        $site_code = $information['SITE_CODE'];
        $price = $information['PRICE_PAID'];
        $total_offers = $information['N_AVAILABLE'];
        $warranty_begins = date('Y-m-d');
        $warranty_ends = date('Y-m-d', time() + ( 28 * 24 * 60 * 60 ));
        $new_replacement_account_query = "INSERT INTO _ACCOUNTS 
                                          VALUES('$new_id', '$site_code', '$nickname', '$password', 
                                          'SELF',  '$price', '$warranty_begins', '$warranty_ends',  0, $total_offers, $total_offers)";
        $results = $main_conn->query($new_replacement_account_query);

        if ( $results ) {
            $today = $warranty_begins;
            $new_killed_account_query = "INSERT INTO _ACCOUNTS_KILLED VALUES('$new_id', 'REPLACEMENT', '$today')";
            $res = $main_conn->query($new_killed_account_query);

            if ( $res ) {
                echo "@@Success@@";
                $replace_created = true;
            }
            else {
                echo "ohh man";
            }

        }
        else {
            var_dump($results);
        }

    }

    elseif ( !$account_information ) {
        echo "Invalid ID.";
    }

    // Final Step: Send Emails To All Buyers..
    if ( $replace_created ) 
    {
        $get_emails_query = "SELECT `USER_EMAIL` 
                             FROM _SALES 
                             WHERE `ACCOUNT_ID` = '$account_id'"; 
        $results = $main_conn->query($get_emails_query);
        
        if ( $results ) {
            $emails = $results->fetch_array();
            foreach($emails as $email) {
                sendReplacementAccount($email);
            }
        }
        else {
            echo "Problem When Getting Emails.";
        }
    }
}


// READ : 
// Pull Specific Type Of Information Out Of Tables..
//
// READ: Pull Websites List...
if ( isset($_POST['__PULL']) && isset($_POST['__WEBSITES']) ) 
{
    $websites_query = "SELECT `SITE_CODE`, `SITE_TITLE` FROM `_WEBSITES`";
    $websites = $main_conn->query($websites_query);
    
    $final_list = array();

    foreach($websites as $website) {
        array_push($final_list, $website);
    }
    // print_r($websites);
    // print_r($final_list);
    echo json_encode($final_list);
}

// READ: Pull Vendors...
if ( isset($_POST['__PULL']) && isset($_POST['__VENDORS']) ) 
{
    $data = clean_txt($_POST['__QUERY']);
    $vendors_query = "SELECT `ID` FROM `_VENDORS` WHERE `ID` LIKE '%$data%' LIMIT 3";
    $vendors = $main_conn->query($vendors_query);

    $vendors_list = array();

    foreach($vendors as $vendor) {
        array_push($vendors_list, $vendor);
    }

    echo json_encode($vendors_list);
}

// READ: Pull Account..
if( isset($_POST['__PULL']) && isset($_POST['__ACCOUNT']) ) 
{
    $account_id = clean_txt($_POST['__ACCOUNT_ID']);
    $single_account_query = " SELECT A.`ACCOUNT_ID` AS `ACCOUNT_ID`, A.`SITE_CODE` AS `SITE_CODE`, A.`ACCOUNT_NICK` AS `ACCOUNT_NICK`, 
                              A.`ACCOUNT_PASS` AS `ACCOUNT_PASS`, A.`VENDOR_ID` AS `VENDOR_ID`, A.`PRICE_PAID` AS `PRICE_PAID`, 
                              A.`WARRANTY_BEGINS` AS `WARRANTY_BEGINS`, A.`WARRANTY_ENDS` AS `WARRANTY_ENDS`, A.`N_AVAILABLE` AS `N_AVAILABLE`, 
                              A.`N_SOLD` AS `N_SOLD`, W.`SITE_URL` AS `SITE_URL` 
                              FROM `_ACCOUNTS` AS A 
                              INNER JOIN `_WEBSITES` AS W
                              ON A.`SITE_CODE` = W.`SITE_CODE`
                              WHERE `ACCOUNT_ID` = '$account_id'";
    $results = $main_conn->query($single_account_query);
    $account = $results->fetch_assoc();
    echo json_encode($account);
}

// READ: Pull A Killed Account..
if( isset($_POST['__PULL']) && isset($_POST['__KILLED_ACCOUNT']) ) {
    $account_id = clean_txt($_POST['__ACCOUNT_ID']);
    $killed_account_query = "SELECT A.`ACCOUNT_ID` AS `ACCOUNT_ID`, A.`SITE_CODE` AS `SITE_CODE`, A.`ACCOUNT_NICK` AS `ACCOUNT_NICK`, 
                             A.`ACCOUNT_PASS` AS `ACCOUNT_PASS`, A.`VENDOR_ID` AS `VENDOR_ID`, A.`PRICE_PAID` AS `PRICE_PAID`, 
                             A.`WARRANTY_BEGINS` AS `WARRANTY_BEGINS`, A.`WARRANTY_ENDS` AS `WARRANTY_ENDS`, A.`N_AVAILABLE` AS `N_AVAILABLE`, 
                             A.`N_SOLD` AS `N_SOLD`, KA.`MOTIVE` AS `MOTIVE`, KA.`ACTION_DATE` AS 'ACTION_DATE'
                             FROM `_ACCOUNTS` AS A
                             INNER JOIN `_ACCOUNTS_KILLED` AS KA 
                             ON A.`ACCOUNT_ID` = KA.`ACCOUNT_ID` 
                             WHERE A.`ACCOUNT_ID` = '$account_id'";
    $results = $main_conn->query($killed_account_query);
    
    echo json_encode($results->fetch_assoc());
}

// READ: Pull Screens Of Website.
if( isset($_POST['__PULL']) && isset($_POST['__SCREENS']) ) {
    $site_code = clean_txt($_POST['__SITE_CODE']);

    $screens_query = "SELECT `children` FROM `_WEBSITES_CHILDREN` 
                      WHERE `SITE_CODE` = '$site_code'";
    $screens = $main_conn->query($screens_query);
    $screens = $screens->fetch_array();
    $screens = $screens[0];
    
    $screens_arr = explode('/', $screens);
    echo json_encode($screens_arr);
}

// READ: Pull Reclaim.
if( isset($_POST['__PULL']) && isset($_POST['__RECLAIM']) ) {
    $reclaim_id = clean_txt($_POST['__ID']);
    
    $reclaim_query = "SELECT R.`RECLAIM_ID` AS `RECLAIM_ID`, R.`USER_EMAIL` AS `USER_EMAIL`, R.`ACCOUNT_ID` AS `ACCOUNT_ID`,
                      R.`ORDER_ID` AS `ORDER_ID`, R.`DATE` AS `DATE`, R.`STATUS` AS `RECLAIM_STATUS`,
                      A.`ACCOUNT_NICK` AS `NICKNAME`, A.`WARRANTY_BEGINS` AS `ACCOUNT_BOUGHT_DATE`,
                  
                      (CASE
                        WHEN A_K.`ACCOUNT_ID` IS NOT NULL THEN UCASE(A_K.`MOTIVE`)
                        ELSE A.`ACCESS_STATE`
                        END) AS `ACCOUNT_STATUS`
                  
                      FROM _RECLAIMS AS R 
                      INNER JOIN _ACCOUNTS AS A
                      ON R.`ACCOUNT_ID` = A.`ACCOUNT_ID`
                      LEFT OUTER JOIN _ACCOUNTS_KILLED AS A_K
                      ON R.`ACCOUNT_ID` = A_K.`ACCOUNT_ID`
                      WHERE R.`RECLAIM_ID` = '$reclaim_id'
                      ORDER BY R.`RECLAIM_ID` DESC
                      LIMIT 1";

    $results = $main_conn->query($reclaim_query)->fetch_assoc();

    echo json_encode($results);
}


// READ: Pull Messages From A Page With Or Without Category.
if( isset($_POST['__PULL']) && isset($_POST['__MESSAGES_PAGE']) ) {
    $post_per_page = __MESSAGES_PER_PAGE;
    $page = (int) clean_txt($_POST['__MESSAGES_PAGE']);
    $page--;
    $page *= $post_per_page;
    $category = null;

    if ( $_POST['__CATEGORY'] !== '' ) {
        $category = clean_txt($_POST['__CATEGORY']);
    }

    $messages_list_query = ($category) ? "SELECT * FROM _MESSAGES 
                                          WHERE `CATEGORY` = '$category'
                                          LIMIT $page, $post_per_page
                                          ORDER BY `DATE` DESC"
                                        : "SELECT * FROM _MESSAGES
                                           ORDER BY `DATE` DESC
                                           LIMIT $page, $post_per_page";

    $messages_list = $main_conn->query($messages_list_query);
    

    if ( $messages_list ) {
        $messages = array();
        
        foreach($messages_list as $message)
            array_push($messages, $message);
        
        echo json_encode($messages);
    }

    elseif ( !$messages_list ) {
        throw new Exception("Invalid Query Generated");
    }

}


// READ: Pull Total Messages Number With OR Without A Defined Category.
if( isset($_POST['__PULL']) && isset($_POST['__TOTAL_MESSAGES']) && isset($_POST['__CATEGORY']) ) {
    $category = clean_txt($_POST['__CATEGORY']);
    $post_per_page = __MESSAGES_PER_PAGE;

    $total_messages_query = ($category AND $category != 'ALL') 
                            ? "SELECT COUNT(*) AS `TOTAL` FROM _MESSAGES 
                               WHERE `CATEGORY` = '$category'"
                            : "SELECT COUNT(*) AS `TOTAL` FROM _MESSAGES";

    $category_messages_query = ($category AND $category != 'ALL') 
                                ? "SELECT * FROM _MESSAGES 
                                   WHERE `CATEGORY` = '$category' 
                                   ORDER BY `DATE` 
                                   DESC LIMIT " . __MESSAGES_PER_PAGE
                                : "SELECT * FROM _MESSAGES
                                   LIMIT " . __MESSAGES_PER_PAGE;



    $total_messages = $main_conn->query($total_messages_query)->fetch_row()[0];
    $category_messages = $main_conn->query($category_messages_query);

    if ( $total_messages && $category_messages ) {
        $messages = array();
        $messages['TOTAL'] = $total_messages;
        foreach($category_messages as $message) {
            array_push($messages, $message);
        }
        echo json_encode($messages);
    }

}



// UPDATE : 
//
// Update Variable Length Columns..
if( isset($_POST['__PUT']) && isset($_POST['__ACCOUNT']) ) {
    $updated_columns = '';
    $updated_columns_values = '';
    $account_id = clean_txt($_POST['__ACCOUNT_ID']);

    foreach($_POST as $index => $value) 
    {

        if ( $index != '__PUT' && $index != '__ACCOUNT' && $index != '__ACCOUNT_ID' ) 
        {
            if ( $index == '__PRICE' || $index == '__AVAILABLE_ACCOUNTS' ) {
                $updated_columns .= "`$dictionary[$index]` = $value ";
            }
            else {
                $updated_columns .= "`$dictionary[$index]` = '$value' ";
            }
        }
    }

    $update_account_query = "UPDATE `_ACCOUNTS` 
                             SET $updated_columns 
                             WHERE `ACCOUNT_ID` = '$account_id'";

    $results = $main_conn->query($update_account_query);
    print_r($results);
}


// UPDATE: Disabled Account (Kill)..
if( isset($_POST['__PUT']) && isset($_POST['__KILL']) ) { // ACTION SHOULD BE PERFOMED W/ TRANSACTIONS... (!)
    $account_id = clean_txt($_POST['__ACCOUNT_ID']);
    $action_date = date('Y-m-d');
    $killed_account_query = "INSERT INTO `_ACCOUNTS_KILLED` VALUES('$account_id', 'KILLED', '$action_date')";
    $killed_account_results = $main_conn->query($killed_account_query);


    $disabled_account_query = "UPDATE `_ACCOUNTS` SET `ACCESS_STATE` = 0 WHERE `ACCOUNT_ID` = '$account_id'";
    $disabled_account_results = $main_conn->query($disabled_account_query);

    if ( !is_int($killed_account_results) && !is_int($disabled_account_results) ) {
        echo "Account Killed Successfully!";
    }
    else {
        echo "Something went wrong!";
    }
}

// UPDATE: Revive Account (Revive)..
if( isset($_POST['__PUT']) && isset($_POST['__REVIVE_ACCOUNT']) ) {
    $account_id = clean_txt($_POST['__ACCOUNT_REVIVED']);
    $revive_account_query = "UPDATE `_ACCOUNTS` SET `ACCESS_STATE` = 1 WHERE `ACCOUNT_ID` = '$account_id'";
    $results = $main_conn->query($revive_account_query);
    
    if ( $results ) {
        echo "Account Updated Successfully";
        $main_conn->query("DELETE FROM `_ACCOUNTS_KILLED` WHERE `ACCOUNT_ID` = '$account_id'");
    }
    else {
        echo "Error! ";
    }
}

// UPDATE: Solve Reclaim.
if( isset($_POST['__UPDATE']) && isset($_POST['__SOLVE_RECLAIM']) && isset($_POST['__ID']) ) {
    $reclaim_id = clean_txt($_POST['__ID']);
    solveReclaim($reclaim_id);
}

// UPDATE: Define New Website Logo.
if( isset($_POST['__PUT']) && isset($_POST['__WEBSITE_LOGO']) && $_FILES ) {
    $site_code = strtolower(clean_txt($_POST['__SITE_CODE']));

    if ( file_exists("../assets/websites_logos/$site_code.png") )  {
        move_uploaded_file($_FILES['__NEW_LOGO']['tmp_name'], "../assets/websites_logos/$site_code.png");
    } else {
        throw new Exception('Invalid Site Logo Upload.');
    }
}

?>