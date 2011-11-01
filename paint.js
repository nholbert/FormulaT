var WIDTH = 700;
var HEIGHT = 450;
var GWIDTH = 350;
var GHEIGHT = 250;

var trackSelected;
var background;
var sqtrack1;
var fig8track1;
var cornerTrack1;
var player1;
var nodeArray;
var dataArray;
var line;

var clock;
var timer;
var savedTime;
var clockRunning = false;
var timerRunning = false;
var result = "none";
var lastFlag;

var drawing;
var touchable = "createTouch" in document;

function init() {
    setup();
    graphinit();
    if (graphActive){
	clearImages();
	toggleTrackImages();
    }
}

function setup() {
    var ptcanvas = document.getElementById("paint");
    var trcanvas = document.getElementById("track");
    var carcan = document.getElementById("car");
    var brushColor = document.getElementById("brushColor");
    ptcanvas.width = WIDTH;
    ptcanvas.height = HEIGHT;
    trcanvas.width = WIDTH;
    trcanvas.height = HEIGHT;
    carcan.width = WIDTH;
    carcan.height = HEIGHT;
    ptcontext = ptcanvas.getContext('2d');
    trcontext = trcanvas.getContext('2d');
    carcontx = carcan.getContext('2d');
    
    // Prevent elastic scrolling in iphone / ipad apps
    document.ontouchmove = function(evt) {
	evt.preventDefault();
    }
    
    if (ptcanvas) {
	if (isIPad() || isIPhone()) {
	    carcan.ontouchstart = touchDown;
	    carcan.ontouchmove = touchDrag;
	    carcan.ontouchend = touchUp;
	} else {
	    carcan.onmouseup = mouseUp;
	    carcan.onmousemove = mouseMove;
	    carcan.onmousedown = mouseDown;
	    carcan.onmouseout = mouseOut;
	}
    }
    
    trackSelected = document.getElementById("tracks").selectedIndex;
    background = new blankBackground();
    
    // create tracks
    if (trackSelected==0) {
	sqtrack1 = new sqtrack();
	nodeArray = [];
	background.draw(ptcontext);
	sqtrack1.draw(trcontext);
	getSqNodes();
    } else if (trackSelected==1) {
	fig8track1 = new fig8track();
	nodeArray = [];
	background.draw(ptcontext);
	fig8track1.draw(trcontext);
	getfig8Nodes();
    } else {
	cornertrack1 = new cornertrack();
	nodeArray = [];
	background.draw(ptcontext);
	cornertrack1.draw(trcontext);
	getCornerNodes();
    }
    
    // create entities
    player1 = new playerCar(600, 173, 0, 0, Math.PI/2, 0); // x, y, vel, acc, heading, currNode
    player1.draw(carcontx);
    
    drawing = false;  // sets drawing flag to false
    wipeMessages();
}

function isIPad() {
    return (navigator.userAgent.indexOf("iPad") != -1);
}

function isIPhone() {
    return (navigator.userAgent.indexOf("iPhone") != -1);
}

//// RADIANS TO DEGREES CONVERSION
//function ra_de(ra) {
//    var pi = Math.PI;
//    var deg = ra * (180/pi);
//    return deg;
//}
//// DEGREES TO RADIANS CONVERSION
//function de_ra(de) {
//    var pi = Math.PI;
//    var ra = de * (pi/180);
//    return ra;
//}

