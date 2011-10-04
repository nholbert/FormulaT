var WIDTH = 480;
var HEIGHT = 320;
var CWIDTH = 480;
var CHEIGHT = 320;
var GWIDTH;
var GHEIGHT;

var grass1;
var sky1;
var player1;
var track1;
var stripes1;

var touchable = "createTouch" in document;

function init() {
    setup();
    //graphinit();
}

function setup() {
    var canvas = document.getElementById("world");
    var carcan = document.getElementById("car");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    carcan.width = CWIDTH;
    carcan.height = CHEIGHT;
    context = canvas.getContext('2d');
    carcontx = carcan.getContext('2d');
    
    // Prevent elastic scrolling in iphone / ipad apps
    document.ontouchmove = function(evt) {
	evt.preventDefault();
    }
    
    //if (canvas) {
    //    if (isIPad() || isIPhone()) {
    //        carcan.ontouchstart = touchDown;
    //        carcan.ontouchmove = touchDrag;
    //        carcan.ontouchend = touchUp;
    //    } else {
    //        carcan.onmouseup = mouseUp;
    //        carcan.onmousemove = mouseMove;
    //        carcan.onmousedown = mouseDown;
    //        carcan.onmouseout = mouseOut;
    //    }
    //}
    
    // create entities
    player1 = new playerCar(280, 280, 1, 0, 0); // x, y, vel, acc, heading
    
    // create track pieces
    sky1 = new sky();
    grass1 = new grass();
    track1 = new track();
    stripes1 = new stripes();
    
    // color in track features
    grass1.draw(context);
    track1.draw(context);
    stripes1.stamp();
    sky1.draw(context);
    
    //player1.draw(carcontx);
    
}

function isIPad() {
    return (navigator.userAgent.indexOf("iPad") != -1);
}

function isIPhone() {
    return (navigator.userAgent.indexOf("iPhone") != -1);
}

//////////////////////

function sky() {
    this.draw = function draw(context) {
        context.fillStyle = "#BDD3FC";  // blue sky
        context.fillRect(0, 0, WIDTH, 80);
    }
}

function grass() {
    this.draw = function draw(context) {
	context.fillStyle = "#199B19"; // green grass
	context.beginPath();
	context.moveTo(0, 80);
	context.lineTo((WIDTH * 0.4), 80);
	context.lineTo((WIDTH * 0.1), 320);
	context.lineTo(0, 320);
	context.lineTo(0, 80);
	
	context.moveTo(480, 80);
	context.lineTo((WIDTH * 0.6), 80);
	context.lineTo((WIDTH * 0.9), 320);
	context.lineTo(480, 320);
	context.lineTo(480, 80);
	context.closePath();
	context.fill();
	
    }
}

function track() {
    this.draw = function draw(context) {
	context.fillStyle = "#000000"; // black track
	context.beginPath();
	context.moveTo((WIDTH * 0.4), 80);
	context.lineTo((WIDTH * 0.6), 80);
	context.lineTo((WIDTH * 0.9), 320);
	context.lineTo((WIDTH * 0.1), 320);
	context.closePath();
	context.fill();
    }
}

function stripes() {
    var stwidth = 1.5;
    var stheight = 15;
    var orgin = 0;
    var perspec = 2;
    this.stamp = function() {
	var orginSave = orgin;
	var stwidthSave = stwidth;
	var stheightSave = stheight;
	for (var i = 1; i < 20; i++) {
	    this.draw(context);
	    //this.grow();
	    orgin += stheightSave + stheight;
	    if (i == 19) {
		orgin = orginSave + player1.vel;
		//stwidth = stwidthSave + 0.015;
		//stheight = stheightSave + 0.15;
	    }
	}
    }
    this.draw = function draw(context) {
	context.fillStyle = "#FFFF00"; // yellow stripe
	context.beginPath();
	context.moveTo((WIDTH/2) - (stwidth/2), orgin);
	context.lineTo((WIDTH/2) - ((stwidth * perspec)/2), (orgin + stheight));
	context.lineTo((WIDTH/2) + ((stwidth * perspec)/2), (orgin + stheight));
	context.lineTo((WIDTH/2) + (stwidth/2), orgin);
	context.closePath();
	context.fill();
    }
    this.grow = function() {
	stwidth = stwidth * 1.3;
	stheight = stheight * 1.3;
    }
    this.resetCheck = function () {
	if (orgin > 90) {
	    stwidth = 1.5;
	    stheight = 15;
	    orgin = 0;
	}
    }
}

function playerCar(x, y, vel, accel, heading){
    var raceCar = 0;
    this.x = x;
    this.y = y;
    this.vel = vel;
    this.maxvel = 10;
    this.accel = accel;
    this.heading = heading;
}


//////////////////

function tick() {
    player1.raceCar = setInterval(race, 30)
}

function stopCar(){
    var button = document.getElementById('Race');
    clearInterval(player1.raceCar);
    button.disabled = false;
}

function race() {
    stripes1.resetCheck();
    track1.draw(context);
    stripes1.stamp();    
    sky1.draw(context);
}

function resetCar() {
    stopCar();
}

//////////////////

window.ondevicemotion = function (event) {
    var accelx = event.accelerationIncludingGravity.x;
    var accely = event.accelerationIncludingGravity.y;
    var ele = document.getElementById("accelvalue").innerHTML=accelx;
    if (player1.vel + accelx < 0) {
	player1.vel = 0;
    } else {
	player1.vel += accelx + 1;
    }
}