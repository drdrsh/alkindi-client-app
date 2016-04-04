<?php
define('API_URL', 'http://api.alfehrest.org/alkindi/');

function do_fallback() {
    $content = file_get_contents('index.html');
    $content = str_replace('%T%', '', $content);
    $content = str_replace('%U%', '', $content);
    $content = str_replace('%D%', '', $content);
    echo $content;
    die;
}
function get_url($entityId, $language)
{
    $allowedTypes = array('work', 'authority');
    $allowedLanguages = array('ar');

    list($entityType, $id) = explode('_', $entityId);
    $validType = in_array($entityType, $allowedTypes);
    $validLanguage = in_array($language, $allowedLanguages);
    $validId = strlen($id) == 13;
    if (!$validType || !$validId) {
        http_response_code(404);
        do_fallback();
    }
    $fieldName = $entityType=='work'?'title':'name';
    $url = API_URL . "{$entityType}/{$entityId}/?fields=$fieldName";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_ENCODING, "");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        "Content-language: $language"
    ));
    $content = curl_exec($ch);
    $response = curl_getinfo($ch);
    curl_close($ch);

    if($response['http_code'] != 200) {
        http_response_code($response['http_code']);
        do_fallback();
    }

    $data = json_decode($content, true);

    $htmlResponse = file_get_contents('index.html');

    $htmlResponse = str_replace('%T%', ' - ' . $data[$fieldName], $htmlResponse);
    $htmlResponse = str_replace('%U%', "?id=$entityId&lang=$language", $htmlResponse);
    $htmlResponse = str_replace('%D%', ' - ' .$data[$fieldName], $htmlResponse);

    return $htmlResponse;
}

if(!isset($_GET['lang'])) {
    $_GET['lang'] = 'ar';
}


if(!isset($_GET['id'])) {
    do_fallback();
} else {
    echo get_url($_GET['id'], $_GET['lang']);
}