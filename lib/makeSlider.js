/*  
	makeSlider 1.0
	Copyright 2013 colxi.info
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


/*

	Usage:
	1- Define the following HTML structure:
	
	<div id="sliderCont">
		<div>
			<img src="img1.jpg"/>
			<img src="img2.jpg"/>
			<img src="img3.jpg"/>
			<!-- ... more elements here-->
		</div>
	</div>
	
	2- after HTML structure is in DOM, call makeSlider(), with root Div ID, and slide interval (in ms)
	
	<script>
		makeSlider('sliderCont',3000);
	</script>
	
	3- Remember to apply CSS to root Div, at least: width, height 
	
*/

function makeSlider(sliderID,speed){

	var slideshowViewPort = document.getElementById(sliderID);
	if(slideshowViewPort == undefined) throw new Error("Unkwnow Slider Container ("+sliderID+")");

	// apply CSS
	slideshowViewPort.style.overflow = "hidden";
	
	// get Slide contents container (first child cross-browser search)
	var slideshowContents = ( slideshowViewPort.firstElementChild || slideshowViewPort.children[0]);
	if(slideshowContents == undefined) throw new Error("Slider Container Child not found");
	
	// apply CSS
	slideshowContents.style.position 	= "relative";
	slideshowContents.style.whiteSpace 	= "nowrap";
	slideshowContents.style.left 		= "0px";
	slideshowContents.style.width 		= "auto";
	slideshowContents.style.display 	= "inline-block";
	slideshowContents.style.transition 	= "left 1s";
	slideshowContents.style.fontSize 	= "0"; //remove white space betwen inline-block elements

	// set movement interval
	setInterval(function(){
		var viewPortWidth = slideshowViewPort.offsetWidth;
		var newPos = (slideshowContents.offsetLeft - viewPortWidth);
		if(newPos < (slideshowContents.offsetWidth*-1) + viewPortWidth) newPos = 0;
		slideshowContents.style.left =  newPos + "px";
	},speed)
	return true;
}