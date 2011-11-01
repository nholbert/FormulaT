var GBWIDTH = 600;
var GBHEIGHT = 300;
var gutter = 20;
var offsety = 75;
var offsetx = 50; // tweak
var graphback;
var graphnodes;
var activeNode = 0;
var fullset = false;
var radius = 4;

var accelx;
var graphActive = false;
var graphMade = false;
var taps = 0;
var tx = 0;

function graphSetup() {
    var gbcanvas = document.getElementById("graphback");
    var gncanvas = document.getElementById("graphnodes");
    gbcanvas.width = GBWIDTH;
    gbcanvas.height = GBHEIGHT;
    gncanvas.width = GBWIDTH;
    gncanvas.height = GBHEIGHT;
    gbcontext = gbcanvas.getContext('2d');
    gncontext = gncanvas.getContext('2d');
    
    if (isIPad() || isIPhone()) {
	gncanvas.addEventListener( 'touchstart', onTouchStart, false );
    } else {
	gncanvas.onmouseup = mouseUpG;
	gncanvas.onmousemove = mouseMoveG;
	gncanvas.onmousedown = mouseDownG;
	gncanvas.onmouseout = mouseOutG;
    }

    graphback = new blankgraph(20, 10);
    graphnodes = [];
    createGNodes();
    activeNode += 1;
    taps = 0;
    fullset = false;
    graphback.draw(gbcontext);
}

function blankgraph(xMax, yMax){
    this.xMax = xMax;
    this.yMax = yMax;
    
    this.draw = function draw(gbcontext){
	graphBox();
	//gbcontext.fillStyle = 'rgb(70, 70, 70)';
	//gbcontext.fillRect(gutter, gutter, GBWIDTH - gutter * 2, GBHEIGHT - gutter * 2);
	axisNum(this.xMax, x);
	axisNum(this.yMax, y);
	minor(this.xMax, x);
	minor(this.yMax, y);
	axisLines();
	
    }
}

function graphBox() {
    gbcontext.strokeStyle = 'rgb(150, 0, 0)'; // white outline
    gbcontext.lineWidth = 4;
    gbcontext.fillStyle = 'rgb(0,0,0)'; // black fill
    gbcontext.beginPath();
    gbcontext.moveTo(0 + gutter, 0);
    gbcontext.arcTo(0, 0, 0, 0 + gutter, gutter);
    gbcontext.lineTo(0, GBHEIGHT - gutter);
    gbcontext.arcTo(0, GBHEIGHT, 0 + gutter, GBHEIGHT, gutter);
    gbcontext.lineTo(GBWIDTH - gutter, GBHEIGHT);
    gbcontext.arcTo(GBWIDTH, GBHEIGHT, GBWIDTH, GBHEIGHT - gutter, gutter);
    gbcontext.lineTo(GBWIDTH, 0 + gutter);
    gbcontext.arcTo(GBWIDTH, 0, GBWIDTH - gutter, 0, gutter);
    gbcontext.closePath();
    gbcontext.fill();
    gbcontext.stroke();
}

function axisLines(){
    gbcontext.strokeStyle = 'rgb(0, 190, 255)'; // blue axis
    gbcontext.lineWidth = 4;
    gbcontext.beginPath();
    gbcontext.moveTo(0 + gutter, 0 + gutter);
    gbcontext.lineTo(0 + gutter, GBHEIGHT - gutter);
    gbcontext.lineTo(GBWIDTH - gutter, GBHEIGHT - gutter);
    gbcontext.lineTo(0 + gutter, GBHEIGHT - gutter);
    gbcontext.closePath();
    gbcontext.stroke();
    gbcontext.fillStyle = 'rgb(255, 255, 255)';
    gbcontext.font = "16pt Arial";
    gbcontext.textAlign = "left";
    gbcontext.textBaseline = "top";
    gbcontext.fillText("Velocity", gutter, gutter);
    gbcontext.textAlign = "right";
    gbcontext.textBaseline = "bottom";
    gbcontext.fillText("Time", GBWIDTH - gutter, GBHEIGHT - gutter);
}

