<?php
// @ Configuration Items Below..
$actual_website = "reclaims";

require_once(dirname(__FILE__) . "/resources.php");
require_once(dirname(__FILE__) . "/_general.php");
require_once(dirname(__FILE__) . "/fun/reclaims.php");

$page = ( isset($_GET['page']) && (int) $_GET['page'] > 0 ) ? (int) abs( (int) $_GET['page']) : 1;
$post_per_page = 10;
$post_index = ($page - 1) * $post_per_page;

$email = ( isset($_GET['email']) && $_GET['email'] !== "" ) ? clean_txt($_GET['email']) : NULL;

$reclaim_list_query = "SELECT R.`RECLAIM_ID` AS `RECLAIM_ID`, R.`USER_EMAIL` AS `USER_EMAIL`, R.`ACCOUNT_ID` AS `ACCOUNT_ID`, 
                       R.`DATE` AS `DATE`, R.`STATUS` AS `STATUS`, A.`SITE_CODE` AS `SITE_CODE`,
                       WEB.`SITE_TITLE` AS `SITE_TITLE`
                       FROM `$__RECLAIMS` AS R 
                       INNER JOIN `$__ACCOUNTS` AS A
                       ON R.`ACCOUNT_ID` = A.`ACCOUNT_ID`
                       INNER JOIN `$__WEBSITES` AS WEB
                       ON A.`SITE_CODE` = WEB.`SITE_CODE`
                       ORDER BY R.`DATE` DESC
                       LIMIT $post_index, $post_per_page";

$reclaim_list_w_email_query = "SELECT R.`RECLAIM_ID` AS `RECLAIM_ID`, R.`USER_EMAIL` AS `USER_EMAIL`, R.`ACCOUNT_ID` AS `ACCOUNT_ID`, 
                       R.`DATE` AS `DATE`, R.`STATUS` AS `STATUS`, A.`SITE_CODE` AS `SITE_CODE`,
                       WEB.`SITE_TITLE` AS `SITE_TITLE`
                       FROM `$__RECLAIMS` AS R 
                       INNER JOIN `$__ACCOUNTS` AS A
                       ON R.`ACCOUNT_ID` = A.`ACCOUNT_ID`
                       INNER JOIN `$__WEBSITES` AS WEB
                       ON A.`SITE_CODE` = WEB.`SITE_CODE`
                       WHERE R.`USER_EMAIL` LIKE '%$email%'
                       ORDER BY R.`DATE` DESC
                       LIMIT $post_index, $post_per_page";

if ( $email )
    $main_conn->query($reclaim_list_w_email_query);
else 
$reclaim_list = $main_conn->query($reclaim_list_query);

$total_number_pages = ( !$email ) ? (int) (get_all_reclaims_number() / $post_per_page) : 0;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/main.js" defer="defer" type="module"></script>
    <title>Reclaims | Admin</title>
</head>
<body>

<?php  include_once('./header.php'); ?>

