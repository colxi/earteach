<?php
	//
	// config crosssite rules, and  DB acces parameters and 
	// rename this file to AjacAPIServerConfig.php
	//
	 
	/* Allow crossdomain AJAX calls (CORS) */
	header("Access-Control-Allow-Credentials: true");			// allow cookies be send in CORS ajax calls
	$http_origin = $_SERVER['HTTP_ORIGIN'];
    header("Access-Control-Allow-Origin: " . $http_origin);
	//header('Access-Control-Allow-Origin: http://www.earteach.com');

	header('Access-Control-Allow-Methods: GET, POST, OPTION'); 
	header("Access-Control-Allow-Headers: X-Requested-With");

	// DATABASE credentials
	define("_DB", "YourDatabaseNAme");
	define("_DB_USERNAME", "YourDbUsername");
	define("_DB_PASSWORD", "YourDbPassword");
	define("_DB_HOSTNAME", "YourDbHostName");
	
	// POST query variable name $_POST[API_MSG_VAR]
	define("API_MSG_VAR", "api");

	
?>