//-----------------------//
//    RACE FUNCTION!!    //
//-----------------------//
function race() {
    var button = document.getElementById('Race');
    if (player1.goFlag == 0) {
	result = "win";
	//writeIMG(result);
	stopCar();
	stopClock(result);
	stopTimer();
    } else if (player1.goFlag == 2) {
	result = "fail";
	//writeIMG(result);
	stopCar();
	stopClock(result);
	stopTimer();
    } else {
        button.disabled = true;
        
        player1.goFlag = endcheck();
        // CHECK COLOR AND UPDATE MAX VELOCITY
        var colorAhead = colorcheck(2);
        if (!graphMade) {			// if driving by paint
	    switch (colorAhead.data[0]) {	// set maxvel based on color
		case 124: //VIOLET
		    player1.maxvel = 1;
		    break;
		case 52: //BLUE
		    player1.maxvel = 3;
		    break;
		case 84: //CYAN
		    player1.maxvel = 5;
		    break;
		case 241: //ORANGE
		    player1.maxvel = 7;
		    break;
		case 215: //RED
		    player1.maxvel = 9;
		    break;
		case 0: //BLACK
		    player1.maxvel = 15;
		    break;
	    }
	    if ((player1.vel - player1.maxvel) >= 3){   // if you try to slow down too quickly, crash
		toggle("speedMessage");
		player1.goFlag = 2;
	    } else if ((player1.vel - player1.maxvel) >= 0.5){  // if you're moving to a slower color, slow down
		player1.vel -= 0.1;
	    } else {
	    player1.vel += 0.05;			// otherwise, speed up at this rate
	    }
    
	} else {
	    player1.grabNodeValues();		// if driving by graph
	    if (player1.accel > 0 && player1.vel > player1.maxvel){	// if you've reached max speed, set to max speed
		player1.vel = player1.maxvel;
	    } else if (player1.accel < 0 && player1.vel < player1.maxvel){ // if you've reached a min speed, set to that min speed
		player1.vel = player1.maxvel;
	    } else {
	    player1.vel += (player1.accel * .1)  // otherwise, change vel according to accel factor
	    }
	}
        player1.checkNode(player1.x, player1.y);
        player1.update();
        carcontx.clearRect (0, 0, WIDTH, HEIGHT);
        player1.draw(carcontx);
	updateTimer();
	updateClock();
    }
}

function tick() {
    startTimer();
    startClock();
    player1.raceCar = setInterval(race, 30);
}

function endcheck() {
    var colorAhead = colorcheck(1);
    if (colorAhead.data[0] == 204 && colorAhead.data[1] == 255) {
        toggle("finishMessage");
        return 0;
    } else if (colorAhead.data[0] == 25){
        toggle("crashMessage");
        return 2;
    } else {
        return 1;
    }
    return null;
}

function colorcheck(layer) {
    if (layer==1){
	return trcontext.getImageData((player1.x + player1.xvel), (player1.y + player1.yvel), 1, 1);
    } else {
	return ptcontext.getImageData((player1.x + player1.xvel), (player1.y + player1.yvel), 1, 1);
    }
}

function toggle(ID) {
    var ele = document.getElementById(ID);
    if(ele.style.display == "none") {
	ele.style.display = "block";
    }
    else {
	ele.style.display = "none";
    }
}

function toggleButton(ID) {
    var ele = document.getElementById(ID);
    ele.disabled = !ele.disabled;
}

function toggleZ(ID){
    var ele = document.getElementById(ID);
    switch (ele.style.zIndex) {
	case "5":
	    ele.style.zIndex = "0"; // if graph up, move down
	    break;
	case "6":
	    ele.style.zIndex = "1";
	    break;
	case "0":
	    ele.style.zIndex = "5"; // if graph down, move up
	    break;
	case "1":
	    ele.style.zIndex = "6";
	    break;
    }
    
}

function toggleHelp(){
    var ele = document.getElementById("help");
    var ele2 = document.getElementById("helpButton");
    if(ele.style.display == "none") {
	ele.style.display = "block";
    }
    else {
	ele.style.display = "none";
    }
    if (ele2.innerHTML == "Hide Help"){
	ele2.innerHTML = "Show Help";
    } else {
	ele2.innerHTML = "Hide Help";
    }
}

function initializeClocks() {
    clockRunning = false;
    timerRunning = false;
    clock = 0;
    if (trackSelected==0){
	timer = 13;
    } else {
	timer = 20;
    }
    document.getElementById("timer").innerHTML = "Curr Time = 0.00";
}

function stopClock(result) {
    if (clockRunning) {
	clockRunning = false;
	if (result == "win"){
	    document.getElementById("lastTime").innerHTML = "Last Time = " + clock;
	    if (savedTime == null || clock < savedTime) {
		savedTime = clock;
		document.getElementById("bestTime").innerHTML = "Best Time = " + savedTime;
	    }
	}
    }
}

