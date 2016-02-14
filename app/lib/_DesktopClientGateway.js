function _RemoteInit(){
	// only affects desktop node-webkit based distributions
	// check process variable existence (node-wekit object, https://github.com/rogerwang/node-webkit/wiki/Get-version-of-node-webkit-in-app)
	if(typeof process === 'undefined') return false;
	// code to be called before GUI.init() is executed
	
}