function axisNum(max, axis) {
    gbcontext.fillStyle = 'rgb(255, 255, 255)';
    gbcontext.textAlign = "center";
    gbcontext.textBaseline = "middle";
    if (axis == x){
	var nodeX = GBWIDTH - gutter;
	var nodeY = GBHEIGHT - gutter/2;
	for (var i = max; i > -1; i--){
	    gbcontext.fillText(i, nodeX, nodeY);
	    nodeX -= 28;
	}
    } else {
	var nodeX = gutter/2;
	var nodeY = gutter;
	for (var i = max; i > -1; i--){
	    gbcontext.fillText(i, nodeX, nodeY);
	    nodeY += 26;
	}
    }
}

function minor(max, axis){
    gbcontext.strokeStyle = 'rgb(100, 100, 100)';
    //gbcontext.strokeStyle = 'rgb(255, 255, 255)';
    gbcontext.lineWidth = 2;
    //var lineWidth;
    if (axis == x) {
	var lineX = GBWIDTH - gutter;
	var lineY = GBHEIGHT - gutter;
	for (var i = max; i > 0; i--){
	    gbcontext.beginPath();
	    gbcontext.moveTo(lineX, lineY);
	    gbcontext.lineTo(lineX, 0 + gutter);
	    gbcontext.closePath();
	    gbcontext.stroke();
	    lineX -= 28;
	}
    } else {
	var lineX = gutter;
	var lineY = gutter;
	for (var i = max; i > 0; i--){
	    gbcontext.beginPath();
	    gbcontext.moveTo(lineX, lineY);
	    gbcontext.lineTo(GBWIDTH - gutter, lineY);
	    gbcontext.closePath();
	    gbcontext.stroke();
	    lineY += 26;
	}
    }
}

function createGNodes(){
    var nx = gutter;
    var xspace = 28;
    var nx = gutter + activeNode * xspace;
    if (activeNode > 0) {
	var ly = graphnodes[activeNode - 1].y
	var ny = ly
    } else {
	var ny = GBHEIGHT - gutter;
    }
    graphnodes.push (new node (nx, ny, activeNode, 0, 0));
    
    gncontext.fillStyle = "rgb(255, 255, 0)";
    gncontext.beginPath();
    gncontext.arc(nx, ny, radius, 0, 2* Math.PI, false);
    gncontext.closePath();
    gncontext.fill();
}

function tagNode(mx, my) {
    if (graphnodes.length == activeNode) {
	createGNodes();
	moveNode(mx, my, false);
    } else if (fullset) {
	moveNode(mx, my, true);
    } else {
	moveNode(mx, my, false);
    }
}

