<?php
// UMS User (& Session) Management System extension for AjaxAPI


// ALLOWED METHODS FOR UNLOGUED USERS, ARRAY DEFINITION
// This filter allows to block acces to API to unlogued users (add into array other public methods if necessary)
$allowed_methods_for_unlogued_users = array(
	'login',
	'logout',
	'createAccount',
	'userExist',
	'sessionData',
	'serverVersion',
	'keepAlive'
);
if(!isset($_SESSION['uID']) && !in_array($method,$allowed_methods_for_unlogued_users)) die('LOGIN FIRST!');

class UMS{
	
	public function keepAlive(){ 
		/*
		/ Regular call to this function, prevents PHP session be closed
		*/
		return true; 
	}
	
	public function serverVersion(){ 
		return "1.0";
	}
	
	protected function connect(){
		/*
		/ Database connection 
		*/
		
		if (!($DB_Link = mysql_connect(_DB_HOSTNAME,_DB_USERNAME,_DB_PASSWORD))) die("Can't connect with DB");
		if (!mysql_select_db(_DB,$DB_Link)) die("Can't Select DB");
		
		// force UTF8
		mysql_set_charset('utf8',$DB_Link);
		
		// !done!
		return $DB_Link;
	}

	public function login($user,$pass){
		/* 
		/ Login basic method.
		/ Db search in 'users' table, where username and pass are stored in 'username' and 'password' fields
		/ and password is stored using md5 encryption.
		/ Also checks the field 'is_admin' to stablish SESSION admin identifier
		/ If suceed return uID, if fails return -1
		*/
		$DB_Link	= $this->connect();
		
		// sanitize input
		if($user == '' || $pass == '') return -1;
		$user 	= mysql_real_escape_string($user);
		$pass 	= mysql_real_escape_string($pass);
		
		// encrypt password for correct comaparsion
		$pass	= md5($pass);
		
		// connect to DB and search for coincidences
		$login_query= "SELECT * FROM users WHERE username = '{$user}' AND password = '{$pass}'";
		$result 	= mysql_query($login_query,$DB_Link);
		
		// if no results return -1
		if(mysql_num_rows($result) == 0) return -1;
		
		// else init session and return user ID
		$row = mysql_fetch_assoc($result);
		$_SESSION['uID'] 		= $row['id'];
		$_SESSION['is_admin'] 	= $row['is_admin'];
		
		return $_SESSION['uID'];
	}
	
	public function logout(){
		/*
		/ destroy session (method to force Chrome destroying session)
		*/
		
		session_unset();
		session_destroy();
		session_write_close();
		setcookie(session_name(),'',0,'/');
		session_regenerate_id(true);
		
		return true;
	}
		
	public function sessionData(){
		/*
		/
		*/
		
		if(!isset($_SESSION['uID'])){
			return -1;
		}else{
			return array("uID" => $_SESSION['uID'], "is_admin" => $_SESSION['is_admin']);
		}
		
	}
	
	public function createAccount($username,$password,$email){
		/*
		/ Creates a new account. 
		/ Arguments:
		/	$username 	: string with only alphanumeric chars
		/	$password	: string with any type of character
		/	$email		: valid email string
		/ Returns -1 if error, or user ID if succes
		*/

		$DB_Link	= $this->connect();
		
		// sanitize input
		if($username == '' || $password == '' || $email == '') return -1;
		$username 	= mysql_real_escape_string($username);
		$password 	= mysql_real_escape_string($password);
		$email 		= mysql_real_escape_string($email);
		
		// username string is alphanumeric ?
		if(!ctype_alnum($username)) return -1;
		
		// validate email string
		if(!preg_match('|^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]{2,})+$|i', $email)) return -1;

		// encrypt password
		$password	= md5($password);
		
		// connect to DB and search for coincidences
		$login_query= "INSERT INTO users (username,password,email) VALUES('{$username}','{$password}','{$email}')";
		$result 	= mysql_query($login_query,$DB_Link);
		
		// if failed inserting new entry in DB return error
		if($result == false) return -1;
		
		// done! return inserted ID;
		return mysql_insert_id();
	}
	
	public function userExist($username){
		/*
		/ Check if username already exists
		/ Return : true | false;
		*/
		
		$DB_Link	= $this->connect();
		
		// sanitize input
		if($username == '') return -1;
		$username 	= mysql_real_escape_string($username);
		
		// do the query
		$login_query= "SELECT * FROM users WHERE username = '{$username}'";
		$result 	= mysql_query($login_query,$DB_Link);
		
		// if no results return false (user doesn't exist!)
		if(mysql_num_rows($result) == 0) return false;
		
		// user exists!
		return true;
	}
	
	public function listUsers(){
		/*
		/ Return an array with all users
		*/
		
		if($_SESSION['is_admin'] == false) return -1;
		
		$DB_Link= $this->connect();
		
		// Do the query...
		$login_query = "SELECT * FROM users";
		$result = mysql_query($login_query,$DB_Link);
		
		// if no results return -1
		if(mysql_num_rows($result) == 0) return -1;
		
		// else pack in array, all results
		while($row = mysql_fetch_assoc($result)){
			$users[] = $row;
			unset($users[count($users) - 1]['password']);
		}
		return $users;		
	}
}
	
?>