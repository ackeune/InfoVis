<?php
// File Name: proxy.php
    if (!isset($_GET['url'])) die();
    $url = urldecode($_GET['url']);
    $url = preg_replace("/ /","+",$url);

    $url = 'http://' . str_replace('http://', '', $url); // Avoid accessing the file system
    echo file_get_contents($url);
?>