//----------//
// ENTITIES //
//----------//

function node(x, y, id, vel, accel) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.vel = vel;
    this.accel = accel;
}

function playerCar(x, y, vel, accel, heading, currNode){
    this.goFlag = 1;
    this.raceCar = 0;
    this.x = x;
    this.y = y;
    this.vel = vel;
    this.maxvel = 10;
    this.accel = accel;
    this.heading = heading;
    // x & y components of velocity
    this.xvel = Math.cos(this.heading) * this.vel;
    this.yvel = -Math.sin(this.heading) * this.vel;
    this.currNode = currNode;
    
    this.img = document.getElementById('racecar');
    this.draw = function draw(carcontx) {
	var nearNode = nodeArray[this.currNode];
	var diffx = this.x - nearNode.x;
        var diffy = this.y - nearNode.y;

	carcontx.save();
	carcontx.translate(this.x, this.y);
	carcontx.rotate(this.heading - Math.PI/2 );
        carcontx.drawImage(this.img, -10, -16.5, 20, 33);
	carcontx.restore();
	
	/*--DRAW DIRECTION LINE
	carcontx.strokeStyle = "yellow";
	carcontx.beginPath();
	carcontx.moveTo(this.x, this.y);
	carcontx.lineTo(nearNode.x, nearNode.y);
	carcontx.stroke();
	--*/
    }
    
    this.checkNode = function (x, y) {
        var nearNode = nodeArray[this.currNode];
        var diffx = x - nearNode.x;
        var diffy = y - nearNode.y;
        var diffhyp = Math.sqrt(Math.pow(diffx, 2) + Math.pow(diffy, 2));
        if (this.currNode == 0 && diffhyp > 15){
            this.headingAdjust(diffx, diffy);
	} else if (diffhyp < 50) {
            if (this.currNode == 19) {
		lastFlag = true;
                this.currNode = 0;
                this.headingAdjust(diffx, diffy);
            } else {
                this.currNode += 1;
                nearNode = nodeArray[this.currNode];
                diffx = x - nearNode.x;
                diffy = y - nearNode.y;
                this.headingAdjust(diffx, diffy);
            }
	} else {
	    this.headingAdjust(diffx, diffy);
	}
    }
    
    this.headingAdjust = function (diffx, diffy) {
	var dAngle = Math.atan2(diffy, diffx);
	if (this.heading!= dAngle) {
	    if (Math.abs(this.heading - dAngle) > (3*Math.PI/2)) {
		if (this.heading > 0) {
		    dAngle = dAngle + 2*Math.PI;
		} else {
		    dAngle = dAngle - 2*Math.PI;
		}
	    }
	    this.heading += (dAngle - this.heading)/18; // change to tweak how much the car turns
	}
    }
    
    this.update = function() {
        this.xvel = Math.cos(this.heading) * this.vel;
        this.yvel = -Math.sin(this.heading) * this.vel;
        this.x -= this.xvel;
        this.y += this.yvel;
        dataArray.push(this.vel);
	if (dataArray.length > 100){
	    dataArray.shift();
	}
        graphupdate();
    }
    
    this.grabNodeValues = function() {
	if (lastFlag) {
	    this.maxvel = nodeArray[nodeArray.length - 1].vel;;
	    this.accel = nodeArray[nodeArray.length - 1].accel;
	} else {
	    this.maxvel = nodeArray[this.currNode].vel;
	    this.accel = nodeArray[this.currNode].accel;
	}
    }
}