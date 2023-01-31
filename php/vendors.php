<?php
include './resources.php';
include './_general.php';
$actual_website = "vendors";

$vendors_query = "SELECT `V`.`ID`, IFNULL(`A`.`TOTAL_ACCOUNTS`, 0) AS `TOTAL_ACCOUNTS`
                  FROM `_VENDORS` AS `V`
                  LEFT OUTER JOIN (SELECT `VENDOR_ID`, COUNT(*) AS `TOTAL_ACCOUNTS` 
                                   FROM `_ACCOUNTS`
                                   GROUP BY `VENDOR_ID`) AS `A`
                  ON `V`.`ID` = `A`.`VENDOR_ID`";

$vendors = $main_conn->query($vendors_query);


$vendor_mfamous_query = "SELECT `V`.`ID` AS `ID`
                         FROM `_VENDORS` AS `V`
                         JOIN ( SELECT COUNT(*) AS `TOTAL_ACCOUNTS`, `VENDOR_ID`
                                FROM _ACCOUNTS
                                GROUP BY `VENDOR_ID`
                                ORDER BY `TOTAL_ACCOUNTS` DESC
                                LIMIT 1 ) AS `A`
                         ON `V`.`ID` = `A`.`VENDOR_ID`
                         LIMIT 1";

$vendor_mfamous = $main_conn->query($vendor_mfamous_query);
$most_famous_vendor = $vendor_mfamous->fetch_assoc()['ID'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/main.js" defer="defer" type="module"></script>
    <title>Vendors</title>
</head>
<body>
    
    <?php include_once('./header.php'); ?>

    <main class="content">

        <article class="card card-data card-data-emphasized">
            <h2 class="card-heading">VENDORS DATA:</h2>
            <section class="fact">
                <h2 class="subtitle">TOTAL VENDORS</h2>
                <span class="total-vendors number">3</span>
            </section>
            <section class="fact">
                <h2 class="subtitle">TOTAL ACCOUNTS</h2>
                <span class="total-accounts number number-important"><?php printTotalAccounts($main_conn); ?></span>
            </section>
            <section class="fact">
                <h2 class="subtitle">MOST POPULAR:</h2>
                <a href="#" class="vendor-link">
                    <figure class="vendor__avatar" style="background-image: url('../assets/vendors/<?php echo $most_famous_vendor; ?>.png');"></figure>
                    <span class="vendor__label">@<?php echo $most_famous_vendor; ?></span>
                </a>
            </section>
        </article>

        <article class="card card-vendors-listing">

            <h2 class="card-heading">VENDORS</h2>
            <div class="toolbars">
            <div class="toolbar text-input" id="Vendor-Input">
                        <p class="at-icon">@</p>
                        <input type="text" placeholder="VENDOR ID">
                    </div>
            </div>
            <section class="content">

            <?php                   ?>

            <?php foreach($vendors as $vendor): ?>

                <div class="vendor-row" data-display="@<?php echo $vendor['ID']; ?>">
                    <figure class="vendor__picture">
                        <img src="../assets/vendors/<?php echo $vendor['ID']; ?>.png" alt="<?php echo $vendor['ID']; ?> AVATAR" draggable="false">
                    </figure>
                    <h2 class="vendor__name">@<?php echo $vendor['ID']; ?></h2>
                    <small class="vendor__accounts"><?php echo $vendor['TOTAL_ACCOUNTS'] . ' ACCOUNTS'; ?></small>
                </div>

            <?php endforeach; ?>

            <?php             ?>
            </section>  
        </article>

        
    </main>

    <button class="button-secondary floating add-vendor">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.5 12.5H12.5V21.5H9.5V12.5H0.5V9.5H9.5V0.5H12.5V9.5H21.5V12.5Z"/>
        </svg>
    </button>
    

    <div id="New-Vendor-Modal" class="new-vendor-modal modal">
        <figure class="vendor__avatar">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5 12.5H12.5V21.5H9.5V12.5H0.5V9.5H9.5V0.5H12.5V9.5H21.5V12.5Z"/>
            </svg>
            <img src="" class="image" style="display: none;" draggable="false">
        </figure>

        <input type="text" name="ID" class="LL" placeholder="@VENDOR" autocomplete="off">

        <div class="toolbar url-input top">
            <input type="text" name="Link Input" placeholder="sample.com" autocomplete="off">
        </div>

        <input type="text" name="Email" class="LL" placeholder="EMAIL" autocomplete="off">

        <button class="button button-primary buttom-medium submit">ADD</button>

        <form class="no-display">
            <input type="file" name="Avatar" multiple="false" accept="image/png" autocomplete="off">
        </form>
    </div>
    <div class="overlay"></div>


    <div id="Vendor-Modal" class="vendor-modal modal">
        <section class="left-face">
            <figure class="avatar">
                <img src="../assets/vendors/self.png" alt="Vendor Avatar">
            </figure>

            <span class="vendor-label">@SELF</span>

            <span class="accounts-label">1 ACCOUNTS</span>

        </section>

        <section class="right-face">
            <div class="row">
                <span class="label">REGISTERED ON:</span>
                <span class="label-info">20/04/20</span>
            </div>
            <div class="row">
                <span class="label">EMAIL:</span>
                <span class="label-info email">example@mail.com</span>
            </div>
            <div class="row">
                <span class="label">WEBSITE:</span>
                <!-- <span class="label-info email">example@mail.com</span>-->
                <a href="" class="page-link">GO TO WEBSITE</a>

            </div>

            <div class="row-alt">
                <span class="label">&Uacute;LTIMOS SITIOS:</span>
                <div class="websites">
                    <figure class="websites-mini">
                        <img src="../assets/websites_logos/bang.png">
                    </figure>
                    <figure class="websites-mini">
                        <img src="../assets/websites_logos/test.png">
                    </figure>
                    <figure class="websites-mini">
                        <img src="../assets/websites_logos/testdos.png">
                    </figure>
                </div>
            </div>
        </section>

    </div>
    <div class="overlay"></div>

</body>
</html>