function moveNode(mx, my, adjust){
    if (adjust) {
	var currNode = graphnodes[Math.round((mx - 20) / 28)];
	var nextNode = graphnodes[Math.round((mx - 20) / 28) + 1];
	var lastNode = graphnodes[Math.round((mx - 20) / 28) - 1];
	var nx = nextNode.x;
	var ny = nextNode.y;
    } else {
	var currNode = graphnodes[activeNode];
	var lastNode = graphnodes[activeNode - 1];
    }
    var cx = currNode.x;
    var cy = currNode.y;
    var lx = lastNode.x;
    var ly = lastNode.y;
    
    var curVel = 10 - ((my - 20) / 26);
    var curAcc = (curVel - lastNode.vel);
    if (Math.abs(curAcc) <=3){
	currNode.y = my;
	currNode.vel = curVel;
	currNode.accel = curAcc;
	
	gncontext.clearRect(cx - radius, 0, radius * 2, GBHEIGHT); 	// clear any previous node draws
	gncontext.fillStyle = "rgb(255, 255, 0)";
	gncontext.beginPath();					// draw node
	gncontext.arc(cx, my, radius, 0, 2* Math.PI, false);
	gncontext.closePath();
	gncontext.fill();
	
	gncontext.clearRect(lx + 4, 0, 20, GBHEIGHT); 	// clear any lines behind current node
	gncontext.beginPath();				// draw attaching lines
	gncontext.strokeStyle = "rgb(255, 255, 0)";
	gncontext.lineWidth = 1;
	gncontext.moveTo(lx + 5, ly);
	gncontext.lineTo(cx - 5, currNode.y);
	gncontext.closePath();
	gncontext.stroke();
    } else {
	currNode.vel = 10 - ((cy - 20) / 26);;
	currNode.accel = (currNode.vel - lastNode.vel);
	gncontext.clearRect(lx + 4, 0, 20, GBHEIGHT); 	// clear any lines behind current node
	gncontext.beginPath();				// draw attaching lines
	gncontext.strokeStyle = "rgb(255, 255, 0)";
	gncontext.lineWidth = 1;
	gncontext.moveTo(lx + 5, ly);
	gncontext.lineTo(cx - 5, currNode.y);
	gncontext.closePath();
	gncontext.stroke();
    }
    if (adjust){
	gncontext.clearRect(cx + 4, 0, 20, GBHEIGHT);	// clear any lines ahead of current node
	gncontext.beginPath();				// draw attaching lines
	gncontext.strokeStyle = "rgb(255, 255, 0)";
	gncontext.lineWidth = 1;
	gncontext.moveTo(cx + 5, cy);
	gncontext.lineTo(nx - 5, ny);
	gncontext.closePath();
	gncontext.stroke();
    }
}

//function touchNode(tx){
//    if (graphActive){
//	if (graphnodes.length == activeNode) {
//	    createGNodes();
//	    accNode();
//	}
//    }
//}

function accNode(){
    if (tx != 0){
	var currNode = graphnodes[Math.round((tx - 20) / 28)];
	var nextNode = graphnodes[Math.round((tx - 20) / 28) + 1];
	var lastNode = graphnodes[Math.round((tx - 20) / 28) - 1];
	var nx = nextNode.x;
	var ny = nextNode.y;
    } else {
	var currNode = graphnodes[activeNode];
	var lastNode = graphnodes[activeNode - 1];
    }
    var cx = currNode.x;
    var cy = currNode.y;
    var lx = lastNode.x;
    var ly = lastNode.y;
    
    var newy = currNode.y - accelx * 3;
    var newvel = 10 - ((newy - 20) / 26);
    if (Math.abs(newvel - lastNode.vel) <= 3 && newy > gutter && newy < GBHEIGHT - gutter) {
	currNode.y = newy;
	currNode.vel = newvel;
	currNode.vel = 10 - ((currNode.y - 20) / 26);
	currNode.accel = (currNode.vel - lastNode.vel);
	
	gncontext.clearRect(cx - radius, 0, radius * 2, GBHEIGHT); 	// clear any previous node draws
	gncontext.fillStyle = "rgb(255, 255, 0)";
	gncontext.beginPath();					// draw node
	gncontext.arc(cx, currNode.y, radius, 0, 2* Math.PI, false);
	gncontext.closePath();
	gncontext.fill();
	
	gncontext.clearRect(lx + 4, 0, 20, GBHEIGHT); 	// clear any lines behind current node
	gncontext.beginPath();				// draw attaching lines
	gncontext.strokeStyle = "rgb(255, 255, 0)";
	gncontext.lineWidth = 1;
	gncontext.moveTo(lx + 5, ly);
	gncontext.lineTo(cx - 5, currNode.y);
	gncontext.closePath();
	gncontext.stroke();
    }
    if (tx != 0){
	gncontext.clearRect(cx + 4, 0, 20, GBHEIGHT);	// clear any lines ahead of current node
	gncontext.beginPath();				// draw attaching lines
	gncontext.strokeStyle = "rgb(255, 255, 0)";
	gncontext.lineWidth = 1;
	gncontext.moveTo(cx + 5, cy);
	gncontext.lineTo(nx - 5, ny);
	gncontext.closePath();
	gncontext.stroke();
    }
}