<main class="content">
    <article class="card card-data card-data-emphasized">
        <h2 class="card-heading">RECLAIMS DATA:</h2>
        <section class="fact">
            <h2 class="subtitle">SOLVED</h2>
            <span class="number number-important"><?php echo get_total_solved_reclaims(RECLAIM_MONTH) ?></span>
        </section>
        <section class="fact">
            <h2 class="subtitle">PENDING</h2>
            <span class="number number-err"><?php echo get_total_unsolved_reclaims(RECLAIM_MONTH) ?></span>
        </section>
        <section class="fact">
            <h2 class="subtitle">TOTAL RECLAIMS:</h2>
            <span class="number"><?php echo get_total_reclaims(RECLAIM_MONTH) ?></span>
        </section>
        <div class="toolbar month-option">
            <span class="active">THIS MONTH</span>
            <span>6 MONTHS</span>
            <span>12 MONTHS</span>
        </div>
    </article>

    <article class="card card-main card-reclaims-records">
        <h2 class="card-heading">RECLAIMS</h2>
        <div class="toolbars">
            <div class="toolbar text-input">
                <p class="at-icon">@</p>
                <input type="text" placeholder="EMAIL" value="<?php echo $email; ?>">
            </div>
        </div>
        <section class="content">

        <?php foreach($reclaim_list as $reclaim): ?>

            <?php if( $reclaim['STATUS'] ): ?>

            <div class="reclaim-row solved" data-display="<?php echo $reclaim['RECLAIM_ID'] ?>">

            <?php else: ?>

            <div class="reclaim-row not-solved" data-display="<?php echo $reclaim['RECLAIM_ID'] ?>">

            <?php endif; ?>

                <div class="reclaim__status"></div>
                <div class="reclaim__email-wrapper">
                    <p class="reclaim__email"><?php echo $reclaim['USER_EMAIL']; ?></p>
                    <span class="overlay"></span>
                </div>
                <a href="<?php echo "./websites.php?website=" . $reclaim['SITE_CODE'] ?>" class="page-link"><?php echo $reclaim['SITE_TITLE']; ?></a>
                <p class="reclaim__date"><?php echo get_date_diff($reclaim['DATE']); ?> DAYS AGO</p>
            </div>

        <?php endforeach; ?>
            
        </section>

        <?php if ( $total_number_pages ): ?>

        <ul role="navigation" class="pagination pagination--dual">

            <?php if ( ($page + 1) > $total_number_pages ): ?>

                <li class="link">
                    <a href="<?php echo $_SERVER['PHP_SELF'] . '?page=' . ($page - 1) ?>">&lt;</a>
                </li>

                <li class="link link--deactivated">
                    <a href="<?php echo $_SERVER['PHP_SELF'] . '?page=' . ($page - 1) ?>">&gt;</a>
                </li>

            <?php elseif ( $page == 1 ): ?> 

                <li class="link link--deactivated">
                    <a href="<?php echo $_SERVER['PHP_SELF'] ?>">&lt;</a>
                </li>

                <li class="link">
                    <a href="<?php echo $_SERVER['PHP_SELF'] . '?page=' . (string) ( $page + 1 ) ?>">&gt;</a>
                </li>

            <?php elseif ( $page >= 2 ): ?> 

                <li class="link">
                    <a href="<?php echo $_SERVER['PHP_SELF'] . '?page=' . (string) ( $page - 1 ) ?>">&lt;</a>
                </li>

                <li class="link">
                    <a href="<?php echo $_SERVER['PHP_SELF'] . '?page=' . (string) ( $page + 1 ) ?>">&gt;</a>
                </li>

            <?php endif; ?>

        </ul>

        <?php endif; ?>

    </article>

</main>

<div id="Reclaim-Modal" class="reclaim-modal modal">
    <section class="information">

        <div class="heading-separator">
            <figure class="underline"></figure>
            <span>RECLAIM</span>
            <figure class="underline"></figure>
        </div>

        <div class="row">
            <span class="label">RECLAIM ID:</span>
            <a href="#" id="reclaim-id">00000-00000</a>
        </div>

        <div class="row">
            <span class="label">SALE ID:</span>
            <a href="#" id="sale-id">000-00000</a>
        </div>

        <div class="row">
            <span class="label">EMAIL:</span>
            <span class="label-info" id="email">...</span>
        </div>

        <div class="row">
            <span class="label">DATE:</span>
            <span class="label-info" id="reclaim-date">00/00/00</span>
        </div>

    </section>

    <section class="information">

        <div class="heading-separator">
            <figure class="underline"></figure>
            <span>ACCOUNT</span>
            <figure class="underline"></figure>
        </div>

        <div class="row">
            <span class="label">ACCOUNT ID:</span>
            <a href="#" id="account-id">X0000-0000</a>
        </div>

        <div class="row">
            <span class="label">NICK:</span>
            <span class="label-info" id="account-nick">...</span>
        </div>

        <div class="row">
            <span class="label">STATUS:</span>
            <span class="badge" id="account-status-badge">UNKNOWN</span>
        </div>

        <small class="detail">BOUGHT 0 DAYS AGO</small>

    </section>

    <div class="options">
        <button class="button button-secondary button-medium resolve" autocomplete="off" disabled>RESOLVE</button>
        <button class="button button-primary button-medium replace" autocomplete="off" data-display="" disabled>REPLACE ACCOUNT</button>
    </div>
</div>
<div class="overlay"></div>

<div id="Replace-Account-Modal" class="replace-account-modal modal">

    <span class="label">NICKNAME:</span>

    <div class="toolbar price-input">
        <input type="text" placeholder="NICKNAME" name="RPLCM Nick" autocomplete="off">
        <figure class="underline"></figure>
    </div>

    <span class="label">PASS:</span>

    <div class="toolbar price-input">
        <input type="text" placeholder="PASS" name="RPLCM Pass" autocomplete="off">
        <figure class="underline"></figure>
    </div>

    <button class="button button-primary submit" autocomplete="off">REPLACE &amp; RESOLVE</button>

</div>
<div class="overlay"></div>

</body>
</html>