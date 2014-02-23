
// Copyright 2010 William Malone (www.williammalone.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var canvas;
var context;
var canvasWidth = $(window).width();
var canvasHeight = $(window).height();
var padding = 25;
var lineWidth = 8;
var paint = false;
var totalLoadResources = 8;
var curLoadResNum = 0;

//Variables used for line drawing
var endX;
var endY;
var points = [];
var isShiftPressed = false;
var startX;
var startY;

component = function(res, cur, volt, ends, type, height, width){
	this.res = res;
	this.cur = cur;
	this.volt = volt;
	this.type = type;
	this.ends = ends;
	this.height = height;
	this.width = width;


	this.imgR = function(){
		var xa = ends.a.x;
		var ya = ends.a.y;
		var xb = ends.b.x;
		var yb = ends.b.y;

		context.moveTo(xa, ya);
		context.lineTo(xa+Math.floor(width/2),ya-Math.floor((height)));
		for(var i = 2;i < 8; i++){
			if(i%2 == 0){
	      		context.lineTo(xa+width*i,ya+height);
	      		continue;
	      	}
      		context.lineTo(xa+width*i,ya-height);
	    }
	    context.lineTo(xb,yb);
      	context.stroke();
	}

}

point = function(x,y){
	this.x = x;
	this.y = y;
}

lineSet = function(a,b){
	this.a = a;
	this.b = b;
}
/**
* Calls the redraw function after all neccessary resources are loaded.
*/
function resourceLoaded()
{
	if(++curLoadResNum >= totalLoadResources){
		redraw();
	}
}

/**
* Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
*/
function prepareCanvas()
{
	// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
	var canvasDiv = document.getElementById('canvasDiv');
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
	context = canvas.getContext("2d"); // Grab the 2d canvas context
	// Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
	//     context = document.getElementById('canvas').getContext("2d");
	
	// Load images
	// -----------
	//crayonImage.onload = function() { resourceLoaded(); 
	//};
	//crayonImage.src = "images/crayon-outline.png";
	//context.drawImage(crayonImage, 0, 0, 100, 100);
	

	$(window).resize(function(e) {
  		//resize just happened, pixels changed
  		canvasWidth = $(window).width();
		canvasHeight = $(window).height();
		canvas.setAttribute('width', canvasWidth);
		canvas.setAttribute('height', canvasHeight);
		redraw();

	});
	// Add mouse events
	// ----------------
	$('#canvas').mousedown(function(e)
	{
		var pt; //tmp point to lock to
		context.beginPath();
		
		// Mouse down location
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		pt = findPt(new point(mouseX, mouseY));
		startX = pt.x;
		startY = pt.y;
		endX = startX;
		endY = startY;	
		
		paint = true;
		//addClick(mouseX, mouseY, false);
		redraw();
	});
	
	$('#canvas').mousemove(function(e){
		if(paint==true){
			var diffX;
			var diffY;
			var pt;
			//addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
			isShiftPressed = e.shiftKey;
			//redraw();
			endX = e.pageX - this.offsetLeft;
			endY = e.pageY - this.offsetTop;
			//context.lineTo(endX, endY);
			context.stroke();
			redraw();
			if(isShiftPressed){
				diffX = endX - startX;
				diffY = endY - startY;
				if(diffX <= 0){
					if(Math.abs(diffY) > Math.abs(diffX)){
						endX = startX;
					}
					else{
						endY = startY;
					}
				}
				else if(diffY <= 0){
					if(Math.abs(diffY) > Math.abs(diffX)){
						endX = startX;
					}
					else{
						endY = startY;
					}
				}
				else{
					if(Math.abs(diffY) > Math.abs(diffX)){
						endX = startX;
					}
					else{
						endY = startY;
					}
				}
				
			}

			pt = findPt(new point(endX,endY));
			endX = pt.x;
			endY = pt.y;
			context.moveTo(startX, startY);
      		context.lineTo(endX, endY);
      		context.stroke();
			
		}


	});
	
	$('#canvas').mouseup(function(e){
		var save = [];

		paint = false;
		context.save();
		//endX = e.pageX - this.offsetLeft;
		//endY = e.pageY - this.offsetTop;
		if(startX != endX || startY != endY){
			save.push(new point(endX,endY));
			save.push(new point(startX,startY));
			points.push(new lineSet(save[0],save[1]));
	  	}
	  	redraw();
	});
	
	$('#canvas').mouseleave(function(e){
		paint = false;
		startY = endY;
		startX = endX;
		redraw();
	});

}


//finds the closest point to lock to
//returns a new point that will be used to lock the line to
//@param p point
function findPt(pt){
	var diffXs; //s for start
	var diffXe; //e for end
	var diffYs; //ditto
	var diffYe;

	for(i = 0; i < points.length; i++){
		diffXs = points[i].a.x - pt.x;
		diffYs = points[i].a.y - pt.y;
		diffXe = points[i].b.x - pt.x;
		diffYe = points[i].b.y - pt.y;

		if(Math.abs(diffXs) < 20 && Math.abs(diffYs) < 20){
			return new point(points[i].a.x,points[i].a.y);
		}
		else if(Math.abs(diffXe) < 20 && Math.abs(diffYe) < 20){
			return new point(points[i].b.x,points[i].b.y);
		}
	}

	return pt;
}

/**
* Clears the canvas.
*/
function clearCanvas()
{
	context.clearRect(0, 0, canvasWidth, canvasHeight);
}

//Draws all lines from array that is in the program
function drawLines(){
	for(i = 0; i < points.length; i++){
		context.moveTo(points[i].a.x, points[i].a.y);
      	context.lineTo(points[i].b.x, points[i].b.y);
      	context.stroke();
      	//window.print(i[0].x);
	}
}

/**
* Redraws the canvas.
*/
function redraw()
{
	var v = new component(0,0,0,new lineSet(new point(10,10), new point(75,10)), 0, 10,16);

	context.save();
	clearCanvas();
	v.imgR();
	drawLines();
  	context.beginPath();
  //context.rect(drawingAreaX, drawingAreaY, drawingAreaWidth, drawingAreaHeight);
  	context.clip();

	context.restore();

}


