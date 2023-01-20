<?php
include_once("./_general.php");
include_once("./resources.php");
include_once("./fun/messages.php");

$actual_website = "messages";
// $actual_site = $_GET['website'] ?? false;

$messages_per_page = 1;

$total_pages = round( count_rows_from_table("_MESSAGES") / $messages_per_page );

$messages_list_query = "SELECT DISTINCT `USER_EMAIL`, `MESSAGE_ID`, `MESSAGE`, `CATEGORY`, `DATE` 
                        FROM _MESSAGES 
                        ORDER BY DATE DESC 
                        LIMIT 0, $messages_per_page";


$messages_list = $main_conn->query($messages_list_query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/main.js" defer="defer" type="module"></script>
    <title>MESSAGES</title>
</head>
<body>
    
    <?php include_once('./header.php'); ?>

    <main class="content">

        <article class="card card-data">
            <h2 class="card-heading">MESSAGES DATA:</h2>
            <section class="fact">
                <h2 class="subtitle">TOTAL MESSAGES:</h2>
                <span class="total-messages number"><?php echo get_total_messages() ?></span>
            </section>
            <section class="fact">
                <h2 class="subtitle">UNIQUE EMAILS:</h2>
                <span class="total-unique-emails number number-important"><?php echo get_total_unique_emails() ?></span>
            </section>
            <div class="toolbar month-option">
                <span class="active">THIS MONTH</span>
                <span>3 MONTHS</span>
            </div>
        </article>

        <article class="card card-messages-listing">

            <h2 class="card-heading">DIRECT MESSAGES</h2>
            <div class="toolbars">
                <div class="toolbar text-input">
                    <p class="at-icon">@</p>
                    <input type="text" placeholder="EMAIL ADDRESS">
                </div>
                <div class="selection toolbar">
                    <div class="main-bar">
                        <span class="label">ALL TOPICS</span>
                        <svg width="18" height="10" viewBox="0 0 18 10" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.30912 9.33979C8.69565 9.70916 9.30435 9.70916 9.69088 9.33979L16.7233 2.61952C17.3753 1.99643 16.9343 0.896553 16.0324 0.896553H1.9676C1.06571 0.896553 0.62468 1.99643 1.27672 2.61952L8.30912 9.33979Z"/>
                        </svg>
                    </div>
                    <ul class="options-list" data-display="ALL">
                        <li class="option option--active" data-display="ALL">ALL TOPICS</li>
                        <li class="option" data-display="ACCOUNT">ACCOUNT ISSUES</li>
                        <li class="option" data-display="RECLAIMS">RECLAIMS ISSUES</li>
                        <li class="option" data-display="OTHER">OTHER</li>
                    </ul>
                </div>
            </div>
            <section class="content">

            <?php foreach($messages_list as $message): ?>

                <div class="message-row" data-display="<?php echo $message['MESSAGE_ID'] ?>">
                    <div class="message-info">
                        <h2 class="regard"><?php echo $message['CATEGORY'] . ' ISSUES' ?></h2>
                        <small class="date"><?php echo 'HACE ' . get_date_diff( $message['DATE'] ) . ' DIAS' ?></small>
                        <span class="email"><?php echo $message['USER_EMAIL'] ?></span>
                    </div>
                    <p class="message"><?php echo $message['MESSAGE'] ?></p>
                </div>

            <?php endforeach ?>
                
            </section>  

            <?php if ( $total_pages ) : ?>

            <ul class="toolbar pagination" role="navigation">
                
                <?php for($i = 1; $i <= $total_pages; $i++): ?>

                <?php if ( $i == 1 ): ?>

                    <li class="link link--active"><a href="#"><?php echo $i ?></a></li>

                <?php else: ?>

                    <li class="link"><a href="#"><?php echo $i ?></a></li>

                <?php endif ?>

                <?php endfor ?>

            </ul>

            <?php endif ?>

        </article>

        
    </main>

</body>
</html>