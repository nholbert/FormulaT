var WIDTH = 960;
var HEIGHT = 640;
var rdLines = HEIGHT / 2;
var scrollSpeed = 10;
var stripecount = 1;
var stripeflag = true;

var x = WIDTH;
var y = HEIGHT / 20;
var xpos = 1;
var raceInt;

var track1;

var skyclr = 'rgb(100,150,255)';
var grassclr = 'rgb(25,155,25)';
var roadclr = 'rgb(0,0,0)';
var stripeclr = 'rgb(200,255,50)';

function setup() {
    var canvas = document.getElementById("road");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    context = canvas.getContext('2d');

    track1 = new track();
    track1.draw(context);
    sky();
}

function track() {
    this.draw = function draw(context) {
	for (var i=0; i < rdLines; i++){
	    var grasslength = (WIDTH - x) / 2;
	    context.lineWidth = 1;
	    grass(grasslength, i);
	    road(grasslength, i);
	    if (stripeflag && stripecount > 0) {
		stripes(i);
		stripecount += 1;
	    } else if (!stripeflag && stripecount > 0) {
		stripecount += 1;
	    }
	    if (stripecount > y) {
		stripecount = 1;
		stripeflag = !stripeflag;
		y -= 1;
	    }
	    x -= 2;
	}
	//xpos += 1;
    }
}

function grass(grasslength, i){
    context.beginPath();
    context.strokeStyle = grassclr;
    context.moveTo(0, HEIGHT - i);
    context.lineTo(grasslength, HEIGHT - i);
    context.moveTo(x + grasslength, HEIGHT - i);
    context.lineTo(WIDTH, HEIGHT - i);
    context.stroke();
    context.closePath();
}

function road(grasslength, i){
    context.beginPath();
    context.strokeStyle = roadclr;
    context.moveTo(grasslength, HEIGHT - i);
    context.lineTo(x + grasslength, HEIGHT - i);
    context.stroke();
    context.closePath();
}

function stripes(i){
    var stripewidth = (x / 30);
    context.beginPath();
    context.strokeStyle = stripeclr;
    context.moveTo((WIDTH / 2) - (stripewidth / 2), HEIGHT - i);
    context.lineTo((WIDTH / 2) + (stripewidth / 2), HEIGHT - i);
    context.stroke();
    context.closePath();
}

function sky(){
    context.fillStyle = skyclr;
    context.fillRect(0, 0, WIDTH, (HEIGHT / 2) + 1);
}


//////////////////

function tick() {
    raceInt = setInterval("race()", 30)
}

function stopCar(){
    var button = document.getElementById('Race');
    button.disabled = false;
    clearInterval(raceInt);
}

function race() {
    var button = document.getElementById('Race');
    button.disabled = true;
    stripecount += 1;
    x = WIDTH;
    y = HEIGHT / 20;
    context.clearRect (0, (HEIGHT / 2) + 1, WIDTH, HEIGHT);
    sky();
    track1.draw(context);
}

function resetRace() {
    stopCar();
}

//////////////////