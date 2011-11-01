canvas=document.getElementById("canvas").getContext("2d");
info=document.getElementById("info")
var RoadLines = 300;
var skyclr = 'rgb(100,150,255)';
var grassclr = 'rgb(25,150,25)';
var roadclr = 'rgb(0,0,0)';
var stripeclr = 'rgb(200,255,50)';
var acting = [false,false,false,false]; //left up right down
var ResX = 600
var ResY = 600
var	X = ResX / 2;
var	y = ResY/20
var	halfWidth = 350;
var	stripeWidth=halfWidth/30
var	screenLine = ResY - 1;
var	yfactor;
var DX;
var DDX;
var halfWidth;
var widthStep;
var stripeFlag=true;
var stripeCount;
var stripeWidth;
var yfactor;
var car = new Image();
var carleft = new Image();
var carright = new Image();
carright.src="carspriteright.png";
carleft.src="carspriteleft.png";
car.src="carsprite.png";


curtrack = new track();
curplayer = new player();

setTimeout(draw(),100);


function part(length,icurvature,fcurvature,curvature){
	this.partlength=length;
	this.icurvature=icurvature;
	this.fcurvature=fcurvature;
	this.curvature=curvature;
	this.dpos=0;
	this.nextDDX = function(){return(0)};
	this.init = function(){
		if (fcurvature>icurvature){
			this.nextDDX = function(){
				this.dpos+=1;
				return((this.dpos+this.icurvature)*.0001*curvature);
			}
		}
		else if (fcurvature>icurvature){
			this.nextDDX = function(){
				this.dpos+=1;
				return((this.dpos+this.icurvature)*.0001*curvature);
			}
		}
		else {
			this.nextDDX=function(){return(0)}
		}
		info.innerText="init";
	}
}

function track(){
	
	this.map=[new part(40,0,0,0),new part(40,0,20,20),new part(100,0,0,0)]
	for (var i = 0;i<this.map.length;i++){
		this.map[i].init();
		
	}
	this.frameRate=50;
	
	
}


function draw(){
	//draw the sky
	canvas.strokeStyle=skyclr;
	for (var A = 1;A<= RoadLines;A++){
		drawline(canvas,0, A,ResX - 1, A)
	}

	//curve the road
	try{
	DDX = curtrack.map[player.pos].nextDDX();}
	catch(err){//info.innerText="outmoet"
	}
	DX=0;
	yfactor=curplayer.vel/10;
	X = ResX/2;
	y = ResY/20
	halfWidth = 350;
	stripeWidth=halfWidth/30
	screenLine = ResY - 1;

	for (var A = 1;A<= RoadLines;A++){

		canvas.strokeStyle=roadclr;
		drawline(canvas,X - halfWidth, screenLine,X + halfWidth, screenLine);
		canvas.strokeStyle=grassclr;
		info.innerText=screenLine+" "+X+" "+(ResX-1);
		drawline(canvas,0, screenLine,X - halfWidth, screenLine);
		drawline(canvas,X + halfWidth, screenLine,ResX - 1, screenLine);
		
		if (stripeFlag && stripeCount > 0) {
		canvas.strokeStyle=stripeclr;
		drawline(canvas,X - stripeWidth, screenLine,X + stripeWidth, screenLine);
		stripeCount += 1;
		} else if (!stripeFlag && stripeCount > 0) {
		stripeCount += 1;
		}
		if (stripeCount > y) {
		stripeCount = 1;
		stripeFlag = !stripeFlag;
		y -= curplayer.vel/10;
		}
		
		halfWidth = halfWidth - widthStep
		stripeWidth=halfWidth/30
		screenLine = screenLine - 1
		
		DX = DX + DDX
		X = X + DX

	}
	//var str = "acting: " + acting[0]+ acting[1]+ acting[2]+ acting[3];
	//info.innerText="Index: "+ curtrack.playerPos + " Pos: " + Map[curtrack.playerPos]+ " DDX: " + DDX + "\nDX: " + DX + " X: " + X +" dcurtrack.playerPos:"+dpos + " curvature: "+curvature;
	curtrack.map[curplayer.pos].dpos+=curplayer.vel;
	
	if (curtrack.map[curplayer.pos].dpos >=curtrack.map[curplayer.pos].partlength) {
		nextpart();
	}
	/*
	dpos=dpos+vel;

	xcoord+=sidevel;
	
	if (Math.abs(DX)>Math.abs(sidevel)){
	ycoord=ycoord-vel*2;
	imgscale = imgscale-vel/125;
	}	
	*/
	canvas.drawImage(curplayer.orient,curplayer.x,curplayer.y,curplayer.width*curplayer.scale,curplayer.height*curplayer.scale);
	
	setTimeout(draw,this.frameRate);
}


function player(){
	this.vel = 0;
	this.acc = .02;
	this.decel = .01
	this.brakeacc = 1;
	this.pos = 0;
	this.x = 240;
	this.y = 450;
	this.orient = new Image();
	this.orient=car;
	this.sidevel = 0;
	this.sideacc = .5;
	this.sidedecel = 1;
	this.scale = 1;
	this.width=120;
	this.height=90;
	this.forces = [false,false,false,false];

	this.avp = function(){
		if (acting[1]){
			vel=vel+acc;
		}
		else {
			vel=vel-decel;
			if (acting[3]){
				vel=vel-acc;
			}
			if(vel<0){
				vel=0
			}	
		}

		if (acting[0]==true){
			sidevel-=sideacc;
		}
		else if (acting[2]==true){
			sidevel+=sideacc;
		}
		else {
			if (sidevel<0){
				sidevel+=sidedecel;
			}
			else if (sidevel>0){
				sidevel-=sidedecel;
			}
			if (Math.abs(sidevel)<1){
				sidevel=0;
			}
		}
		setTimeout(avp,50);
	}
	
}

function nextpart(){
curtrack.playerPos=curtrack.playerPos+1;
curtrack.playerPos=curtrack.playerPos%track.Map.length;
dpos=0;
}

function drawline(contextO, startx, starty, endx, endy) {
  contextO.beginPath();
  contextO.moveTo(startx, starty);
  contextO.lineTo(endx, endy);
  contextO.closePath();
  contextO.stroke();
}