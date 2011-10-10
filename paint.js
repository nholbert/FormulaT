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

var drawing;

var touchable = "createTouch" in document;

function init() {
    setup();
    graphinit();
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
    var result;
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
        switch (colorAhead.data[0]) {
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
        if ((player1.vel - player1.maxvel) >= 3){
            toggle("speedMessage");
            player1.goFlag = 2;
        }
        if (player1.vel > player1.maxvel) { // sets a max speed
            player1.vel -= 0.1;
            //player1.vel = player1.maxvel;
        } else {
            player1.vel += 0.05;
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

function toggle(messID) {
        var ele = document.getElementById(messID);
	if(ele.style.display == "none") {
    	    ele.style.display = "block";
  	}
	else {
	    ele.style.display = "none";
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
    // get the mouse location
    var mx = event.pageX;
    var my = event.pageY;
    var r = 20;
    if (!drawing) {
        drawing = true;
        paint(mx, my, r);
    }
}

function mouseMove(event) {
    var mx = event.pageX;
    var my = event.pageY;
    var r = 20;
    if ( drawing ) {  // check drawing flag
        paint(mx, my, r);
    }
}

function mouseUp(event) {
    drawing = false; // on mouseup, set the drawing flag to false
}

function mouseOut(event) {
    drawing = false;
}

function touchDown(event) {
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

function touchDrag(event) {
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

function touchUp(event) {
    if (event.touches.length == 0) {
        drawing = false;
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
    //writeIMG();
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

function selectTrack(){
    trackSelected = document.getElementById("tracks").selectedIndex;
}

// UNUSED
function writeIMG(result) {
    var canvas = document.getElementById("world");
    var id = null;
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
    xmlhttp.open("POST","/rigd/FormulaT/img-post.php",true);
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send('id=' + id + '&results=' + result + '&time=' + timestamp + '&img=' + img);
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
    var gcolor = velcheck();
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