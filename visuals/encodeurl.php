<?php
    if (!isset($_GET['url'])) die();
    echo urlencode($_GET['url']);
?>