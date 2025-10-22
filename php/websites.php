<?php
require_once(dirname(__FILE__) . '/resources.php');
require_once(dirname(__FILE__) . '/_general.php');
require_once(dirname(__FILE__) . '/fun/websites.php');

$actual_website = "websites";

// Important for single page data retrivement.. //
$single_website_active = (isset($_GET['website']) ? $_GET['website'] : '' );
$single_website_code = clean_txt($single_website_active);

$single_website_query = "SELECT W.`SITE_CODE` AS `SITE_CODE`, 
                         W.`SITE_TITLE` AS `SITE_TITLE`, 
                         W.`SITE_URL` AS `SITE_URL`, 
                         W.`ORIGINAL_PRICE` AS `ORIGINAL_PRICE`, 
                         W.`OFFER_PRICE` AS `OFFER_PRICE`, 
                         COALESCE(SUB.`TOTAL_ACTIVE_ACCOUNTS`, 0) AS `TOTAL_ACTIVE_ACCOUNTS`,
                         COALESCE(SUB2.`TOTAL_ACCOUNTS`, 0) AS `TOTAL_ACCOUNTS`
                         FROM `$__WEBSITES` AS W 
                         LEFT JOIN ( SELECT COUNT(*) AS `TOTAL_ACTIVE_ACCOUNTS`, `SITE_CODE`
                                      FROM `$__ACCOUNTS` 
                                      WHERE `SITE_CODE` = '$single_website_code' AND `ACCESS_STATE` = 1 ) AS SUB
                         ON W.`SITE_CODE` = SUB.`SITE_CODE`
                         LEFT JOIN ( SELECT COUNT(*) AS `TOTAL_ACCOUNTS`, `SITE_CODE`
                                      FROM `$__ACCOUNTS`
                                      WHERE `SITE_CODE` = '$single_website_code' ) AS SUB2
                         ON W.`SITE_CODE` = SUB2.`SITE_CODE`
                         WHERE W.`SITE_CODE` = '$single_website_code'";

$single_website = ($single_website_code)
                  ? $main_conn->query($single_website_query) 
                  : FALSE;

// Important for listing websites page.. //
$websites_query = " SELECT W.`SITE_CODE` AS `SITE_CODE`, W.`SITE_TITLE` AS `SITE_TITLE`, W.`SITE_URL` AS `SITE_URL`, 
                    COALESCE(QUERY.`TOTAL_ACTIVE_ACCOUNTS`, 0) AS `TOTAL_ACTIVE_ACCOUNTS`,
                    COALESCE(Q.`TOTAL_ACCOUNTS`, 0) AS `TOTAL_ACCOUNTS`
                    FROM `$__WEBSITES` AS W
                    LEFT JOIN ( SELECT `SITE_CODE`, COUNT(`ACCOUNT_ID`) AS `TOTAL_ACCOUNTS` 
                                 FROM `$__ACCOUNTS` AS A
                                 GROUP BY `SITE_CODE` ) AS Q
					ON W.`SITE_CODE` = Q.`SITE_CODE`
                    LEFT JOIN ( SELECT A.`SITE_CODE` AS `SITE_CODE`, COUNT(`ACCOUNT_ID`) AS `TOTAL_ACTIVE_ACCOUNTS`, A.`ACCESS_STATE`
                                 FROM `$__ACCOUNTS` AS A
                                 WHERE A.`ACCESS_STATE` = 1
                                 GROUP BY A.`SITE_CODE` ) AS QUERY
                    ON QUERY.`SITE_CODE` = W.`SITE_CODE`
                    ORDER BY `TOTAL_ACCOUNTS` DESC";

$websites = $main_conn->query($websites_query);

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <base href="<?= $_ENV['PHP_ROOT_DIR'] ?>">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/main.js" defer="defer" type="module"></script>
    <script type="module" src="../js/classes/NewWebsiteModal.js"></script>
    <script type="module" src="../js/classes/NewSubsiteModal.js"></script>
    <script>
        customElements.whenDefined("new-website-modal").then(() => {
            let newWebsiteModalButton = document.querySelector("button.add-website")
            newWebsiteModalButton.addEventListener("click", () => {
                const modal = document.querySelector("new-website-modal")
                modal.open()
            })
        })

        customElements.whenDefined("new-subsite-modal").then(() => {
            let newSubsiteButton = document.querySelector("#Add-Screen")
            newSubsiteButton?.addEventListener("click", () => {
                const subsiteModal = document.querySelector("new-subsite-modal")
                subsiteModal.open()
            })
        })
    </script>
    <title>Websites | Admin</title>
