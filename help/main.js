var WIDTH = 700;
var HEIGHT = 450;

var WATER_LINE = HEIGHT / 2;

var wave;
var boat;
var context;

var touchable = "createTouch" in document;

if(touchable) {
    canvas.addEventListener( 'touchstart', onTouchStart, false );
    canvas.addEventListener( 'touchmove', onTouchMove, false );
    canvas.addEventListener( 'touchend', onTouchEnd, false );
}

function setup() {
    var canvas = document.getElementById("world");
    
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    
    context = canvas.getContext('2d');
    
    //wave setup
    wave = new Wave();
    
    //boat setup
    boat = new Boat (100, (WATER_LINE + 20));
    
    // every 30ms, animate the wave
    setInterval(tick, 30);
    
    // every 2 seconds insert a random twitch into the wave
    //setInterval( twitch, 2000 );
    
    if(touchable) {
        // touch event
        canvas.ontouchstart = touchStart;
    } else {
        // mouse event
        canvas.onmousedown = mouseDown;
    }
    
}

function Particle(x, y) {
    this.x = x;     // x coord
    this.y = y;     // y coord
    this.vy = 0;    // yvelocity
    this.vx = 0;    // xvelocity
    this.fy = 0;     // yforce
    this.mass = 10; // "mass" of particle

    this.animate = function(prev, next) {
        var forceY = 0;         //calculate some force
        
        // is there a particle connected to the left?
        if (prev) {
            forceY += 0.75 * ( this.y - prev.y );
        }
        
        // is there a particle connected to the right?
        if (next) {
            forceY += 0.75 * ( this.y - next.y );
        }
        
        // pull toward the natural water line
        forceY += 0.05 * ( this.y - WATER_LINE );
        
        // add the accumlated forces to velocity
        this.vy -= forceY / this.mass + this.fy;
        
        //friction to keep things smooth
        this.vy /= 1.14;
        this.fy /= 1.14;
        
        // update the y-coord based on the velocity
        this.y += this.vy;
    }
}

function Boat(x, y) {
    this.x = x;     // x coord
    this.y = y;     // y coord
    this.vy = 0;    // yvelocity
    this.vx = 0;    // xvelocity
    this.fy = 0;     // yforce
    this.mass = 10; // "mass" of particle
    
    this.draw = function draw(context) {
        context.fillStyle = "#FF0000"; // red
        context.beginPath();
        
        context.moveTo(this.x, this.y);
        context.lineTo(100, (this.y - 50));
        context.lineTo(150, (this.y - 50));
        context.lineTo(150, this.y);
        
        context.fill();
    }
    
    this.animate = function() {
        var p = wave.getClosestParticle(x);
        this.y = (p.y + 20);
    }
}

function Wave() {
    
    // array of particles
    this.particles = [];
    
    // Generate 20 particles
    var px = 0;
    for (var i = 0; i < 20; i++) {
        this.particles.push( new Particle (px, WATER_LINE));
        px += WIDTH / 19;
    }
    
    //--------------------
    //  Animate function
    //--------------------
    this.animate = function() {
        // just call animate for each particle in turn
        for (var i = 0; i < this.particles.length; i++) {
            var curr = this.particles[i];
            var prev = this.particles[i-1];
            var next = this.particles[i+1];
            curr.animate(prev, next);
        }
    }
    
    //--------------------
    //  Draw Function
    //--------------------
    this.draw = function draw(context) {
        context.fillStyle = "#00AABB";  // sea blue
        context.beginPath();
        
        // start drawing at the first particle
        context.moveTo(this.particles[0].x, this.particles[0].y);
        
        // add lines connecting to the particles
        var curr, prev;
        for (var i = 1; i < this.particles.length; i++) {
            curr = this.particles[i];
            prev = this.particles[i-1];
            
            context.quadraticCurveTo(prev.x, prev.y,
                                     prev.x + (curr.x - prev.x) / 2,
                                     prev.y + (curr.y - prev.y) / 2);
        }
        
        // finish drawing the path around the bottom of the screen
        context.lineTo(curr.x, curr.y);
        context.lineTo(WIDTH, HEIGHT);
        context.lineTo(0, HEIGHT);
        context.lineTo(this.particles[0].x, this.particles[0].y);
        context.fill();
    }
    
    //--------------------
    // getClosestParticle function
    //--------------------
    this.getClosestParticle = function(x) {
        var len = this.particles.length;
        var index = Math.round( x / WIDTH * (len - 1));
        return this.particles[index];
    }
}

function tick() {
    context.clearRect(0, 0, WIDTH, HEIGHT); // clear the screen
    wave.animate();
    wave.draw(context);
    boat.animate();
    boat.draw(context);
}

function twitch() {
    // add a little force to a random particle
    var p = wave.getClosestParticle(Math.random() * WIDTH);
    p.fy += (Math.random() * 20 - 10);
}

function mouseDown(event) {
    // get the mouse location
    var x = event.pageX;
    var y = event.pageY;
    
    // make splash
    var p = wave.getClosestParticle(x);
    if (y > WATER_LINE) {
        p.fy -= Math.random() * 8;    //move particles
    } else {
        p.fy += Math.random() * 8;
    }
}

function touchStart(event) {
    // get the mouse location
    var x = event.pageX;
    var y = event.pageY;
    
    // make splash
    var p = wave.getClosestParticle(x);
    if (y > WATER_LINE) {
        p.fy -= Math.random() * 8;    //move particles
    } else {
        p.fy += Math.random() * 8;
    }
}