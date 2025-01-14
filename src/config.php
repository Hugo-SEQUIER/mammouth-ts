<?php
header('Content-Type: application/javascript');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// Ces variables peuvent être configurées dans le panneau Hostinger
$config = array(
    'REACT_APP_API_URL' => getenv('REACT_APP_API_URL'),
    'REACT_APP_API_KEY' => getenv('REACT_APP_API_KEY'),
    'REACT_APP_RESPONSE_SECRET_KEY' => getenv('REACT_APP_RESPONSE_SECRET_KEY')
);

echo 'window.ENV = ' . json_encode($config) . ';';
?>