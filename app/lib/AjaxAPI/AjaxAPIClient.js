/*
/ API.js manage AJAX communications betwen server and client. Mesages are transmited in UTF8,
/ and JSON encoded, allowing object transmision (arrays & objects), and encodeURIComponent
/ (allowing to preserve special chars).
/ When server anwser is recieved back, callback function (if provided) is executed.
/ Usage:
/		function loginresult(response){console.log(response)}
/
/ 		API('login',['admin','123'],loginresult)
/
/ 		or...
/		API('login',['admin','123'],function(response){console.log(response)})
/
/		... will send string encoded instruction to API_SERVER url
/		and when response is returned, with "succeed" (for example), loginresult('succeed')
/		will be executed.
*/

/* CONFIGURATION */

var API_ALERT 			= alert;	// default alert() JS function.
var API_SERVER_URL		= '';
var API_MSG_VAR			= "api";	// should match in 
var API_withCredentials = false; 	// allow receiving oookies when CORS (cross origin ajax call) 

/*****************/

var API = function(command,argsArray,callback){		
	/*
	/ Send via AJAX, messages to server, and redirect response to
	/ callback function (if provided)
	/ Input: 
	/	command: (String) Name of the remote function to execute
	/	argsArray: (Array | String) argument(s) to be passed to remote function
	/	callback: (function) argument(s) to be passed to remote function
	*/
	
	// sanitize input
	if(argsArray == null || argsArray == undefined) argsArray = '';
	// convert input in array
	var request = [command,argsArray];
	// convert input array to JSON string
	var request = JSON.stringify(request);
	
	console.log(">> "+request);
	
	// apply encodeURIComponent to preserve special chars in query
	var request = encodeURIComponent(request);
	
	// initialize API connection
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.withCredentials = API_withCredentials;
	xmlhttp.open("POST",API_SERVER_URL,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=utf-8");
	xmlhttp.send(API_MSG_VAR + "=" + request);
	
	xmlhttp.onreadystatechange = function(){
		// catch errors on response
		if (xmlhttp.status == 500 || xmlhttp.status == 404 || xmlhttp.status == 2 || (xmlhttp.status == 0 && xmlhttp.responseText == '')){
			API_ALERT('Communicacion with server failed... Check console for more details');
			throw new Error ('Communicacion with server failed... (xmlhttp.status:'+xmlhttp.status+")");
		}
		if (xmlhttp.readyState==4 && xmlhttp.status==200){		
			
			console.log("<< " + xmlhttp.responseText);

			// try to decode JSON string...
			var response;
			try{
				response = JSON.parse(xmlhttp.responseText)
			}catch(e){
				API_ALERT("Unknown server response. Check Console for more details.")
				throw new Error("Unknown server response: " + xmlhttp.responseText)
			}
							
			// if callback provided, execute it.
			if(callback) callback(response);
		}
	}
}