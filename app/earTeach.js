/*
	earTeach Copyright 2013 colxi.info
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


var SESSION = {
	uID: '',
	is_admin: false,
	username: '',
	LANG: '',
	onlineMode: false,
	init: function(sessionData){
		this.uID		= sessionData['uID'];
		this.is_admin 	= sessionData['is_admin'];
		this.username 	= '';

		// detect language
		var userLang = navigator.language || navigator.userLanguage;
		if(userLang.toUpperCase() == 'ES') this.LANG = 'ES';
		else this.LANG = 'EN';

		if(this.is_admin) _warningUntranslated = true;
	},
	end: function(){
		this.uID		= '';
		this.is_admin 	= false;
		this.username 	= '';
		this.LANG	 	= '';
	}
}

var CONFIG = {
	piano	: {
		renderNoteName 		: false,
		renderNoteOctave	: false,
		renderBlackNoteName	: false
	}
};

var TRAINERS 	= [];

var GUI = {
	/*
	/ method collection for rendering GUI sections, single objects
	/ used in the application user interface
	*/
	version:"0.1.7 beta",
	init: function(){
		/*
		/	teachEar Initializaion
		*/

		// init API communications
		API_ALERT = GUI.render.errorLayer;
		API_withCredentials = true;
		API_SERVER_URL	= "http://earteach.com/app/lib/AjaxAPI/AjaxAPIServer.php";

		// temporary & early language assignement... (will be replaced after user SESSION loads)
		var userLang = navigator.language || navigator.userLanguage;
		if(userLang.toUpperCase() == 'ES') SESSION.LANG = 'ES';
		else SESSION.LANG = 'EN';

		// Get Brower name and version...
		var tem = navigator.userAgent.match(/version\/([\.\d]+)/i);
		var M = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
		if(M && tem != null) M[2]= tem[1];
		M = M ? [M[1], M[2]] : [navigator.appName, navigator.appVersion,'-?'];
		M[1] = M[1].split('.')[0];
		var _browser = M[0];
		var _version = M[1];
		delete M;
		delete tem;
		// *****************

		var SoundBank 		 = null;
		var SamplesSoundBank = null;

		switch(_browser){
			case "Chrome":
				// validate version.
				if(_version < 25){
					GUI.render.messageScreen(__("Your Browser is not updated.<br/><br/>Please update in order to use EarTeach."),null);
					throw new Error("Unsupported Browser Version");
				}else{
					SoundBank 		 = piano.defaultSoundBank;
					SamplesSoundBank = piano.samplesSoundBank
				}
				break;
			/*
			case "MSIE":
				SoundBank 		 = piano.defaultSoundBankMp3;
				SamplesSoundBank = piano.samplesSoundBankMp3
				break;
			*/
			default:

				//GUI.render.messageScreen(__("Currently EarTeach just runs stable in Chrome browser.<br/><br/><a href='http://www.google.com/chrome'>You can download it here.</a>"),null);
				//throw new Error("Unsupported Browser");
		}

		GUI.render.loader();

		// keep alive session in server side
		setInterval(function(){API('keepAlive')},600000);

		// application initialization!
		piano.loadSoundBank(SoundBank,0,function(){
			// load sounds&samples soundBank
			piano.loadSoundBank(SamplesSoundBank,1,function(){
				// check if user is already logued (open session in server)
				API('sessionData',null,function(sessionData){
					// load and apply dafeult config (TODO : RETRIEVE USER CUSTOM CONFIG)
					piano.renderNoteName = CONFIG.piano.renderNoteName;
					piano.renderNoteOctave = CONFIG.piano.renderNoteOctave;
					piano.renderBlackNoteName = CONFIG.piano.renderBlackNoteName;

					piano.draw('pianorollCont');
					// if not logued, redirect to loguin screen
					if(sessionData == -1) GUI.render.loginScreen();
					else{
						// user already logued! initiate local session
						SESSION.init(sessionData);
						SESSION.onlineMode= true;
						// load trainer definitions, and when done, render main menu
						GUI.behavior.loadTrainers(GUI.render.trainersGrid);
						// done!
						return true;
					}
				});
			});
		});
	},
	render: {
		loader: function(){
			var _htmlCode  	 = 	"<div id='login'>";
			_htmlCode		+= 		"<img src='imgs/title.png'/>";
			_htmlCode		+= 		"<div>";
			_htmlCode		+= 			"<img src='imgs/loader.gif'/>";
			_htmlCode		+= 			"</div>";
			_htmlCode		+= 		"</div>";
			_htmlCode		+= 	"</div>";
			_htmlCode		+= 	"<div class='clear'></div>";

			document.getElementById('appBody').innerHTML = _htmlCode;
			return true;
		},
		statsScreen: function(presetId){
			// prevent box capture click event
			if(window.event) event.stopPropagation();

			if(SESSION.onlineMode == false){
				GUI.render.messageScreen(__("Statistics are only available with your personal account."));
				return false;
			}

			// canvas sizes and margins
			var cWidth = 258;
			var cHeight = 182;
			var _w = 175;
			var _h = 140;
			var margin_left = 45;
			var margin_top = 38;

			var canvas = document.getElementById('trainer' + presetId).getElementsByTagName('canvas')[0];
			var _c = canvas.getContext('2d');

			canvas.removeAttribute('hidden');
			canvas.width  = cWidth;
			canvas.height = cHeight;

			// Draw Loading tag...
			_c.fillStyle = "white";
			_c.font = '10px Verdana';
			_c.textAlign = 'center';
			_c.textBaseline = 'bottom';
			_c.fillText(__('Loading...'), cWidth/2, cHeight/2);

			// retrieve Stats JSON object
			API('getPresetStats',presetId,function(stats){
				_c.clearRect(0,0,canvas.width,canvas.height)
				if(stats == -1){
					// Draw No Data tag...
					_c.fillStyle = "grey";
					_c.font = '10px Verdana';
					_c.textAlign = 'center';
					_c.textBaseline = 'bottom';
					_c.fillText('(' + __('No Data') + ')', _w/2 + margin_left, _h/2 + margin_top);
					stats = '';
				}

				// calculate column width
				var colWidth = (stats.length == 1) ? _w : Math.ceil(_w / (stats.length - 1) );
				var _x;
				var _y;
				// draw graph lines SHAPE (no border, filled)
				_c.beginPath();
				_c.moveTo(margin_left,_h);
				for(var i= 0; i < stats.length; i++){
					_y = Math.round( (stats[i].score * (_h-margin_top)) /100 );
					_x = (i * colWidth) + margin_left;
					_c.lineTo(_x , _h -_y);
				}
				_c.lineTo(_x,_h);
				_c.closePath();
				_c.fillStyle="#333333";
				_c.fill();

				// draw graph lines
				_c.beginPath();
				_c.strokeStyle="#111111";
				_c.moveTo(margin_left,_h);
				for(var i= 0; i < stats.length; i++){
					_y = Math.round( (stats[i].score * (_h-margin_top)) /100 );
					_x = (i * colWidth) + margin_left;
					// line
					_c.lineTo(_x , _h -_y);
				}
				_c.stroke();
				_c.closePath();

				// draw circles
				_c.fillStyle="#AAAAAA";
				for(var i= 0; i < stats.length; i++){
					_y = Math.round( (stats[i].score * (_h-margin_top)) /100 )
					_x = (i * colWidth) + margin_left;
					// circle
					_c.beginPath();
					_c.arc(_x  , _h -_y, 3, 0, Math.PI*2, true);
					_c.closePath();
					_c.fill();
				}

				// draw graph axis lines, and values
				_c.fillStyle = "white";
				_c.font = '10px arial';
				_c.textAlign = 'right';
				_c.textBaseline = 'bottom';
				_c.fillText('0%', margin_left -10, 142);
				_c.fillText('50%', margin_left -10, ((_h+margin_top)/2)+7);
				_c.fillText('100%', margin_left -10 , margin_top + 7);

				_c.beginPath();
				_c.strokeStyle="#666666";
				_c.lineWidth = 1;
				_c.moveTo(margin_left,margin_top);
				_c.lineTo(margin_left,_h)
				_c.lineTo(_w + margin_left,_h)
				_c.stroke();
				_c.closePath();
			})

			return true;
		},
		errorLayer: function(msg){
			document.getElementById('error').removeAttribute('hidden');
			document.getElementById('errorBoxMsg').innerHTML = msg;
			return true;
		},
		messageScreen: function(msg,acceptCallback,cancelCallback){
			/*
			/ if acceptCallback === null, any button will be rendered
			*/
			// note: no sound here! (should run in safemode, as far as used as some fancy error notificacions)

			var _htmlCode  	 =	"<div id='message'>";
			_htmlCode 	 	+=		"<img src='imgs/title.png'/>";
			_htmlCode 	 	+= 		"<div id='loginControls'>";
			_htmlCode		+= 			"<div>"+ msg +"</div>";
			_htmlCode		+= 			"<br/><br/>";
			if(acceptCallback != undefined && cancelCallback != undefined){
				_htmlCode 	+=			"<div id='mesageScreen_butContainer'>";
				_htmlCode	+= 				"<div id='cancel_button' onclick='" + cancelCallback + "'></div>";
				_htmlCode	+= 				"<div id='accept_button' onclick='" + acceptCallback + "'></div>";
				_htmlCode	+= 				"<div class='clear'></div>";
				_htmlCode  	+=			"</div>";
			}else if(acceptCallback !== null){
				_htmlCode 	+=			"<div id='mesageScreen_butContainer'>";
				_htmlCode	+= 				"<div id='ok_button' onclick='" + ((acceptCallback == undefined) ?  "GUI.render.loginScreen()" :  acceptCallback)+ "'></div>";
				_htmlCode	+= 				"<div class='clear'></div>";
				_htmlCode  	+=			"</div>";
			}
			_htmlCode		+= 			"<div class='clear'></div>";
			_htmlCode		+= 		"</div>";
			_htmlCode 	 	+=	"</div>";
			_htmlCode 	 	+=	"<div class='clear'></div>";

			document.getElementById('appBody').innerHTML = _htmlCode;
			return true;
		},
		loginScreen: function(){

			if(SESSION.uID != 0){
				GUI.render.trainersGrid();
				return false;
			}

			GUI.behavior.playClickSound();

			var _htmlCode  	 =	"<div id='login'>";
			_htmlCode 	 	+=		"<img src='imgs/title.png'/>";
			_htmlCode 	 	+=		"<div id='loginControls'>";
			_htmlCode 	 	+= 			"<input type='text' autofocus id='login_username' placeholder='username' />";
			_htmlCode		+= 			"<input type='password' id='login_password' placeholder='password' />";
			_htmlCode		+= 			"<div id='accept_button' onclick='GUI.behavior.login()'></div>";
			_htmlCode		+= 			"<div class='clear'></div>";
			_htmlCode		+= 			"<div class='padding10'>";
			_htmlCode		+= 				"<span><a>" + __("Lost your password?") + "</a></span> | ";
			_htmlCode		+= 				"<span><a onclick ='GUI.render.newAccountForm()'>" + __("Create an Account") + "<a/></span> | ";
			_htmlCode		+= 				"<span><a class='orangeSubtitle' onclick ='GUI.behavior.loadDemo()'>" + __("View DEMO") + "<exclamation> (!) </exclamation><a/></span>";
			_htmlCode		+= 			"</div>";
			_htmlCode		+= 			'<div id="FB_LIKE"><iframe src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fwww.earteach.com&amp;send=false&amp;layout=box_count&amp;width=450&amp;show_faces=false&amp;font=arial&amp;colorscheme=light&amp;action=like&amp;height=90&amp;appId=234723416670927" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:75px; height:90px;" allowTransparency="true"></iframe></div>';
			_htmlCode		+= 		"</div>";
			_htmlCode		+= 	"</div>";
			_htmlCode 	 	+=	"<div class='clear'></div>";

			document.getElementById('appBody').innerHTML = _htmlCode;
			return true;
		},
		newAccountForm: function(){
			GUI.behavior.playClickSound();

			var _htmlCode  	 =	"<div id='login'>";
			_htmlCode		+= 		"<br/><br/><br/><div class='titleUnderline'>" + __("New Account") + "</div><br/><br/><br/>";
			_htmlCode 	 	+=		"<div id='loginControls'>";
			_htmlCode 	 	+=			"<div class='floatLeft'>";
			_htmlCode 	 	+= 				"<input type='text' id='username' autofocus class='generic_input' placeholder='username (*)'/><br/>";
			_htmlCode 	 	+= 				"<input type='text' id='email' class='generic_input' placeholder='email'/>";
			_htmlCode 	 	+=			"</div>";
			_htmlCode 	 	+=			"<div>";
			_htmlCode		+= 				"<input type='password' id='password' class='generic_input' placeholder='password' placeholder='password (*)'/><br/>";
			_htmlCode		+= 				"<input type='password' id='password2' class='generic_input' placeholder='password validation' placeholder='password (*)'/>";
			_htmlCode		+= 				"<div class='clear'></div>";
			_htmlCode 	 	+=			"</div>";
			_htmlCode		+= 			"<div class='titleSmallGrey'>" + __("*Allowed characters: Aa-Zz 0-9") + "</div><br/><br/>";
			_htmlCode 	 	+=			"<div id='mesageScreen_butContainer'>";
			_htmlCode		+= 				"<div id='cancel_button' onclick='GUI.render.loginScreen()'></div>";
			_htmlCode		+= 				"<div id='accept_button' onclick='GUI.behavior.newAccount()'></div>";
			_htmlCode		+= 				"<div class='clear'></div>";
			_htmlCode 	 	+=			"</div>";
			_htmlCode		+= 			"<div class='clear'></div>";
			_htmlCode		+= 		"</div>";
			_htmlCode		+= 	"</div>";
			_htmlCode 	 	+=	"<div class='clear'></div>";

			document.getElementById('appBody').innerHTML = _htmlCode;
			return true;
		},
		trainersGrid: function(){
			GUI.behavior.playClickSound();

			var _htmlCode	 = "";
			_htmlCode 		+= "<div id='viewPortScrollable'>";
			_htmlCode 		+= 		"<div id='NavigatorContainerMiddleCol'>";
			if(SESSION.onlineMode == false)
				_htmlCode	+=		 	GUI.objects.customBox(__("Demo Mode"), 'GUI.render.newAccountForm()',__("*Click here and create your own account!"),"redFlowerBoxBackground");
			for (var trainerID in TRAINERS)
				_htmlCode   += 			GUI.objects.trainerBox(trainerID);
			_htmlCode		+= 			"<div class='clear'></div>";
			_htmlCode		+= 		"</div>";
			_htmlCode		+= "</div>";
			_htmlCode	   += 	GUI.objects.sidebar();
			_htmlCode		+= "<div class='clear'></div>";
			document.getElementById('appBody').innerHTML = _htmlCode;

		 	GUI.behavior.makeScroller();

			return true;
		},
		presetsGrid: function(trainerIndex){
			GUI.behavior.playClickSound();

			var _htmlCode	= "";
			_htmlCode 		+= "<div id='viewPortScrollable'>";
			_htmlCode 		+= 		"<div id='NavigatorContainerMiddleCol'>";
				_htmlCode   += 			GUI.objects.longBox(trainerIndex, 'GUI.render.trainersGrid()');
				_htmlCode   += 			GUI.objects.customBox(__("Your presets"),"GUI.render.presetsCustomGrid("+ trainerIndex +")",__("Manage your own presets list"),'greyUserBoxBackground');
			for (var presetID in TRAINERS[trainerIndex].presets)
				_htmlCode   += 			GUI.objects.presetBox(trainerIndex, presetID);
			_htmlCode		+= 			"<div class='clear'></div>";
			_htmlCode		+= 		"</div>";
			_htmlCode		+= "</div>";
			_htmlCode	   += 	GUI.objects.sidebar();
			_htmlCode		+= "<div class='clear'></div>";
			document.getElementById('appBody').innerHTML = _htmlCode;

 			GUI.behavior.makeScroller();

			return true;
		},
		presetsCustomGrid: function(trainerIndex){
			GUI.behavior.playClickSound();

			if(SESSION.onlineMode == false){
				GUI.render.messageScreen(__("Custom Presets are only available with your personal account."));
				return false;
			}

			var _htmlCode	= "";
			_htmlCode 		+= "<div id='viewPortScrollable'>";
			_htmlCode 		+= 		"<div id='NavigatorContainerMiddleCol'>";
				_htmlCode   += 			GUI.objects.longBox(__(TRAINERS[trainerIndex].name)+" : "+ __("Your presets"),'GUI.render.presetsGrid('+trainerIndex+')');
				_htmlCode   += 			GUI.objects.customBox(__("Create a new custom preset"),"GUI.render.presetConstructor("+ trainerIndex +")",'','greenAddNewBoxBackground');
			for (var presetIndex in TRAINERS[trainerIndex].presetsCustom)
				_htmlCode   += 			GUI.objects.presetBox(trainerIndex, presetIndex,true);
			_htmlCode		+= 			"<div class='clear'></div>";
			_htmlCode		+= 		"</div>";
			_htmlCode		+= "</div>";
			_htmlCode	   += 	GUI.objects.sidebar();
			_htmlCode		+= "<div class='clear'></div>";
			document.getElementById('appBody').innerHTML = _htmlCode;

			GUI.behavior.makeScroller();

			return true;
		},
		configGrid: function(){
			GUI.behavior.playClickSound();

			var _htmlCode	 = "";
			_htmlCode 		+= "<div id='viewPortScrollable'>";
			_htmlCode 		+=	 	"<div id='NavigatorContainerMiddleCol'>";
			_htmlCode   	+= 			GUI.objects.titleBox(__("Options"),'GUI.render.trainersGrid()');
			_htmlCode   	+= 			GUI.objects.customBox(__("Logout"),'GUI.behavior.logout()');
			_htmlCode   	+= 			GUI.objects.customBox(__("Reset Stats"),'GUI.render.messageScreen("' + __("You are going to remove ALL your stats. ¿Are you really shure?") + '","GUI.behavior.resetStats()", "GUI.render.configGrid()")');
			_htmlCode   	+= 			GUI.objects.customBox(__("Manage Account"),'GUI.render.errorLayer("' + __('Not implemented yet.') +'")',__("Change Password, update email..."));
			_htmlCode   	+= 			GUI.objects.customBox(__("Preferences"),'GUI.render.errorLayer("' + __('Not implemented yet.') +'")',__("EarTeach configuration"));
			_htmlCode   	+= 			GUI.objects.customBox(__("About EarTeach"),'GUI.render.aboutScreen()',__("Version: ")+GUI.version);
			_htmlCode		+= 			"<div class='clear'></div>";
			_htmlCode		+= 		"</div>";
			_htmlCode		+= "</div>";
			_htmlCode	   	+= 	GUI.objects.sidebar();
			_htmlCode		+= "<div class='clear'></div>";
			document.getElementById('appBody').innerHTML = _htmlCode;

			GUI.behavior.makeScroller();

			return true;
		},
		aboutScreen: function(){
				GUI.render.messageScreen('earTeach v.' + GUI.version + '<br/>(only works under Chrome)<br/><br/><a href=\'mailto:contact@colxi.info\'>contact@colxi.info</a>')
		},
		presetConstructor: function(trainerIndex){

			GUI.behavior.playClickSound();

			var family = TRAINERS[trainerIndex].name;

			// store items identificators, and rendering aliases
			var items = [];
			var names = [];


			// identify trainer family and asign posible values
			switch(family){
				case "Chords":
					items = ['major', 'minor' ,'dim', 'aug', 'max7', 'm7', '7', 'semidim'];
					names = ['major', 'minor' ,'dim', 'aug', 'max7', 'm7', '7', 'semidim'];
					break;
				case "Intervals":
					items = [	["2","dim"],["2","m"],["2","M"],["2","aug"],
								["3","dim"],["3","m"],["3","M"],["3","aug"],
								["4","dim"],["4","P"],["4","aug"],
								["5","dim"],["5","P"],["5","aug"],
								["6","dim"],["6","m"],["6","M"],["6","aug"],
								["7","dim"],["7","m"],["7","M"],["7","aug"],
								["8","dim"],["8","P"],["8","aug"]
							];
					names = [	"2dim", "2m", "2M", "2aug",
								"3dim", "3m", "3M", "3aug",
								"4dim", "4P", "4aug",
								"5dim", "5P", "5aug",
								"6dim", "6m", "6M", "6aug",
								"7dim", "7m", "7M", "7aug",
								"8dim", "8P", "8aug"
							];
					break;
				case "Scales":
					items = [
								["major","ionian"], ["minor","aeolian"], ["minor","harmonic"], ["minor","bachian"], ["minor","melodic"]
							];
					names = ["Major", "Minor Natural", "Minor Harmonic", "Minor Bachian", "Minor Melodic"];
					break;
				default:
					return false;
			}

			// render GUI
			var _htmlCode	 = "";
			_htmlCode 		+= "<div id='NavigatorContainer'>";
			// left column
			_htmlCode 		+= 		"<div id='NavigatorContainerLeftCol'>";
			_htmlCode 		+= 			"<div class='NavigatorContainerLeftColGroup'>";
			_htmlCode 		+= 				"<div class='NavigatorContainerLeftColTitle'>"+ __("Preset Editor") + "</div>";
			_htmlCode 		+= 			"</div>";
			_htmlCode 		+= 			"<div class='NavigatorContainerLeftColGroup'>";
			_htmlCode 		+= 				"<div class='NavigatorContainerLeftColGroupTitle'>" + __("Preset family") +":</div>";
			_htmlCode 		+= 				"<div id='trainerMakerTrainer' data-index='"+ trainerIndex +"'>"+ __(TRAINERS[trainerIndex].name) +"</div>";
			_htmlCode 		+= 			"</div>";
			_htmlCode 		+= 			"<div class='NavigatorContainerLeftColGroup'>";
			_htmlCode 		+= 				"<div class='NavigatorContainerLeftColGroupTitle'>"+__("Preset name")+":</div>";
			_htmlCode 		+= 				"<input id='trainerNameInput'><br>";
			_htmlCode 		+= 			"</div>";
			_htmlCode 		+= 			"<div class='NavigatorContainerLeftColGroup' " + ((family != "Intervals") ? "hidden" : "") + ">";
			_htmlCode 		+= 				"<div class='NavigatorContainerLeftColGroupTitle'>" + __("Direction") + " ▲▼:</div>";
			_htmlCode 		+= 				"<div id='directionSwitch' class='switch' data-direction='asc'>"+__("Ascending")+"</div>";
			_htmlCode	 	+= 			"</div>";
			_htmlCode 		+= 			"<div class='NavigatorContainerLeftColGroup' " + ((family == "Scales") ? "hidden" : "") +">";
			_htmlCode 		+= 				"<div class='NavigatorContainerLeftColGroupTitle'>"+ __("Play Mode") +" ▲▼:</div>";
			_htmlCode 		+= 				"<div id='replaySwitch' class='switch' data-arpeggiated='true'>"+ __("Melodic") + "</div>";
			_htmlCode 		+= 			"</div>";
			_htmlCode 		+= 			"<div class='NavigatorContainerLeftColGroup'>";
			_htmlCode 		+= 				"<div class='NavigatorContainerLeftColGroupTitle'>"+ __("Selected items") +":</div>";
			_htmlCode 		+= 				"<div id='trainerMakerItemsContainer' data-values='' data-names=''>"+ '(' + __('none') + ')' +"</div>";
			_htmlCode 		+= 			"</div>";
			_htmlCode 		+=			"<div class='NavigatorContainerLeftColButtons'>";
			_htmlCode		+= 				"<div id='cancel_button' onclick='GUI.render.presetsCustomGrid("+ trainerIndex +")'></div>";
			_htmlCode		+= 				"<div id='accept_button' onclick='GUI.behavior.trainerMakerSaveTrainer()'></div>";
			_htmlCode		+= 				"<div class='clear'></div>";
			_htmlCode	  	+=			"</div>";
			_htmlCode 		+= 		"</div>";
			// right column
			_htmlCode	   	+= 		GUI.objects.sidebar();
			// middle column
			_htmlCode 		+= 		"<div id='NavigatorContainerMiddleCol'>";
			for(var index=0; index < items.length; index++){
				_htmlCode   += 			GUI.objects.customBox(__(names[index]),'GUI.behavior.trainerMakerAddItem("' + escape(JSON.stringify(items[index])) + '","' + names[index] + '",this,"'+family+'")');
			}
			_htmlCode		+= 			"<div class='clear'></div>";
			_htmlCode		+= 		"</div>";
			// clear floats
			_htmlCode		+= 		"<div class='clear'></div>";
			_htmlCode		+= "</div>";

			// render in DOM
			document.getElementById('appBody').innerHTML = _htmlCode;

			GUI.behavior.makeScroller();

			// Arpeggiated button click handler
			document.getElementById('replaySwitch').onclick= function(){
				// get value
				var arpeggiated = this.getAttribute("data-arpeggiated");
				// flip the current value
				arpeggiated =  (arpeggiated == "true") ? false : true;
				// set new value
				this.setAttribute("data-arpeggiated",arpeggiated);
				// display in menu current value
				this.innerHTML = (arpeggiated) ?  __("Melodic") : __("Harmonic");
				return true;
			}

			// direction button click handler
			document.getElementById('directionSwitch').onclick= function(){
				// get value
				var direction = this.getAttribute("data-direction");
				// flip the current value
				direction =  (direction == "asc") ? "desc" : "asc";
				// set new value
				this.setAttribute("data-direction",direction);
				// display in menu current value
				this.innerHTML = (direction == 'asc') ?  __("Ascending") : __("Descending");
				return true;
			}

			return true;
		},
		trainer: function(trainerIndex, presetIndex, presetCustomFLAG){
			GUI.behavior.playClickSound();

			// render the 2 column TRAINER template (sidebar + trainer container)
			var _htmlCode	= "";
			_htmlCode  		+= GUI.objects.testSidebar(trainerIndex,presetIndex,presetCustomFLAG);
			_htmlCode		+= "<div id='trainerContainer'>";			// trainerContainer allows vertical align
			_htmlCode 		+=		"<div id='trainerMessages' class='titleUnderline'></div>";
			_htmlCode		+= 		"<div id='trainerBody'>";
			_htmlCode 		+= 			"<div id='trainerQuestion' class='titleUnderline'></div>";
			_htmlCode 		+= 			"<div id='trainerAnswers'></div>";
			_htmlCode 		+= 			"<div id='trainerBottomControls'>";
			_htmlCode 		+= 				"<div id='retryBut'><div/>";
			_htmlCode		+=			"</div>";
			_htmlCode		+= 		"</div>";
			_htmlCode		+= "</div>";
			_htmlCode		+= "<div class='clear'></div>";

			document.getElementById('appBody').innerHTML = _htmlCode;
			TEST.start(trainerIndex,presetIndex,presetCustomFLAG);
			return true;
		}
	},
	objects:{
		sidebar: function(){
			var _htmlCode	= "";
			_htmlCode		+= "<div id='sidebar'>";
			//_htmlCode		+= 		"<div id='scrollGuide'></div>";
			//_htmlCode		+= 		"<div id='scroller' draggable='true'></div>";
			_htmlCode		+= 		"<div id='preferencesIcon' onclick='GUI.render.configGrid()'></div>";
			_htmlCode		+= "</div>";
			return _htmlCode;
		},
		customBox:function(title, onclick, subtitle, extraClass){

			extraClass = extraClass || '';

			// prepare code
			var _htmlCode= "";
			_htmlCode 	+= "<div class='box greyBoxBackground " + extraClass + "' onclick='" + onclick + "'>";
			_htmlCode 	+= 		"<div class='trainerTitle center'>" + title + "</div>";
			if(subtitle != undefined)
				_htmlCode+=		"<div class='titleSmallGrey center'>" + subtitle + "</div>";
			_htmlCode	+=	"</div>";
			return _htmlCode;
		},
		trainerBox:function(trainerIndex){

			// calculate score and stars, for requested trainer
			var totalScore = 0;
			var completed = 0;
			for(var i =0; i < TRAINERS[trainerIndex].presets.length; i++){
				var preset = TRAINERS[trainerIndex].presets[i]
				if(preset.completed != 0){
					totalScore += preset.score;
					completed++;
				}
			}
			var trainerStars = Math.round((totalScore/completed)/20);

			// prepare code
			var _htmlCode= "";
			_htmlCode 	+= "<div class='box greyBoxBackground' onclick='GUI.render.presetsGrid(" + trainerIndex + ")'>";
			_htmlCode 	+= 		"<div class='trainerTitle'>" + __(TRAINERS[trainerIndex].name) + "</div>";
			_htmlCode 	+= 		"<div class='trainerStarsCont'>";
			for(var star=1;star <= 5;star++)
				_htmlCode+= 		"<div class='" + ((star <= trainerStars) ?	"enabledStar" : "disabledStar") + "'></div>";
			_htmlCode	+= 			"<div class='clear'></div>";
			_htmlCode	+= 		"</div>";
			_htmlCode	+=	"</div>";
			return _htmlCode;
		},
		presetBox:function(trainerIndex, presetIndex, presetCustomFLAG){
			// set preset source(comon preset / custom presets)
			var preset = (presetCustomFLAG == true) ?  TRAINERS[trainerIndex].presetsCustom[presetIndex] : TRAINERS[trainerIndex].presets[presetIndex];

			// calculate score representation
			var score = Math.round(preset.score);
			var presetStars = Math.floor(score/20);
			var lastStarIsHalf = (Math.round(score/20) != presetStars) ? true : false;

			// Box html code
			var _htmlCode= "";
			_htmlCode 	+= "<div class='box greyBoxBackground' onclick='GUI.render.trainer(" + trainerIndex + "," + presetIndex  + ","+ presetCustomFLAG +")' id='trainer" + preset.id + "'>";
			_htmlCode 	+= 		"<canvas class='canvasStats' hidden onclick='GUI.behavior.hideStats(\"" + preset.id + "\")'></canvas>";
			_htmlCode 	+= 		"<div class='boxTitleCont'>";
			_htmlCode 	+= 			"<div class='boxTitle titleSmallGrey'>" + __(preset.name) + "</div>";
			_htmlCode 	+= 		"</div>";
			_htmlCode 	+= 		"<div class='trainerStarsCont'>";
			for(var star=1;star <= 5;star++)
				if(star <= presetStars) 			_htmlCode+= "<div class='enabledStar'></div>";
				else if(star == presetStars + 1)
					if(lastStarIsHalf == true)	_htmlCode+= "<div class='enableddHalfStar'></div>";
					else						_htmlCode+= "<div class='disabledStar'></div>";
				else if(star > presetStars)		_htmlCode+= "<div class='disabledStar'></div>";
			_htmlCode	+= 			"<div class='trainerStarsAverage'>(" + score  + "%)</div>";
			_htmlCode	+= 			"<div class='clear'></div>";
			_htmlCode	+= 		"</div>";
			_htmlCode	+=		"<div class='boxStatsCont' onclick='event.stopPropagation()'>";
			_htmlCode	+= 			"<div class='boxStatsCompleted'> " + preset.completed + "</div>";
			if(presetCustomFLAG)
				_htmlCode	+= 		"<div class='boxDeletePreset' onclick='GUI.behavior.deletePreset("+ preset.id +")'></div>";
			_htmlCode	+= 			"<div class='boxStatsViewDetails' onclick='GUI.render.statsScreen(" + preset.id + ")'></div>";
			_htmlCode	+= 			"<div class='clear'></div>";
			_htmlCode	+=		"</div>";
			_htmlCode	+=	"</div>";

			return _htmlCode;
		},
		titleBox:function(title,onclickString){
			// accepts as input or numeric array, or string text!

			var text = '';
			if(isNaN(parseFloat(title))) text = title;
			else text =  __(TRAINERS[title].name);


			// green box displayed firt, at presets grid. Works as a return button
			var presetStars = Math.round(Math.random()*5);
			var _htmlCode= "";
			_htmlCode 	+= "<div class='box greenBoxBackground' onclick='"+onclickString+"'>";

			_htmlCode 	+= 		"<div class='boxTitleContCenter'>";
			_htmlCode 	+= 			"<div class='boxTitle greenBoxTitle'>" + text + "</div>";
			_htmlCode 	+= 		"</div>";

			_htmlCode 	+= 		"<div class='returnButBox returnBut'>" + __("Go back") + "</div>";
			_htmlCode	+=	"</div>";
			return _htmlCode;
		},
		longBox:function(title,onclickString){
			// accepts as input or numeric array, or string text!

			var text = '';
			if(isNaN(parseFloat(title))) text = title;
			else text =  __(TRAINERS[title].name);


			// green box displayed firt, at presets grid. Works as a return button
			var presetStars = Math.round(Math.random()*5);
			var _htmlCode= "";
			_htmlCode 	+= "<div class='box boxLong greenLongBoxBackground' onclick='"+onclickString+"'>";

			_htmlCode 	+= 		"<div class='boxTitleContCenter'>";
			_htmlCode 	+= 			"<div class='boxTitle greenBoxTitle'>" + text + "</div>";
			_htmlCode 	+= 		"</div>";

			_htmlCode 	+= 		"<div class='returnButBox returnBut'>" + __("Go back") + "</div>";
			_htmlCode	+=	"</div>";
			return _htmlCode;
		},
		testSidebar:function(trainerIndex, presetIndex,presetCustomFLAG){

			var src = (presetCustomFLAG) ? TRAINERS[trainerIndex].presetsCustom[presetIndex] :TRAINERS[trainerIndex].presets[presetIndex];
			var presetStars = Math.round(Math.random()*5);
			var _htmlCode= "";
			_htmlCode 	+= "<div id='trainerSidebar'>";
			_htmlCode 	+= 		"<div class='greenBoxArrow'></div>";
			_htmlCode 	+= 		"<div id= 'trainerSidebarBox' class='greenFlatBoxBackground'>";
			_htmlCode 	+= 			"<div class='greenBoxTitle'>" + __(TRAINERS[trainerIndex].name) + "</div>";
			_htmlCode 	+= 			"<div class='whiteSubtitle'>" + __(src.name) + "</div>";
			_htmlCode	+=		"</div>";
			_htmlCode	+= 		"<div id='trainerSidebarCounter'>";
			_htmlCode	+= 			"<div id='trainerSidebarCounterSucces'></div>";
			_htmlCode	+= 			"<div id='trainerSidebarCounterFailure'></div>";
			_htmlCode	+= 		"</div>";
			_htmlCode	+= 		"<div id='trainerSidebarFooter' class='greenFlatBoxBackground'>"
			_htmlCode	+=			"<div class='returnBut returnButBoxSidebarFooter' onclick='TEST.abort()'>";
			_htmlCode	+=			__("Return");
			_htmlCode	+=			"</div>";
			_htmlCode	+= 			"<div id='trainerSidebarFooterCounter'></div>";
			_htmlCode	+=		"</div>";
			_htmlCode	+= 		"<div class='clear'></div>";
			_htmlCode	+=	"</div>";
			return _htmlCode;
		}
	},
	behavior:{
		deletePreset: function(presetID){
			document.getElementById('trainer'+presetID).parentNode.removeChild(document.getElementById('trainer'+presetID));
			API('deletePreset',presetID,function(){
				GUI.behavior.loadTrainers();
			})
		},
		trainerMakerSaveTrainer: function(){

			var arpeggiated = document.getElementById('replaySwitch').getAttribute('data-arpeggiated');

			var trainerName = document.getElementById('trainerNameInput').value;

			// recover parent index
			var parentIndex = document.getElementById('trainerMakerTrainer').getAttribute('data-index');


			// recover selected values and names
			var trainerMakerItemsContainer = document.getElementById('trainerMakerItemsContainer');
			var SelectedValues = (trainerMakerItemsContainer.getAttribute('data-values') == '') ? [] : JSON.parse(trainerMakerItemsContainer.getAttribute('data-values'));
			var SelectedNames = (trainerMakerItemsContainer.getAttribute('data-names') == '') ? [] : JSON.parse(trainerMakerItemsContainer.getAttribute('data-names'));

			// decode each JSON encoded value in SelectedValues array
			for(var i=0; i< SelectedValues.length;i++)
				SelectedValues[i] = JSON.parse(SelectedValues[i]);


			// prevent empty name FIELD
			if(trainerName == ''){
				GUI.render.errorLayer(__("You must first give a NAME to your preset!"));
				return false;
			}
			// prevent empty ITEMS array
			if(SelectedNames.length == 0){
				GUI.render.errorLayer(__("You must select at least 1 item!"));
				return false;
			}

			var items=[]
			for(var i =0;i<SelectedNames.length;i++) items.push({name:SelectedNames[i],value:SelectedValues[i]})
			var preset = {
				parent: TRAINERS[parentIndex].id,
				name: trainerName,
				arpeggiated: arpeggiated,
				items: items,
				list_order: TRAINERS[parentIndex].presetsCustom.length + 1
			}

			GUI.render.loader();

			API('saveNewPreset',preset, function(response){
				GUI.behavior.loadTrainers(GUI.render.presetsCustomGrid,parentIndex)
				return true;
			});
			return true;
		},
		trainerMakerAddItem: function(value,name,box,family){

			var value = JSON.parse(unescape(value));
			var trainerMakerItemsContainer = document.getElementById('trainerMakerItemsContainer');

			var SelectedValues = (trainerMakerItemsContainer.getAttribute('data-values') == '') ? [] : JSON.parse(trainerMakerItemsContainer.getAttribute('data-values'));
			var SelectedNames = (trainerMakerItemsContainer.getAttribute('data-names') == '') ? [] : JSON.parse(trainerMakerItemsContainer.getAttribute('data-names'));

			if(family == "Intervals"){
 				var direction = document.getElementById('directionSwitch').getAttribute('data-direction');
				value.push(direction);
				name += ' ' + direction;
			}

			value = JSON.stringify(value);

			if(SelectedValues.indexOf(value) == -1){
				SelectedValues.push(value)
				SelectedNames.push(name)
				trainerMakerItemsContainer.setAttribute('data-values', JSON.stringify(SelectedValues));
				trainerMakerItemsContainer.setAttribute('data-names', JSON.stringify(SelectedNames));
				box.style.webkitTransform = "scale(.9,.9)";
				box.style.opacity=".5";
			}else{
				SelectedValues.splice(SelectedValues.indexOf(value), 1);
				SelectedNames.splice(SelectedNames.indexOf(name), 1);
				trainerMakerItemsContainer.setAttribute('data-values', JSON.stringify(SelectedValues));
				trainerMakerItemsContainer.setAttribute('data-names', JSON.stringify(SelectedNames));
				box.style.webkitTransform = "scale(1,1)";
				box.style.opacity="1";
			}

			var _html = '';
			for(var i=0;i < SelectedValues.length;i++){
				_html += "<div class='boxMini'>"+ __(SelectedNames[i]) +"</div>";

			}

			trainerMakerItemsContainer.innerHTML = (SelectedValues.length == 0) ? '(' + __('none') + ')' :_html;
		},
		hideStats: function(presetId){
			// prevent box capture click event
			if(window.event) event.stopPropagation();

			document.getElementById('trainer' + presetId).getElementsByTagName('canvas')[0].setAttribute("hidden",'true')
		},
		playClickSound: function(){
			// play sound
			piano.setProgram(1);
			piano.play(0,100);
			piano.setProgram(0);
			return true;
		},
		resetStats: function(){
			if(SESSION.onlineMode == false) return false;
			GUI.render.loader();
			API('resetStats',null,function(){
				GUI.behavior.loadTrainers(GUI.render.trainersGrid);
			});
			return true;
		},
		loadDemo: function(){
			// Starts in demo mode, no data is received or sended to server

			console.log("Demo Mode.");
			var DemoTrainers = [{"id":"1","name":"Chords","rounds":"10","question":"Wich chord has just been played?","constructor":"var tonic = JSHarmony.randomNote();\r\nvar type = TEST.items[index].value;\r\nvar chord = JSHarmony.randomChord(tonic, type);\r\nreturn chord;\r\n","presets":[{"id":"1","name":"Majors and Minors (Triads, Arpeggiated)","items":[{"name":"major","value":"major"},{"name":"minor","value":"minor"}],"arpeggiated":"1","parent":"1","list_order":"1","completed":7,"score":96},{"id":"2","name":"Aug and Dims (Triads, Arpeggiated)","items":[{"name":"aug","value":"aug"},{"name":"dim","value":"dim"}],"arpeggiated":"1","parent":"1","list_order":"2","completed":1,"score":70},{"id":"4","name":"Majors, Minors, Aug and Dims (Triads, Arpeggiated)","items":[{"name":"major","value":"major"},{"name":"minor","value":"minor"},{"name":"aug","value":"aug"},{"name":"dim","value":"dim"}],"arpeggiated":"1","parent":"1","list_order":"3","completed":1,"score":80},{"id":"5","name":"Majors and Minors (Triads)","items":[{"name":"major","value":"major"},{"name":"minor","value":"minor"}],"arpeggiated":"0","parent":"1","list_order":"4","completed":1,"score":90},{"id":"6","name":"Majors, Minors, Aug and Dims (Triads)","items":[{"name":"major","value":"major"},{"name":"minor","value":"minor"},{"name":"aug","value":"aug"},{"name":"dim","value":"dim"}],"arpeggiated":"0","parent":"1","list_order":"6","completed":0,"score":0},{"id":"7","name":"Aug and Dims (Triads)","items":[{"name":"aug","value":"aug"},{"name":"dim","value":"dim"}],"arpeggiated":"0","parent":"1","list_order":"5","completed":1,"score":60},{"id":"8","name":"Max7 and minor7 (Arpeggiated)","items":[{"name":"max7","value":"max7"},{"name":"m7","value":"m7"}],"arpeggiated":"1","parent":"1","list_order":"7","completed":1,"score":80},{"id":"9","name":"7 and semidim (Arpeggiated)","items":[{"name":"7","value":"7"},{"name":"semidim","value":"semidim"}],"arpeggiated":"1","parent":"1","list_order":"8","completed":1,"score":80},{"id":"10","name":"Max7 and minor7","items":[{"name":"max7","value":"max7"},{"name":"m7","value":"m7"}],"arpeggiated":"0","parent":"1","list_order":"10","completed":5,"score":32},{"id":"11","name":"7 and semidim","items":[{"name":"7","value":"7"},{"name":"semidim","value":"semidim"}],"arpeggiated":"0","parent":"1","list_order":"11","completed":1,"score":60},{"id":"12","name":"Max7, minor7, 7 and semidim","items":[{"name":"max7","value":"max7"},{"name":"m7","value":"m7"},{"name":"7","value":"7"},{"name":"semidim","value":"semidim"}],"arpeggiated":"0","parent":"1","list_order":"12","completed":1,"score":20},{"id":"13","name":"Max7, minor7, 7 and semidim (Arpeggiated)","items":[{"name":"max7","value":"max7"},{"name":"m7","value":"m7"},{"name":"7","value":"7"},{"name":"semidim","value":"semidim"}],"arpeggiated":"1","parent":"1","list_order":"9","completed":12,"score":38}]},{"id":"2","name":"Intervals","rounds":"10","question":"Wich interval has just been played?","constructor":"var root = JSHarmony.randomNote();\r\nvar item = TEST.items[index].value;\r\nvar interval = JSHarmony.makeInterval(item[0] , item[1], item[2], root);\r\nreturn interval;\r\n","presets":[{"id":"14","name":"IIIM - VP - VIII (Melodic, Ascending)","items":[{"name":"3M asc","value":["3","M","asc"]},{"name":"5P asc","value":["5","P","asc"]},{"name":"8P asc","value":["8","P","asc"]}],"arpeggiated":"1","parent":"2","list_order":"1","completed":0,"score":0},{"id":"15","name":"IVP - VIM (Melodic, Ascending)","items":[{"name":"4P asc","value":["4","P","asc"]},{"name":"6M asc","value":["6","M","asc"]}],"arpeggiated":"1","parent":"2","list_order":"2","completed":4,"score":45},{"id":"16","name":"IIM - VIIM (Melodic, Ascending)","items":[{"name":"2M asc","value":["2","M","asc"]},{"name":"7M asc","value":["7","M","asc"]}],"arpeggiated":"1","parent":"2","list_order":"3","completed":3,"score":47},{"id":"17","name":"IIM - IIIM - IVP - VP - VIM - VIIM - VIIIP (Melodic, Ascending)","items":[{"name":"2M asc","value":["2","M","asc"]},{"name":"3M asc","value":["3","M","asc"]},{"name":"4P asc","value":["4","P","asc"]},{"name":"5P asc","value":["5","P","asc"]},{"name":"6M asc","value":["6","M","asc"]},{"name":"7M asc","value":["7","M","asc"]},{"name":"8P asc","value":["8","P","asc"]}],"arpeggiated":"1","parent":"2","list_order":"4","completed":0,"score":0},{"id":"18","name":"IIIM - VP - VIII (Melodic, Descending)","items":[{"name":"3M desc","value":["3","M","desc"]},{"name":"5P desc","value":["5","P","desc"]},{"name":"8P desc","value":["8","P","desc"]}],"arpeggiated":"1","parent":"2","list_order":"5","completed":2,"score":67},{"id":"19","name":"IVP - VIM (Melodic, Descending)","items":[{"name":"4P desc","value":["4","P","desc"]},{"name":"6M desc","value":["6","M","desc"]}],"arpeggiated":"1","parent":"2","list_order":"6","completed":1,"score":15},{"id":"20","name":"IIM - VIIM (Melodic, Descending)","items":[{"name":"2M desc","value":["2","M","desc"]},{"name":"7M desc","value":["7","M","desc"]}],"arpeggiated":"1","parent":"2","list_order":"7","completed":0,"score":0},{"id":"21","name":"IIM - IIIM - IVP - VP - VIM - VIIM - VIIIP (Melodic, Descending)","items":[{"name":"2M desc","value":["2","M","desc"]},{"name":"3M desc","value":["3","M","desc"]},{"name":"4P desc","value":["4","P","desc"]},{"name":"5P desc","value":["5","P","desc"]},{"name":"6M desc","value":["6","M","desc"]},{"name":"7M desc","value":["7","M","desc"]},{"name":"8P desc","value":["8","P","desc"]}],"arpeggiated":"1","parent":"2","list_order":"8","completed":12,"score":73}]},{"id":"3","name":"Scales","rounds":"10","question":"Wich scale has just been played?","constructor":"var root = JSHarmony.randomNote();\r\nvar item = TEST.items[index].value;\r\nvar interval = JSHarmony.makeScale(item[0] , item[1], root);\r\nreturn interval;\r\n","presets":[{"id":"22","name":"Major (ionian) and Minor","items":[{"name":"Major","value":["major","ionian"]},{"name":"Minor","value":["minor","aeolian"]}],"arpeggiated":"1","parent":"3","list_order":"1","completed":0,"score":0},{"id":"23","name":"Minor Natural (aeolian) and Minor Harmonic","items":[{"name":"Minor Natural","value":["minor","aeolian"]},{"name":"Minor Harmonic","value":["minor","harmonic"]}],"arpeggiated":"1","parent":"3","list_order":"2","completed":4,"score":77},{"id":"24","name":"Minor Natural (aeolian) and Minor Melodic","items":[{"name":"Minor Natural","value":["minor","aeolian"]},{"name":"Minor Melodic","value":["minor","melodic"]}],"arpeggiated":"1","parent":"3","list_order":"3","completed":2,"score":88},{"id":"25","name":"Minor Natural (aeolian), Minor Melodic, Minor Harmonic","items":[{"name":"Minor Natural","value":["minor","aeolian"]},{"name":"Minor Melodic","value":["minor","melodic"]},{"name":"Minor Harmonic","value":["minor","harmonic"]}],"arpeggiated":"1","parent":"3","list_order":"4","completed":0,"score":0},{"id":"26","name":"Major (ionian), Minor Natural (aeolian), Minor Melodic, Minor Harmonic","items":[{"name":"Major","value":["major","ionian"]},{"name":"Minor Natural","value":["minor","aeolian"]},{"name":"Minor Melodic","value":["minor","melodic"]},{"name":"Minor Harmonic","value":["minor","harmonic"]}],"arpeggiated":"1","parent":"3","list_order":"5","completed":0,"score":0}]}];
			SESSION.onlineMode = false;
			GUI.behavior.initializeTrainers(DemoTrainers,GUI.render.trainersGrid)

			// done!
			return true;
		},
		initializeTrainers: function(trainersData,callback,callbackArg){
			// iterates over TRAINERS  and convert each constructor strng, to function...

			// assign data to local TRAINERS structure HANDLER
			TRAINERS = trainersData;

			// create each trainer test constructor function from string
			for(var i = 0; i < TRAINERS.length; i++){
				TRAINERS[i].constructor = new Function('index','root',TRAINERS[i].constructor);
			}

			// RENDER primary MENU!
			if(callback != undefined) callback(callbackArg);

			// done
			return true;
		},
		loadTrainers: function(callback,callbackArg){
			// create a local cache of TRAINERS definitions and PRESETS definitions
			API('getTrainersStructure',null,function(JSONTrainers){
				// if no TRAINERS returned, block execution.
				if(JSONTrainers == -1){
					GUI.render.messageScreen(__("There are currently no TRAINERS available."));
					return false;
				}
				GUI.behavior.initializeTrainers(JSONTrainers,callback,callbackArg);
			});

			// done!
			return true;
		},
		logout: function(){
			/*
			/
			*/

			API('logout',null, function(){
				SESSION.end();
				GUI.render.loginScreen();
			});
		},
		login: function(username,pass){
			/*
			/ Retrieve data from form and send it to server to initiate
			/ session. If succes, store some session data in local SESSION handler
			*/

			if(username == undefined && pass == undefined){
				// assume username is in login page, and get data from login form
				var username = document.getElementById('login_username').value;
				var pass = document.getElementById('login_password').value;
			}
			GUI.render.loader();

			// send login request to server, and set asyncronic callback function
			API('login', [username , pass], function(userID){
				// if login fails, show error, and retry
				if(userID == -1){
					GUI.render.errorLayer(__("Invalid username/password."));
					GUI.render.loginScreen();
					return false;
				}

				// if succeed, initiate local session
				SESSION.onlineMode 	= true;
				SESSION.init({
					uID:'userID',
					username:'username',
				});

				GUI.render.loader();
				GUI.behavior.loadTrainers(GUI.render.trainersGrid);
			});

			// done!
			return true;
		},
		newAccount: function(){
			/*
			/
			*/

			var username 	= document.getElementById('username').value;
			var email 		= document.getElementById('email').value;
			var pass 		= document.getElementById('password').value;
			var pass2 		= document.getElementById('password2').value;

			// prevent empty fields...
			if(username == ''){
				GUI.render.errorLayer(__('Username field required!'));
				return false;
			}

			if(pass == ''){
				GUI.render.errorLayer(__('Password field required!'));
				return false;
			}

			if(email == ''){
				GUI.render.errorLayer(__('Email field required!'));
				return false;
			}

			// validate password matching
			if(pass != pass2){
				GUI.render.errorLayer(__('Passwords must match!'));
				return false;
			}

			// validate alphanumeric username
			if(/[^a-zA-Z0-9]/.test(username)) {
				GUI.render.errorLayer(__('Only alphanumeric characters allowed in username!'));
				return false;
			}

			// validate email
			if(/\S+@\S+\.\S+/.test(email) == false) {
				GUI.render.errorLayer(__('Incorrect email!'));
				return false;
			}

			GUI.render.loader();
			API('userExist',username,function(userExist){
				if(userExist == true){
					GUI.render.messageScreen(__('Provided username already exist. Please try with another one') , 'GUI.render.newAccountForm()');
				}else{
					API('createAccount',[username,pass,email],function(uID){
						if(uID != -1){
							GUI.render.messageScreen(__('Congratulations! Your account has been created.') , 'GUI.behavior.login("' + username + '","' + pass + '")');
						}else{
							GUI.render.messageScreen(__('Uops... Something failed, try it again...') , 'GUI.render.newAccountForm()');
						}

						// done!
						return true;
					});
				}
			});
		},
		makeScroller : function(){

			Ps.initialize(document.getElementById('viewPortScrollable'), {
			  wheelSpeed: 2,
			  wheelPropagation: true,
			  minScrollbarLength: 57,
			  maxScrollbarLength: 67,
			  suppressScrollX: true
			});

			return true;
			/*
			var scrollBarObj = document.getElementById('scroller');
			var scrolledContents = document.getElementById('NavigatorContainerMiddleCol');

			var dragEndFunc = function(e){
					scrollBarObj.removeEventListener('drag', dragFunc);
					scrollBarObj.removeEventListener('dragend', dragEndFunc);
				};

			var dragFunc = function(e){
					if(e.target.id=="scroller"){

						// REIMPLEMENTATION REQUIRED!!! (using CSS3 transitions)

						// last call (just after mouse release) detection, to avoid extrange
						// behaviours in the values of e.offsetY
						if(e.y == 0) return;

						// SCROLL BAR

						// calculate distance from scrollbar to mouse Y
						var distanceY = (e.offsetY ) - 33;
						// calculate scrollbar movement speed
						var newY = ((scrollBarObj.offsetTop )+ distanceY * 50 / 300 ) ;
					}else{
						var newY = (e.y -120);
					}

					// apply limits (top and bottom)
					if(newY < scrollBarObj.style.marginTop+20) newY = scrollBarObj.style.marginTop;
					if(newY > 260) newY = 260;
					// assign new position
					scrollBarObj.style.top = newY + 'px';
					// SCROLL CONTENTS
					scrolledContents.style.top = (newY * (0 - scrolledContents.offsetHeight + 414) / 260) + "px";

					e.preventDefault();
					return false;

				}

			var dragStartFunc = function(e){
					console.log("started")
					e.dataTransfer.setData('text/plain', 'scroll')
					//e.dataTransfer.setDragImage(document.getElementById('invisible'),0,0);
				}

			// DISABLE scroll bar if there is no more than 1 page
			if(scrolledContents.offsetHeight < 455){
				scrollBarObj.removeAttribute('draggable');
				scrollBarObj.style.cursor = 'not-allowed';
				scrollBarObj.style.top ="135px";
				return;
			}else{
				// or ENABLE scrollbar otherwise
				document.body.draggable="true";
				document.body.addEventListener('dragover', dragFunc,false);
				scrollBarObj.addEventListener('dragend', dragEndFunc,false);
				scrollBarObj.addEventListener('dragstart', dragStartFunc,false);
			}
			return;
			*/
		}
	}
};