//---------//
//  EVENTS //
//---------//

function mouseDownG(event) {
    if (graphActive){
	// get the mouse location
	var mx = event.pageX - offsetx;
	var my = event.pageY - offsety;
	if (!drawing && my > gutter && my < GBHEIGHT - gutter) {
	    drawing = true;
	    tagNode(mx, my);
	}
    }
}

function mouseMoveG(event) {
    if (graphActive){
	var mx = event.pageX - offsetx;
	var my = event.pageY - offsety;
	if ( drawing && my > gutter && my < GBHEIGHT - gutter) {  // check drawing flag
	    tagNode(mx, my);
	}
    }
}

function mouseUpG(event) {
    if (graphActive){
	drawing = false; // on mouseup, set the drawing flag to false
	if (activeNode < 20) {
	    activeNode += 1;
	} else {
	    activeNode = 1;
	    fullset = true;
	}
    }
}

function mouseOutG(event) {
    drawing = false;
}

function onTouchStart(event) {
    if (graphActive){
	taps += 1
	if (taps == 2){
	    taps = 0;
	    tx = 0;
	    if (activeNode < 20) {
	       activeNode += 1;
	    } else {
		activeNode = 1;
		fullset = true;
	    }
	} else if (!fullset){
	    createGNodes();
	} else {
	    var t = event.changedTouches[0];
	    tx = t.pageX - offsetx;
	}
    }
}

window.ondevicemotion = function (event) {
    accelx = (event.accelerationIncludingGravity.x + 4);
    if (graphActive && taps == 1) {
	//var ele = document.getElementById("accelvalue").innerHTML=accelx;
	accNode();
    }
}

//-------------------//
//  BUTTON FUNCTIONS //
//-------------------//

function clearGraph(){
    graphnodes = [];
    activeNode = 0;
    gbcontext.clearRect(0, 0, GBWIDTH, GBHEIGHT);
    gncontext.clearRect(0, 0, GBWIDTH, GBHEIGHT);
}

function resetGraph(){
    clearGraph();
    graphSetup();
    graphMade = false;
}

function exportGraph(){
    if (graphnodes.length == 21){
	for (var i = nodeArray.length; i > 0; i--){
	    var nodeArrayActive = nodeArray[i-1];
	    var graphnodesActive = graphnodes[i];
	    nodeArrayActive.vel = graphnodesActive.vel;
	    nodeArrayActive.accel = graphnodesActive.accel;
	}
	toggleZ("graphback");
	toggleZ("graphnodes");
	document.getElementById("resetGraph").style.display = "none";
	document.getElementById("exportGraph").style.display = "none";
	document.getElementById("returnGraph").style.display = "block";
	document.getElementById("Clear").disabled = false;
	document.getElementById("Reset").disabled = false;
	document.getElementById("Race").disabled = false;
	document.getElementById("square").style.display = "none";
	document.getElementById("corners").style.display = "none";
	document.getElementById("fig8").style.display = "none";
	graphMade = true;
	graphActive = false;
    } else {
	alert("You have to add a point for all markers before exporting!");
    }
}

function returnGraph(){
    resetCar();
    document.getElementById("Clear").disabled = true;
    document.getElementById("Reset").disabled = true;
    document.getElementById("Race").disabled = true;
    document.getElementById("resetGraph").style.display = "block";
    document.getElementById("paintMode").style.display = "block";
    document.getElementById("exportGraph").style.display = "block";
    toggleTrackImages();
    document.getElementById("returnGraph").style.display = "none";
    document.getElementById("graphMode").style.display = "none";
    toggleZ("graphback");
    toggleZ("graphnodes");
    graphActive = true;
}