function startClock(){
    if (clockRunning == false) {
	clockRunning = true;
	clock = 0;
    }
}

function updateClock() {
    if (clockRunning) {
	clock = Math.round((clock + 0.03) * 100)/100;
	document.getElementById("timer").innerHTML = "Curr Time = " + clock;
    }
}

function startTimer() {
    if (trackSelected==0){
	timer = 13;
    } else {
	timer = 18;
    }
    timerRunning = true;
}

function stopTimer() {
    if (timerRunning){
	timerRunning = false;
    }
}

function updateTimer() {
    if (timerRunning){
	if (timer <= 0) {
	    stopTimer();
	    stopClock();
	    toggle("timeMessage");
	    player1.goFlag = 2;
	} else {
	    timer = Math.round((timer - 0.03) * 100)/100;
	}
    }
}

//-----------------------//
//     EVENTS            //
//-----------------------//

function mouseDown(event) {
    if (!graphActive){
	// get the mouse location
	var mx = event.pageX;
	var my = event.pageY;
	var r = 20;
	if (!drawing) {
	    drawing = true;
	    paint(mx, my, r);
	}
    }
}

function mouseMove(event) {
    if (!graphActive){
	var mx = event.pageX;
	var my = event.pageY;
	var r = 20;
	if ( drawing ) {  // check drawing flag
	    paint(mx, my, r);
	}
    }
}

function mouseUp(event) {
    if (!graphActive){
    drawing = false; // on mouseup, set the drawing flag to false
    }
}

function mouseOut(event) {
    if (!graphActive){
	drawing = false;
    }
}

function touchDown(event) {
    if (!graphActive){
	// get the mouse location
	for (var i=0; i<event.changedTouches.length; i++) {
	    var t = event.changedTouches[i];
	    var tx = t.pageX;
	    var ty = t.pageY;
	    var r = 20;
	    drawing = true;
	    paint(tx, ty, r);       
	}
    }
}

function touchDrag(event) {
    if (!graphActive){
	for (var i=0; i<event.changedTouches.length; i++) {
	    var t = event.changedTouches[i];
	    var tx = t.pageX;
	    var ty = t.pageY;
	    var r = 20;
	    if (drawing ) {
		paint(tx, ty, r);
	    }        
	}
    }
}

function touchUp(event) {
    if (!graphActive){
	if (event.touches.length == 0) {
	    drawing = false;
	}
    }
}

//-----------------------//
//   BUTTON FUNCTIONS    //
//-----------------------//

function wipePaint() {
    var r=confirm("Are you sure you want to clear the paint from the track?");
    if (r==true){
	background.draw(ptcontext);
	//sqtrack1.draw(trcontext);
	player1.draw(carcontx);
	//nodeDraw();
	wipeMessages();
    }
}

function resetCar() {
    //writeIMG(result);
    stopCar();
    initializeClocks();
    carcontx.clearRect (0, 0, WIDTH, HEIGHT);
    player1 = new playerCar(600, 173, 0, 0, Math.PI/2, 0); // x, y, vel, acc, heading, currNode
    player1.draw(carcontx);
    dataArray = [0];
    graphupdate();
    wipeMessages();
}

function wipeMessages(){
    var mess1 = document.getElementById("crashMessage");
    var mess2 = document.getElementById("speedMessage");
    var mess3 = document.getElementById("finishMessage");
    var mess4 = document.getElementById("timeMessage");
    if (mess1.style.display == "block" || mess2.style.display == "block" || mess3.style.display == "block" || mess4.style.display == "block") {
        mess1.style.display = "none";
        mess2.style.display = "none";
        mess3.style.display = "none";
	mess4.style.display = "none";
    }
}

function clearImages(){
    document.getElementById("square").style.display = "none";
    document.getElementById("fig8").style.display = "none";
    document.getElementById("corners").style.display = "none";
}

function selectTrack(){
    trackSelected = document.getElementById("tracks").selectedIndex;
}

function toggleTrackImages(){
    switch (trackSelected){
	case 0:
	    toggle("square");
	    break;
	case 1:
	    toggle("fig8");
	    break;
	case 2:
	    toggle("corners");
	    break;
    }
}

