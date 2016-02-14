<?php

/*
/ AJAX User Sessions Manager (server API)
/ by: www.colxi.info (2013)
/ License: GNU Licensed
/
/ Description:
/ Allows basic AJAX communication betwen client and server, with UTF8 data encoding
/ and JSON encoding (allowing to transfer arrays, and objects)
/ Input should come in the following format 
/		Array(method_to_call, Array(arg1 , arg2 , arg3 , ...) )
/
/		JSON input string example:
/			['login',['admin','1234']]
/		will execute:
/			API->login('admin','1234');
/
/ This script requires a Mysql DB, with at least the folowing table:
/ Table: users
/		id : int, autoincremental	
/		username : char(x)
/		password : char(x)
/		email : char(x)
/		is_admin : bool
/
/ NOTE: NOTHING HAS TO BE ECHOED! Always values should be returned, and the script
/ will encode output, to JSON and UTF8 before ending execution.
*/

// force UTF8 
header('Content-Type: application/x-www-form-urlencoded; charset=utf-8');

include_once("AjaxAPIServerConfig.php");

// block if no POST detected
if(!isset($_POST)) die('Invalid acces attempt: No $_POST Found!');
if(!isset($_POST[API_MSG_VAR])) die('Invalid acces attempt: $_POST encoding unkwnown'); 

// prevent magic quotes effect...
$data = get_magic_quotes_gpc() ? stripslashes($_POST[API_MSG_VAR]) : $_POST[API_MSG_VAR];

// start session
session_start();

// prepare input data (JSON decode)
$data 		= json_decode($data);
$method 	= $data[0];
$argsArray 	= $data[1];

// force $argsArray to be an array
if(!is_array($argsArray)) {
	$tmp = $argsArray;
	unset($argsArray);
	$argsArray = Array();
	$argsArray[0] = $tmp;
	unset($tmp);
}

// attach expansion methods
include_once("AjaxAPIServerPublicMethods.php");
$AjaxAPI = new AjaxAPI();

// process query
$response = call_user_func_array(array($AjaxAPI, $method), $argsArray);

// return API response properly encoded
echo utf8_encode(json_encode($response));

// end execution 
die();
?>