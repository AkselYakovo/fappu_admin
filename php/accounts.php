<?php
require_once(dirname(__FILE__) . '/resources.php');
require_once(dirname(__FILE__) . '/_general.php');

// # Configuration variables..
// $__ACCOUNTS = "_accounts";
// $__WEBSITES = "_websites";
// $__ACCOUNTS_KILLED = "_accounts_killed";

// const __LEVELS = '../';


// # Important variables for single page accounts page..
$actual_website = "accounts";
$active_site = ( isset($_GET['website']) ) 
               ? clean_txt($_GET['website'])
               : FALSE;


// # Important variables for websites listing page..
$websites_listing_query = "SELECT W.`SITE_CODE` AS `SITE_CODE`, W.`SITE_TITLE` AS `SITE_TITLE`, COALESCE(Q.`TOTAL_ACCOUNTS`, 0) AS `TOTAL_ACCOUNTS`
                           FROM `$__WEBSITES` AS W
                           LEFT OUTER JOIN ( SELECT `SITE_CODE`, COALESCE(COUNT(*), 0) AS `TOTAL_ACCOUNTS`
                                             FROM `$__ACCOUNTS`
                                             GROUP BY 1) Q
                           ON W.`SITE_CODE` = Q.`SITE_CODE`
                           ORDER BY `TOTAL_ACCOUNTS` DESC";

$websites_listing = $main_conn->query($websites_listing_query);


$single_website_query = "SELECT W.`SITE_CODE`, W.`SITE_TITLE`, W.`SITE_URL`, 
                         COUNT(A.`SITE_CODE`) AS `TOTAL_ACCOUNTS`
                         FROM `$__WEBSITES` AS W
                         INNER JOIN `$__ACCOUNTS`  AS A
                         ON W.`SITE_CODE` = A.`SITE_CODE`
                         WHERE A.`SITE_CODE` = '$active_site'";
$single_website_results = $main_conn->query($single_website_query);
$single_website = $single_website_results->fetch_assoc();



$active_accounts_query = "SELECT * FROM `$__ACCOUNTS` WHERE `ACCESS_STATE` = '1' AND `SITE_CODE` = '$active_site'";
$inactive_accounts_query = "SELECT * FROM `$__ACCOUNTS` AS A 
                            INNER JOIN `$__ACCOUNTS_KILLED` AS AK
                            ON A.`ACCOUNT_ID` = AK.`ACCOUNT_ID`
                            WHERE `ACCESS_STATE` = '0'
                            AND `SITE_CODE` = '$active_site'";

// # Special variables used on single website accounts listing.
$single_website_active_accounts = $main_conn->query("SELECT COUNT(*) AS `TOTAL_ACTIVE` FROM `$__ACCOUNTS` WHERE `SITE_CODE` = '$active_site' AND `ACCESS_STATE` = '1'");
$single_website_active_accounts = $single_website_active_accounts->fetch_assoc();
$single_website_active_accounts = $single_website_active_accounts['TOTAL_ACTIVE'];

$single_website_inactive_accounts = $main_conn->query("SELECT COUNT(*) AS `TOTAL_INACTIVE` FROM `$__ACCOUNTS` WHERE `SITE_CODE` = '$active_site' AND `ACCESS_STATE` = '0'");
$single_website_inactive_accounts = $single_website_inactive_accounts->fetch_assoc();
$single_website_inactive_accounts = $single_website_inactive_accounts['TOTAL_INACTIVE'];