// UNUSED
function writeIMG(result) {
    var canvas = document.getElementById("paint");
    var trackname = trackSelected;
    var id = "test1";
    var timestamp = new Date().getTime();
    var img = canvas.toDataURL("image/png");
    var xmlhttp;
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    //xmlhttp.onreadystatechange = function() {
    //    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
    //        document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
    //    }
    //}
    xmlhttp.open("POST","img-post.php",true);
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send('id=' + id + '&result=' + result + '&time=' + timestamp + '&img=' + img);
}

function stopCar(){
    var button = document.getElementById('Race');
    clearInterval(player1.raceCar);
    button.disabled = false;
}
//-----------------------//
//  GRAPHING FUNCTIONS   //
//-----------------------//

function graphinit() {
    
    var graphcanvas = document.getElementById("graph");
    graphcanvas.width = GWIDTH;
    graphcanvas.height = GHEIGHT;
    gcontext = graphcanvas.getContext('2d');
    
    dataArray = [0];

    var graph = getGraph('graph', dataArray);
    graph.Draw();
}

function getGraph(id, data) {
    var graph = new RGraph.Line("graph", dataArray);
    //var gcolor = velcheck();
    graph.Set('chart.background.barcolor1', 'rgba(255,255,255,1)');
    graph.Set('chart.background.barcolor2', 'rgba(255,255,255,1)');
    graph.Set('chart.background.grid.color', 'rgba(238,238,238,1)');
    //graph.Set('chart.text.color', 'rgba(255,255,255,1)');
    graph.Set('chart.colors', ['rgba(255,0,0,1)']);
    graph.Set('chart.linewidth', 2);
    graph.Set('chart.filled', false);
    graph.Set('chart.title.yaxis', 'Velocity');
    graph.Set('chart.title.xaxis', 'Time');
    graph.Set('chart.gutter', 50);
    graph.Set('chart.crosshairs', true);
    
    return graph;
}

function graphupdate() {
    RGraph.Clear(document.getElementById("graph"));
    var graph = getGraph('graph', dataArray);
    graph.Draw();
}

// UNUSED
function velcheck() {
    if (player1.vel < 1) {
        return "violet";
    }
    if (player1.vel < 2) {
        return "blue";
    }
    if (player1.vel < 3) {
        return "cyan";
    }
    if (player1.vel < 4) {
        return "orange";
    }
    if (player1.vel < 5) {
        return "red";
    }
    if (player1.vel > 5) {
        return "black";
    }
}

//-------------------//
//  BUTTON FUNCTIONS //
//-------------------//

function paintMode() {
//    if (graphMade){
//	var r = confirm("Returning to paint mode will reset the graph!  Are you sure you want to continue?");
//    }
    resetCar();
    clearGraph();
    document.getElementById("Clear").disabled = false;
    document.getElementById("Reset").disabled = false;
    document.getElementById("Race").disabled = false;
    document.getElementById("resetGraph").style.display = "none";
    document.getElementById("paintMode").style.display = "none";
    document.getElementById("returnGraph").style.display = "none";
    document.getElementById("exportGraph").style.display = "none";
    document.getElementById("graphMode").style.display = "block";
    document.getElementById("square").style.display = "none";
    document.getElementById("corners").style.display = "none";
    document.getElementById("fig8").style.display = "none";
    document.getElementById("graphback").style.zIndex = 0;
    document.getElementById("graphnodes").style.zIndex = 1;
    graphActive = false;
    graphMade = false;
    // clear, reset, race active
    // resetGraph, paintMode, returnGraph, exportGraph hidden
    // graphMode show
}

function graphMode(){
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
    document.getElementById("graphback").style.zIndex = 5;
    document.getElementById("graphnodes").style.zIndex = 6;
    if (activeNode == 0){
	graphSetup();
    }
    graphActive = true;
    // When graphActive = false
    //// clear, reset, race disabled
    //// resetGraph, paintMode, exportGraph show
    //// graphMode, returnGraph hidden
    
    // When graphActive = true
    //// clear, reset, race active
    //// resetGraph, exportGraph, graphMode hidden
    //// paintMode, returnGraph show
}