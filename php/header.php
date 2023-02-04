<?php 
    $inactives = array(
        'STATISTICS' => true,
        'OTHER' => true
    );
?>

<header id="header">
    <h1 class="site-title">FAPPU</h1>
    <h2 class="current-site"><?php echo $actual_website; ?></h2>
    <div class="menu" id="header_menu">
    <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0L5 5L10 0H0Z" fill="#838384"/>
    </svg>
    <ul class="pop-over">
    <?php
        foreach(__LINKS as $link) {

            if ( $link == $actual_website ) 
            {
                echo "<li class='nav-item nav-item--active'><a href='./$link.php'>$link</a></li>";
            }
            else if ( array_key_exists( strtoupper($link), $inactives ) ) 
            {
                echo "<li class='nav-item nav-item--disabled'><a href='#'>$link</a></li>";
            }
            else 
            {
                echo "<li class='nav-item'><a href='./$link.php'>$link</a></li>";
            }

        }
    ?>
    </ul>
    </div>
</header>