// # Final query variables used later..
$active_accounts = $main_conn->query($active_accounts_query);
$inactive_accounts = $main_conn->query($inactive_accounts_query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/main.js" defer="defer" type="module"></script>
    <script type="module" src="../js/classes/NewAccountModal.js"></script>
    <script>
        customElements.whenDefined("new-account-modal").then(() => {
            let newAccountModal = document.querySelector("button#New-Account")
            newAccountModal.addEventListener("click", () => {
                const modal = document.querySelector("new-account-modal")
                modal.open()
            })
        })
    </script>
    <title>Accounts | Admin</title>
</head>
<body>
    
    <?php require_once('./header.php'); ?>

    <main class="content">

    <?php if(!$active_site): ?>

        <article class="card card-websites-accounts-listing">

            <h2 class="card-heading">ACCOUNTS</h2>

            <div class="toolbars">
                <div class="selection toolbar" data-display="DESC">
                    <div class="main-bar">
                        <span class="label">DESCENDING</span>
                        <svg width="18" height="10" viewBox="0 0 18 10" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.30912 9.33979C8.69565 9.70916 9.30435 9.70916 9.69088 9.33979L16.7233 2.61952C17.3753 1.99643 16.9343 0.896553 16.0324 0.896553H1.9676C1.06571 0.896553 0.62468 1.99643 1.27672 2.61952L8.30912 9.33979Z"/>
                        </svg>
                    </div>
                    <ul class="options-list">
                        <li class="option option--active" data-display="DESC">DESCENDING</li>
                        <li class="option" data-display="ASC">ASCENDING</li>
                    </ul>
                </div>
            </div>

            <section class="content">

            <?php foreach($websites_listing as $index => $record): ?>

                <?php // @ Important code to calculate # of accounts registered for each website.
                    // $website = $record['SITE_CODE'];
                    // $each_website_query = "SELECT `$__WEBSITES`.`SITE_CODE`, `$__WEBSITES`.`SITE_TITLE`,
                    //                         COUNT(`$__ACCOUNTS`.`SITE_CODE`) AS `TOTAL_ACCOUNTS` 
                    //                         FROM `$__WEBSITES`
                    //                         INNER JOIN `$__ACCOUNTS` 
                    //                         ON `$__ACCOUNTS`.`SITE_CODE` = `$__WEBSITES`.`SITE_CODE`
                    //                         WHERE `$__ACCOUNTS`.`SITE_CODE` = '$website'";

                    // $each_website_result = $main_conn->query($each_website_query);
                    // $each_website = $each_website_result->fetch_assoc();
                    // print_r($each_website);
                ?>

                <div class="website-accounts-row">
                    <a href="?website=<?php echo $record['SITE_CODE']; ?>">
                        <figure class="site-logo">
                            <img src="<?php echo __URL_ROOT . 'assets/websites_logos/' . strtolower($record['SITE_CODE']) . '.png'; ?>" alt="<?php echo '"' . $record['SITE_TITLE'] . '"'; ?> LOGO" draggable="false">
                        </figure>
                        <h2 class="site-code"><?php echo $record['SITE_CODE']; ?></h2>
                        <small class="site-total-accounts"><?php echo $record['TOTAL_ACCOUNTS']; ?> ACCOUNTS</small>
                    </a>
                </div>

            <?php             ?>

            <?php endforeach; ?>

            <?php             ?>

            </section>
            
        </article>

    <?php                       ?>

    <?php elseif($active_site): ?>

        <article class="card card-website-accounts-listing" id="Accounts-Card">

            <header class="header">
                <button class="close-button button-secondary round">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                        </svg>
                </button>
                <figure class="site-logo">
                    <img src="<?php echo __URL_ROOT . 'assets/websites_logos/' . strtolower($single_website['SITE_CODE']) . '.png'; ?>" alt="<?php echo $single_website['SITE_TITLE']; ?> LOGO" draggable="false">
                </figure>
                <div class="site-info">
                    <h3 class="title"><?php echo $single_website['SITE_TITLE']; ?></h3>
                    <h2 class="code"><?php echo $single_website['SITE_CODE']; ?></h2>
                    <small class="accounts"><?php echo $single_website['TOTAL_ACCOUNTS']; ?> ACCOUNTS</small>
                    <div class="toolbar text-input">
                        <p class="at-icon">@</p>
                        <input type="text" placeholder="VENDOR ID">
                    </div>
                </div>
                <div class="option-wrap">
                    <div class="link-wrapper">
                        <a href="./websites.php?website=<?php echo $single_website['SITE_CODE']; ?>" class="page-link">EDIT WEBSITE</a>
                    </div>
                </div>
            </header>

            <nav class="navigation">
                <p class="active" data-role="active-accounts" >ACTIVE ACCOUNTS(<?php echo $single_website_active_accounts; ?>)</p>
                <p class="" data-role="inactive-accounts" >INACTIVE ACCOUNTS(<?php echo $single_website_inactive_accounts; ?>)</p>
            </nav>

            <section class="content active-accounts">

                <div class="active-accounts-listing">

                <?php if($active_accounts->num_rows !== 0): ?>

            
                <?php foreach($active_accounts as $index => $record): ?>

                <?php                                                 ?>

                    <article class="account-row">
                        <button class="button button-secondary edit button-x-small" data-display="<?php echo $record['ACCOUNT_ID']; ?>">EDIT</button>
                        <div class="input-row">
                            <label for="">NICKNAME:</label>
                            <input type="text" value="<?php echo $record['ACCOUNT_NICK'];?>" readonly>
                        </div>
                        <div class="input-row">
                            <label for="">PASS:</label>
                            <input type="text" value="********" readonly>
                        </div>
                        <a href="" class="vendor-link">
                            <figure class="vendor__avatar" style="background-image: url('<?php echo __URL_ROOT . 'assets/vendors/' . strtolower($record['VENDOR_ID']) . '.png'; ?>');"></figure>
                            <span class="vendor__label">@<?php echo $record['VENDOR_ID']; ?></span>
                        </a>
                        <div class="account-offers">
                            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.1335 11.001C15.8835 11.001 16.5435 10.591 16.8835 9.97098L20.4635 3.48098C20.8335 2.82098 20.3535 2.00098 19.5935 2.00098H4.7935L3.8535 0.000976562H0.583496V2.00098H2.5835L6.1835 9.59098L4.8335 12.031C4.1035 13.371 5.0635 15.001 6.5835 15.001H18.5835V13.001H6.5835L7.6835 11.001H15.1335ZM5.7435 4.00098H17.8935L15.1335 9.00098H8.1135L5.7435 4.00098ZM6.5835 16.001C5.4835 16.001 4.5935 16.901 4.5935 18.001C4.5935 19.101 5.4835 20.001 6.5835 20.001C7.6835 20.001 8.5835 19.101 8.5835 18.001C8.5835 16.901 7.6835 16.001 6.5835 16.001ZM16.5835 16.001C15.4835 16.001 14.5935 16.901 14.5935 18.001C14.5935 19.101 15.4835 20.001 16.5835 20.001C17.6835 20.001 18.5835 19.101 18.5835 18.001C18.5835 16.901 17.6835 16.001 16.5835 16.001Z"/>
                            </svg>
                            <div class="offers-number">
                                <span class="remaining-offers"><?php echo $record['N_SOLD'];?></span>
                                <span class="separator">/</span>
                                <span class="total-offers"><?php echo $record['N_AVAILABLE'];?></span>
                            </div>
                        </div>
                        <!-- <small class="expiration-date">EXPIRES IN 20 DAYS</small> -->
                        <small class="expiration-date"><?php echo $record['WARRANTY_BEGINS'];?></small>
                    </article>

                <?php endforeach; ?>

                <?php elseif($active_accounts->num_rows === 0): ?>

                <h2>No records found for &apos;<?php echo $active_site;?>&apos;</h2>
                
                <?php endif; ?>
                    
                </div>


                <div class="inactive-accounts-listing">

                <?php if($inactive_accounts): ?>

                <?php foreach($inactive_accounts as $index => $record): ?>

                <?php                                                 ?>

                    <article class="account-row account-row--inactive">
                        <button class="button button-secondary edit button-x-small" data-display="<?php echo $record['ACCOUNT_ID']; ?>">EDIT</button>
                        <div class="input-row">
                            <label for="">NICKNAME:</label>
                            <input type="text" value="<?php echo $record['ACCOUNT_NICK']; ?>" readonly>
                        </div>
                        <div class="input-row">
                            <label for="">PASS:</label>
                            <input type="text" value="**********" readonly>
                        </div>
                        <a href="" class="vendor-link">
                        <figure class="vendor__avatar" style="background-image: url('<?php echo __URL_ROOT . 'assets/vendors/' . strtolower($record['VENDOR_ID']) . '.png'; ?>');"></figure>
                            <span class="vendor__label">@<?php echo $record['VENDOR_ID']; ?></span>
                        </a>
                        <div class="account-offers">
                            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.1335 11.001C15.8835 11.001 16.5435 10.591 16.8835 9.97098L20.4635 3.48098C20.8335 2.82098 20.3535 2.00098 19.5935 2.00098H4.7935L3.8535 0.000976562H0.583496V2.00098H2.5835L6.1835 9.59098L4.8335 12.031C4.1035 13.371 5.0635 15.001 6.5835 15.001H18.5835V13.001H6.5835L7.6835 11.001H15.1335ZM5.7435 4.00098H17.8935L15.1335 9.00098H8.1135L5.7435 4.00098ZM6.5835 16.001C5.4835 16.001 4.5935 16.901 4.5935 18.001C4.5935 19.101 5.4835 20.001 6.5835 20.001C7.6835 20.001 8.5835 19.101 8.5835 18.001C8.5835 16.901 7.6835 16.001 6.5835 16.001ZM16.5835 16.001C15.4835 16.001 14.5935 16.901 14.5935 18.001C14.5935 19.101 15.4835 20.001 16.5835 20.001C17.6835 20.001 18.5835 19.101 18.5835 18.001C18.5835 16.901 17.6835 16.001 16.5835 16.001Z"/>
                            </svg>
                            <div class="offers-number">
                                <span class="remaining-offers"><?php echo $record['N_SOLD']; ?></span>
                                <span class="separator">/</span>
                                <span class="total-offers"><?php echo $record['N_AVAILABLE']; ?></span>
                            </div>
                        </div>

                        <?php                        ?>

                        <?php switch($record['MOTIVE']) 
                        {
                            case 'KILLED':
                                echo '<small class="status-label badge badge-killed">KILLED</small>';
                                break;
                            default:
                                echo '<small class="status-label badge badge-expired">EXPIRED</small>';
                        }
                        ?>
                            
                    </article>

                <?php             ?>
                
                <?php endforeach; ?>

                <?php elseif(!$inactive_accounts): ?>

                <?php        ?>

                <?php endif; ?>

                </div>

        </section>
    </article>

    <?php endif; ?>

    <?php        ?>

    </main>

    <button class="button-primary floating" id="New-Account">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.5 12.5H12.5V21.5H9.5V12.5H0.5V9.5H9.5V0.5H12.5V9.5H21.5V12.5Z"/>
        </svg>
    </button>

    <?php                    ?>

    <?php if ($active_site) :?>

        <div id="Edit-Account-Modal" class="modal edit-account-modal">
            <nav class="navigation">
                <span class="tab tab--active">STATUS</span>
                <span class="tab">ACCOUNT</span>
                <span class="tab">DETAILS</span>
            </nav>
            <div class="phases">
                <div class="status focused">
                    <div class="row">
                        <span class="label status">STATUS: <span class="badge badge-active">ACTIVE</span> </span>
                        <small class="days-left">EXPIRES IN X DAYS</small>
                    </div>
                    <div class="row">
                        <span class="label">WARRANTY BEGINS:</span>
                        <input type="text" class="LL" autocomplete="off" name="Warranty Begins" readonly>
                    </div>
                    <div class="row">
                        <span class="label">WARRANTY ENDS:</span>
                        <input type="text" class="LL" autocomplete="off" name="Warranty Ends" readonly>
                    </div>
                </div>
                <div class="account">
                    <div class="row">
                        <span class="label">ACCOUNT CREDENTIALS:</span>
                        <input type="text" class="credential-input" name="Nickname" autocomplete="off" readonly>
                        <input type="text" class="credential-input" name="Password" autocomplete="off" readonly>
                    </div>
                    <div class="row">
                        <span class="label">BELONGS TO:</span>
                        <h4 class="site-code">BANG</h4>
                    </div>
                </div>
                <div class="details">
                    <div class="row">
                        <span class="label">PRICE PAID:</span>
                        <div class="toolbar price-input">
                            <input type="text" name="Price Paid" autocomplete="off" readonly>
                            <div class="underline"></div>
                        </div>
                    </div>
                    <div class="row">
                        <span class="label">OFFERS NUMBER:</span>
                        <div class="toolbar offer-input edit">
                            <button class="button-primary round minus" disabled>
                                <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 6V8H8V6H0ZM15 13H13V2.38L10 3.4V1.7L14.7 0H15V13Z"/>
                                </svg>
                            </button>
                            <span class="label sold-accounts">0</span>
                            <span class="label slash">/</span>
                            <span class="label total-accounts">0</span>
                            <button class="button-primary round plus" disabled>
                                <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 2H4V6H0V8H4V12H6V8H10V6H6V2ZM16 13H14V2.38L11 3.4V1.7L15.7 0H16V13Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="row">
                        <span class="label">VENDOR:</span>
                        <a href="" class="vendor-link">
                            <figure class="vendor__avatar"></figure>
                            <span class="vendor__label">@undefined</span>
                        </a>
                    </div>
                </div>
            </div>

            <div class="buttons">
                        <button class="button button-secondary button-small kill-button">KILL</button>
                        <button class="button button-primary button-small save-button" value="" autocomplete="off" disabled>SAVE</button>
            </div>
            
            <small class="account-id" >
                <b>ACCOUNT ID:</b>
                <span></span>
            </small>

            <figure class="status-bar"></figure>
        </div>
        <div class="overlay"></div>

        <div id="Inactive-Account-Modal" class="modal inactive-account-modal">
            <div class="content">
                <div class="separator">
                    <figure class="line"></figure>
                    <span class="label" draggable="false">STATUS</span>
                    <figure class="line"></figure>
                </div>
                <div class="row">
                    <span class="label status">STATUS: <span class="badge badge-killed">KILLED</span> </span>
                    <small class="expiration">KILLED X DAYS AGO</small>
                    <span class="label">WARRANTY BEGINS:</span>
                    <input type="text" class="LL" autocomplete="off" name="Warranty Begins" disabled>
                    <span class="label">WARRANTY ENDS:</span>
                    <input type="text" class="LL" autocomplete="off" name="Warranty Ends" disabled>
                </div>
                <div class="separator">
                    <figure class="line"></figure>
                    <span class="label" draggable="false">ACCOUNT:</span>
                    <figure class="line"></figure>
                </div>
                <div class="row straight">
                    <span class="label">BELONGS TO:</span>
                    <h4 class="site-code">BANG</h4>
                </div>
                <div class="row">
                    <span class="label">CREDENTIALS:</span>
                    <input type="text" class="LL" autocomplete="off" name="Nickname" disabled>
                    <input type="text" class="LL" autocomplete="off" name="Password" disabled>
                </div>
                <div class="separator">
                    <figure class="line"></figure>
                    <span class="label" draggable="false">DETAILS:</span>
                    <figure class="line"></figure>
                </div>
                <div class="row">
                    <span class="label">ACCOUNT'S OFFERS:</span>
                    <div class="account-offers">
                        <svg width="28" height="27" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.1335 11.001C15.8835 11.001 16.5435 10.591 16.8835 9.97098L20.4635 3.48098C20.8335 2.82098 20.3535 2.00098 19.5935 2.00098H4.7935L3.8535 0.000976562H0.583496V2.00098H2.5835L6.1835 9.59098L4.8335 12.031C4.1035 13.371 5.0635 15.001 6.5835 15.001H18.5835V13.001H6.5835L7.6835 11.001H15.1335ZM5.7435 4.00098H17.8935L15.1335 9.00098H8.1135L5.7435 4.00098ZM6.5835 16.001C5.4835 16.001 4.5935 16.901 4.5935 18.001C4.5935 19.101 5.4835 20.001 6.5835 20.001C7.6835 20.001 8.5835 19.101 8.5835 18.001C8.5835 16.901 7.6835 16.001 6.5835 16.001ZM16.5835 16.001C15.4835 16.001 14.5935 16.901 14.5935 18.001C14.5935 19.101 15.4835 20.001 16.5835 20.001C17.6835 20.001 18.5835 19.101 18.5835 18.001C18.5835 16.901 17.6835 16.001 16.5835 16.001Z"/>
                        </svg>
                        <div class="offers-number">
                            <span class="remaining-offers">0</span>
                            <span class="separator">/</span>
                            <span class="total-offers">0</span>
                        </div>
                    </div>
                </div>
                <div class="row straight">
                    <span class="label">VENDOR:</span>
                    <a href="" class="vendor-link">
                        <figure class="vendor__avatar" style="background-image: url('../assets/vendors/self.png');"></figure>
                        <span class="vendor__label">@SELF</span>
                    </a>
                </div>
                
                <div class="row straight">
                    <span class="label">PAID PRICE:</span>
                    <span class="text price-paid">$ 00<sup>.00</sup> MXN</span>
                </div>
            </div>

            <button class="button button-secondary button-small reactivate-button">REACTIVATE</button>
            
            <small class="account-label">
                ACCOUNT ID:
                <b>2103X-SDSD</b>
            </small>
        </div>
        <div class="overlay"></div>

    <?php endif; ?>

    <?php        ?>

    <div id="New-Account-Modal" class="modal new-account-modal">

        <ul class="selector-phase">
            <li class="phase focus" data-value="1"></li>
            <li class="phase" data-value="2"></li>
            <li class="phase" data-value="3"></li>
            <li class="phase" data-value="4"></li>
            <li class="phase" data-value="5"></li>
            <li class="phase" data-value="6"></li>
        </ul>

        <div class="phases">

            <div class="first focused">
                <span class="label">ACCOUNT BELONGS TO:</span>
                <div class="selection toolbar" data-display="" id="Site-Selection">
                    <div class="main-bar">
                        <span class="label">WEBSITES</span>
                        <svg width="18" height="10" viewBox="0 0 18 10" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.30912 9.33979C8.69565 9.70916 9.30435 9.70916 9.69088 9.33979L16.7233 2.61952C17.3753 1.99643 16.9343 0.896553 16.0324 0.896553H1.9676C1.06571 0.896553 0.62468 1.99643 1.27672 2.61952L8.30912 9.33979Z"/>
                        </svg>
                    </div>
                    <ul class="options-list"></ul>
                </div>
            </div>

            <div class="second">
                <span class="label">ACCOUNT DATA:</span>
                <input type="text" placeholder="NICKNAME" class="LL" name="??NICK" autocomplete="off">
                <input type="text" placeholder="PASSWORD" class="LL" name="??PASS" autocomplete="off">
            </div>

            <div class="third">
                <span class="label">PRICE PAID:</span>
                <div class="toolbar price-input">
                    <input type="text" placeholder="$99.00 MXN" name="Price Input" autocomplete="off">
                    <div class="underline"></div>
                </div>
            </div>

            <div class="fourth">
                <span class="label">OFFERS NUMBER:</span>
                <div class="toolbar offer-input">
                    <button class="button-primary round" disabled name="minus">
                        <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 6V8H8V6H0ZM15 13H13V2.38L10 3.4V1.7L14.7 0H15V13Z"/>
                        </svg>
                    </button>
                    <span class="counter">1</span>
                    <button class="button-primary round" name="add">
                        <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 2H4V6H0V8H4V12H6V8H10V6H6V2ZM16 13H14V2.38L11 3.4V1.7L15.7 0H16V13Z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="fifth">
                <span class="label">SELECT VENDOR:</span>
                <div class="toolbar vendor-input" data-display="">
                    <div class="main-bar">
                        <figure class="vendor__avatar">
                            <img src="" alt="" draggable="false">
                        </figure>
                        <input type="text" class="vendor__input" value="" placeholder="@VENDOR" autocomplete="off" name="Vendor Input">
                    </div>
                    <ul class="options-list"></ul>
                </div>
            </div>

            <div class="sixth">
                <span class="label">WARRANTY BEGINS:</span>
                <input type="text" class="LL" value="" placeholder="YYYY-MM-DD" autocomplete="off" name="Warranty Begins">
                <span class="label">WARRANTY ENDS:</span>
                <input type="text" class="LL" value="" placeholder="YYYY-MM-DD" autocomplete="off" name="Warranty Ends">
            </div>
            
        </div>
        
        <div class="buttons">
            <button class="button button-secondary button-medium previous-button" disabled>PREVIOUS</button>
            <button class="button button-secondary button-medium next-button" >NEXT</button>
        </div>

        <form name="new_acc" class="no-display" enctype="">
            <label for="" class="label">SELECT A WEBSITE:</label>
            <input type="text" name="A__SITE" readonly>
            <input type="text" name="A__NICK" readonly>
            <input type="text" name="A__PASS" readonly>
            <input type="text" name="A__PRICE" readonly>
            <input type="number" name="A__OFFERS" readonly value="1">
            <input type="text" name="A__VENDOR" readonly>
            <input type="text" name="A__WARRANTY_BEGINS" readonly>
            <input type="text" name="A__WARRANTY_ENDS" readonly>
        </form>
    </div>
    <div class="overlay"></div>

    <div class="alerts-hub"></div>

</body>
</html>