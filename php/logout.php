<?php
require_once(dirname(__FILE__) . '/resources.php');

session_start();

session_unset();

session_destroy();

header('Location: ' . $_ENV['ROOT_DIR'] . '/login');

?>