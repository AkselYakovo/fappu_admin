<?php
require_once"./resources.php";

$actual_website = "sales";
$actual_site = $_GET['website'] ?? false;

$sales_listing_query = "SELECT S.`SALE_ID` AS `SALE_ID`, S.`USER_EMAIL` AS `USER_EMAIL`, S.`SALE_DATE` AS `SALE_DATE`, S.`ACCOUNT_ID` AS `ACCOUNT_ID`,
                        A.`PRICE_PAID` AS `PRICE_PAID`, A.`SITE_CODE` AS `SITE_CODE`,
                        WEB.`SITE_TITLE` AS `SITE_TITLE`
                        FROM _SALES AS S
                        INNER JOIN _ACCOUNTS AS A
                        ON S.`ACCOUNT_ID` = A.`ACCOUNT_ID`
                        INNER JOIN _WEBSITES AS WEB
                        ON WEB.`SITE_CODE` = A.`SITE_CODE`
                        ORDER BY `SALE_DATE` DESC
                        LIMIT 0, 10";

$sales_listing = $main_conn->query($sales_listing_query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/main.js" defer="defer" type="module"></script>
    <title>Sales | Admin</title>
</head>
<body>
    
    <?php include_once('./header.php'); ?>

    <main class="content">

        <article class="card card-main card-sales-listing">

            <h2 class="card-heading">SALES LISTING</h2>
            <section class="content">
                <table id="sales">
                    <thead><tr>
                        <td>ID SALE:</td>
                        <td>BUYER EMAIL:</td>
                        <td>SITE:</td>
                        <td>DATE:</td>
                        <td>PAYMENT:</td>
                    </tr></thead>
                    <tbody>
                    <?php foreach($sales_listing as $sale): ?>

                        <tr class="sale-row">
                            <td class="sale__id"><?php echo $sale['SALE_ID'] ?></td>
                            <td class="sale__email">
                                <?php echo $sale['USER_EMAIL'] ?>
                            </td>
                            <td class="sale__website">
                                <a href="<?php echo "./websites.php?website=" . $sale['SITE_CODE'] ?>" class="page-link"><?php echo $sale['SITE_TITLE'] ?></a>
                            </td>
                            <td class="sale__date"><?php echo $sale['SALE_DATE'] ?></td>
                            <td class="sale__payment">$<?php echo $sale['PRICE_PAID'] ?>.00 MXN</td>
                        </tr>

                    <?php endforeach; ?>
                        
                    </tbody>
                </table>
            </section>  

            <!-- <ul class="toolbar pagination" role="navigation">
                <li class="link link--active"><a href="#">1</a></li>
                <li class="link"><a href="#">2</a></li>
                <li class="link"><a href="#">3</a></li>
                <li class="link"><a href="#">4</a></li>
            </ul> -->

        </article>

        <article class="card card-data card-data-emphasized">
            <h2 class="card-heading">SALES DATA:</h2>
            <section class="fact">
                <h2 class="subtitle">SALES:</h2>
                <span class="total-messages number number-important">3</span>
            </section>
            <section class="fact">
                <h2 class="subtitle">PENDING SALES:</h2>
                <span class="total-unique-emails number number-err">3</span>
            </section>
            <section class="fact">
                <h2 class="subtitle">TOTAL SALES:</h2>
                <span class="total-unique-emails number number-important">3</span>
            </section>
            <div class="toolbar month-option">
                <span class="active">THIS MONTH</span>
                <span>6 MONTHS</span>
                <span>12 MONTHS</span>
            </div>
        </article>
        
    </main>

</body>
</html>