</head>
<body>

    <?php                               ?>

    <?php require_once('./header.php');?>

    <?php                               ?>

    <main class="content">
        <article class="card card-data">
            <h2 class="card-heading">Websites Data</h2>
            <section class="fact">
                <h2 class="subtitle">TOTAL ACCOUNTS REGISTERED:</h2>
                <span class="total-accounts number"><?php printTotalAccounts($main_conn); ?></span>
            </section>
            <section class="fact">
                <h2 class="subtitle">ACTIVE ACCOUNTS:</h2>
                <span class="total-active-accounts number number-important"><?php printTotalActiveAccounts($main_conn); ?></span>
            </section>
            <section class="fact">
                <h2 class="subtitle">ACCOUNTS WITH RECLAIMS:</h2>
                <span class="total-reclaims-accounts number number-err">0</span>
            </section>
            <a href="./php" class="page-link">GO TO RECLAIMS</a>
            <button class="button button-primary button-medium add-website">ADD WEBSITE</button>
        </article>

        <?php                              ?>

        <?php if(!$single_website_active): ?>

        <?php                              ?>

        <article class="card card-main websites-listing" >
            <h2 class="card-heading">Websites Listing</h2>

            <div class="toolbars">
                <div class="toolbar searchbox">
                    <input type="text" name="q" id="" placeholder="SEARCH A WEBSITE...">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.283 10.809H11.5067L11.2316 10.5437C12.1945 9.4235 12.7743 7.9692 12.7743 6.38715C12.7743 2.85948 9.91482 0 6.38715 0C2.85948 0 0 2.85948 0 6.38715C0 9.91482 2.85948 12.7743 6.38715 12.7743C7.9692 12.7743 9.4235 12.1945 10.5437 11.2316L10.809 11.5067V12.283L15.7222 17.1863L17.1863 15.7222L12.283 10.809ZM6.38715 10.809C3.94038 10.809 1.96528 8.83392 1.96528 6.38715C1.96528 3.94038 3.94038 1.96528 6.38715 1.96528C8.83392 1.96528 10.809 3.94038 10.809 6.38715C10.809 8.83392 8.83392 10.809 6.38715 10.809Z"/>
                    </svg> 
                </div>
            </div>

            <section class="content">

                <?php                                           ?>

                <?php foreach($websites as $index => $record) : ?>

                <div class="website-row">
                    <a href="?website=<?php echo $record['SITE_CODE']; ?>">
                        <div class="site-logo">
                            <img src="<?php echo __URL_ROOT . "assets/websites_logos/" . strtolower($record['SITE_CODE']) . '.png'; ?>" alt="<?php echo '"' . $record['SITE_TITLE'] . '"'; ?> LOGO">
                        </div>
                        <div class="site-info">
                            <h4 class="title"><?php echo $record['SITE_TITLE']; ?></h4>
                            <h3 class="code"><?php echo $record['SITE_CODE']; ?></h3>
                            <div class="accounts">
                                <div class="total-accounts">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"-/>
                                    </svg>  
                                    <p class="counter"><?php echo $record['TOTAL_ACCOUNTS']; ?></p>
                                </div>

                                <?php if( $record['TOTAL_ACTIVE_ACCOUNTS'] ): ?>

                                <div class="available-accounts">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                                    </svg>  
                                    <p class="counter"><?php echo $record['TOTAL_ACTIVE_ACCOUNTS']; ?></p>
                                </div>

                                <?php elseif ( !$record['TOTAL_ACTIVE_ACCOUNTS'] ): ?>
                                
                                <div class="available-accounts no-accounts">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                                    </svg>  
                                    <p class="counter">0</p>
                                </div>

                                <?php endif; ?>
                            </div>
                            <small class="url"><?php echo $record['SITE_URL']; ?></small>
                        </div>
                    </a>
                </div>    

                <?php             ?>

                <?php endforeach; ?>

                <?php             ?>

            </section>
        </article>

        <?php                                                    ?>
        
        <?php elseif($single_website_active && $single_website->num_rows): ?>
            
        <?php $single_website = $single_website->fetch_assoc();  ?>

        <?php                                                    ?>

        <article class="card card-main card-website">
            <header class="header">
                <button class="round button-secondary go-back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                    </svg>
                </button>
                <figure class="site-logo">
                    <img src="<?php echo __URL_ROOT . 'assets/websites_logos/' . strtolower($single_website['SITE_CODE']) . '.png'; ?>" alt="Site Logo" draggable="false">
                </figure>
                <div class="options">
                    <button class="button button-secondary button-small" name="Edit Website" disabled="true">EDIT SITE</button>
                    <button class="button button-secondary button-small" name="New Logo">NEW LOGO</button>
                </div>
            </header>

            <section class="site-info">

                <div class="accounts">
                    <div class="total-accounts">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"-/>
                        </svg>  
                        <p class="counter"><?php echo $single_website['TOTAL_ACCOUNTS']; ?></p>
                    </div>

                    <?php if ( $single_website['TOTAL_ACTIVE_ACCOUNTS'] ) : ?>

                    <div class="available-accounts">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                        </svg>  
                        <p class="counter"><?php echo $single_website['TOTAL_ACTIVE_ACCOUNTS']; ?></p>
                    </div>

                    <?php elseif ( !$single_website['TOTAL_ACTIVE_ACCOUNTS'] ) : ?>

                    <div class="available-accounts no-accounts">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                        </svg>  
                        <p class="counter">0</p>
                    </div>

                    <?php endif; ?>

                </div>

                <div class="info-row">
                    <span class="label">SITE'S TITLE:</span>
                    <h2 class="site-title"><?php echo $single_website['SITE_TITLE']; ?></h2>
                </div>
                <div class="info-row">
                    <span class="label">SITE'S CODE:</span>
                    <h2 class="site-code"><?php echo $single_website['SITE_CODE']; ?></h2>
                </div>
                <div class="info-row">
                    <div class="col">
                        <span class="label">ORIGINAL PRICE:</span>
                        <span class="price original-price">$<?php echo $single_website['ORIGINAL_PRICE']; ?><sup>.00</sup> MXN</span>
                    </div>
                    <div class="col">
                        <span class="label">SALE PRICE:</span>
                        <span class="price new-price">$<?php echo $single_website['OFFER_PRICE']; ?><sup>.00</sup> MXN</span>
                    </div>
                    
                    <input style="display: none;" type="file" name="New Logo">
                </div>
                
            </section>

            <section class="site-screens" style="position: relative;">

                <span class="label"><?php echo $single_website['SITE_TITLE']; ?> SCREENS:</span>

                <div class="toolbar searchbox" id="subsite">
                    <input type="text" name="q" id="" placeholder="SEARCH A SUBSITE...">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.283 10.809H11.5067L11.2316 10.5437C12.1945 9.4235 12.7743 7.9692 12.7743 6.38715C12.7743 2.85948 9.91482 0 6.38715 0C2.85948 0 0 2.85948 0 6.38715C0 9.91482 2.85948 12.7743 6.38715 12.7743C7.9692 12.7743 9.4235 12.1945 10.5437 11.2316L10.809 11.5067V12.283L15.7222 17.1863L17.1863 15.7222L12.283 10.809ZM6.38715 10.809C3.94038 10.809 1.96528 8.83392 1.96528 6.38715C1.96528 3.94038 3.94038 1.96528 6.38715 1.96528C8.83392 1.96528 10.809 3.94038 10.809 6.38715C10.809 8.83392 8.83392 10.809 6.38715 10.809Z"/>
                    </svg> 
                </div>

                <div class="screens-wrap" style="left: 0px;" >
                    <button class="add-screen" id="Add-Screen">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 20H4V6H13V4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H18C19.1 22 20 21.1 20 20V11H18V20ZM10.21 16.83L8.25 14.47L5.5 18H16.5L12.96 13.29L10.21 16.83ZM20 4V1H18V4H15C15.01 4.01 15 6 15 6H18V8.99C18.01 9 20 8.99 20 8.99V6H23V4H20Z"/>
                        </svg>
                        <p>ADD SCREEN</p>
                    </button>
                    <div class="screens-strip">

                <?php $screens_collection = getScreensCollection($main_conn, $single_website['SITE_CODE']); ?>

                <?php if ( $screens_collection ) : ?>

                <?php foreach($screens_collection as $index => $screen): ?>

                <?php           ?>    

                <?php if( $index < 8 ): ?>

                    <div class="screen" style="background-image: url('<?php echo __URL_ROOT . 'assets/screens/' . $single_website['SITE_CODE'] . '/' . $screen . '.jpg'; ?>')">
                        <img src="<?php echo __URL_ROOT . "assets/subsites_logos/" . $single_website['SITE_CODE'] . '/' . $screen . '.png'; ?>" alt="<?php echo "'$screen'"; ?> logo" class="subsite-logo" draggable="false">
                        <p class="title"><?php echo $screen; ?></p>
                    </div>

                <?php else: ?>

                    <div class="screen" style="background-image: url('<?php echo '/assets/screens/' . $single_website['SITE_CODE']. '/' . $screen . '.jpg'; ?>')">
                        <p class="title">No screens found for: <?php echo $single_website['SITE_TITLE']; ?></p>
                    </div>

                <?php break; ?>

                <?php endif; ?>

                <?php             ?>

                <?php endforeach; ?>

                <?php elseif ( !$screens_collection ) : ?>

                <?php endif; ?>

                    </div>
                </div>
            </section>

            <ul class="toolbar pagination">
                <?php                                                                         ?>

                <?php $total_pages = getScreensInt($main_conn, $single_website['SITE_CODE']); ?>

                <?php for($i = 1; $i <= $total_pages; $i++ ): ?>

                <?php if ($i == 1): ?>

                    <li class="link link--active"><a href="#"><?php echo $i; ?></a></li>

                <?php else: ?>

                    <li class="link"><a href="#"><?php echo $i; ?></a></li>

                <?php endif; ?>

                <?php endfor; ?>

                <?php        ?>
            </ul>
            
            <div class="link-wrap">
                <a href="./accounts.php?website=<?php echo $single_website['SITE_CODE']; ?>" class="page-link">GO TO ACCOUNTS</a>
            </div>

        </article>

        <?php        ?>

        <?php else: ?>

        <article class="card card-main card-website">

            <header class="header">
                <button class="round button-secondary go-back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                    </svg>
                </button>
                <figure class="site-logo">
                </figure>
                <div class="options">
                    <button class="button button-secondary button-small" name="Edit Website" disabled="true">EDIT SITE</button>
                    <button class="button button-secondary button-small" name="New Logo" disabled="true">NEW LOGO</button>
                </div>
            </header>

            <section class="site-info">

                <div class="accounts">
                    <div class="total-accounts">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"-/>
                        </svg>  
                        <p class="counter">0</p>
                    </div>

                    <div class="available-accounts no-accounts">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                        </svg>  
                        <p class="counter">0</p>
                    </div>

                </div>

                <div class="info-row">
                    <span class="label">SITE'S TITLE:</span>
                    <h2 class="site-title">INVALID WEBSITE</h2>
                </div>
                <div class="info-row">
                    <span class="label">SITE'S CODE:</span>
                    <h2 class="site-code"><?php echo $single_website_active; ?></h2>
                </div>
                <div class="info-row">
                    <div class="col">
                        <span class="label">ORIGINAL PRICE:</span>
                        <span class="price original-price">$0<sup>.00</sup> MXN</span>
                    </div>
                    <div class="col">
                        <span class="label">SALE PRICE:</span>
                        <span class="price new-price">$0<sup>.00</sup> MXN</span>
                    </div>
                    
                    <input style="display: none;" type="file" name="New Logo">
                </div>
                
            </section>            

        </article>

        <?php        ?>      

        <?php endif; ?>

        <?php        ?>                    

    </main>

    <new-website-modal></new-website-modal>

    <?php if( $single_website_active ): ?>

    <?php                               ?>

    <new-subsite-modal sitecode="<?= $single_website_code ?>" />

    <?php endif; ?>

</body>
</html>