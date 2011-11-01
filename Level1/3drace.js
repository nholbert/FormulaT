canvas=document.getElementById("canvas").getContext("2d");
info=document.getElementById("info")
//lines for road
var RoadLines = 300
var ScrollSpeed = 5
var RoadY = -1        //arbitrary
var partlength=40;
var curvature=1;
//pixel width and height
var ResX = 600
var ResY = 600
var PlrLine = 8       //What line is the player sprite on?
//array of road lines
var ZMap = new Array(RoadLines)
var Map=[0, -15, 0, 0, 0, 0, 0, -20, 0, 0, 0, -20, 0, 0, 0, 0, 0, -20,0,0]
//var curvefuncs=[]
var acting = [false,false,false,false]; //left up right down
var pos = 0;
var dpos=1;
var skyclr = 'rgb(100,150,255)';
var grassclr = 'rgb(25,150,25)';
var roadclr = 'rgb(0,0,0)';
var stripeclr = 'rgb(200,255,50)';
var acc = .02;
var brakeacc=1;
var decel = .01;
var vel = 0;
var car = new Image();
var carleft = new Image();
var carright = new Image();
carright.src="carspriteright.png";
carleft.src="carspriteleft.png";
car.src="carsprite.png";
var imgwidth;
var imgheight;
var carpos;
var carorient = new Image();
carorient=car;
imgwidth=120
imgheight=90;
var xcoord = 240;
var ycoord = 450;
var sidevel = 0;
var sideacc = .5;
var sidedecel = 1;
var imgd;
var imgscale = 1;


//Initialize ZMap
//with this equation Z = Y_world / (Y_screen - (height_screen / 2))
for (var A = 1;A<= RoadLines;A++){
        ZMap[A] = RoadY / (A - (ResY / 2))
}

//Normalize ZMap so the line with the player on it is scale=1 (or would be
//If we had a player sprite :))
b = 1 / ZMap[PlrLine]
b = b * 100   //in percents because QBasic's MOD is lame

for (var A = 1;A<= RoadLines;A++){
        ZMap[A] = ZMap[A] * b
}

//320x200x4bpp
var SCREEN= 7;

//Draw the road
var X;
var DX;
var DDX;
var HalfWidth;
var SegY=RoadLines;
var NextStretch = "Straight"

var WidthStep = 1

//draw light blue sky above road
DX = 0;
    //This controls the steepness of the curve
var stripeflag=true;
var stripecount=1;
var y;
var tick=1;

	
update();
avp();
checkbounds();
function update(){
	canvas.strokeStyle=skyclr;

	for (var A = 1;A<= RoadLines;A++){
		drawline(canvas,0, A,ResX - 1, A)
	}

	//Set up the frame
	DDX = (-1*Math.abs(dpos-partlength/2)+partlength/2)*.0001*curvature;
	DX=0;
	X = ResX / 2;
	y= ResY/20
	HalfWidth = 350;
	StripeW=HalfWidth/30
	ScreenLine = ResY - 1;
	yfactor=vel/10;
	if ((Map[pos]<0)&&(DDX>0)){
		DDX=DDX*-1;
	}
	if ((Map[pos]>0)&&(DDX<0)){
		DDX=DDX*-1;
	}
	if (Map[pos] == 0){
		DX=0;
	}
	for (var A = 1;A<= RoadLines;A++){

		canvas.strokeStyle=roadclr;
		drawline(canvas,X - HalfWidth, ScreenLine,X + HalfWidth, ScreenLine);
		canvas.strokeStyle=grassclr;
		drawline(canvas,0, ScreenLine,X - HalfWidth, ScreenLine);
        drawline(canvas,X + HalfWidth, ScreenLine,ResX - 1, ScreenLine);
		
		if (stripeflag && stripecount > 0) {
		canvas.strokeStyle=stripeclr;
		drawline(canvas,X - StripeW, ScreenLine,X + StripeW, ScreenLine);
		stripecount += 1;
	    } else if (!stripeflag && stripecount > 0) {
		stripecount += 1;
	    }
	    if (stripecount > y) {
		stripecount = 1;
		stripeflag = !stripeflag;
		y -= vel/10;
	    }
		
        HalfWidth = HalfWidth - WidthStep
		StripeW=HalfWidth/30
        ScreenLine = ScreenLine - 1
		if (Map[pos]!=0) {
            DX = DX + DDX
		}
		X = X + DX

	}
	//var str = "acting: " + acting[0]+ acting[1]+ acting[2]+ acting[3];
	//info.innerText="Index: "+ pos + " Pos: " + Map[pos]+ " DDX: " + DDX + "\nDX: " + DX + " X: " + X +" dpos:"+dpos + " curvature: "+curvature;
	
	
	dpos=dpos+vel;
	if (dpos >=partlength) {
		nextpart();
	}
	xcoord+=sidevel;
	
	if (Math.abs(DX)>Math.abs(sidevel)){
	ycoord=ycoord-vel*2;
	imgscale = imgscale-vel/125;
	}	
	canvas.drawImage(carorient,xcoord,ycoord,imgwidth*imgscale,imgheight*imgscale);
setTimeout(update,50);
}

function nextpart(){
pos=pos+1;
pos=pos%20;
curvature = Math.abs(Map[pos]);
dpos=0;
}

function checkbounds(){
	
	setTimeout(checkbounds,50);
	}

	
	
document.onkeydown = Keyon;  
document.onkeyup= Keyoff;
	function Keyon(){
		var KeyID = event.keyCode;
		switch(KeyID)
		{
			case 37:
			acting[0]=true;
			carorient=carleft;
			imgwidth=carorient.width;
			imgheight=carorient.height;
			break;
			case 38:
			acting[1]=true;
			break
			case 39:
			acting[2]=true;
			carorient=carright;
			imgwidth=carorient.width;
			imgheight=carorient.height;
			break;
			case 40:
			acting[3]=true;
			break;
		}
	}
	function Keyoff(){
		var KeyID = event.keyCode;
		switch(KeyID)
		{
			case 37:
			acting[0]=false;
			carorient=car;
			imgwidth=carorient.width;
			imgheight=carorient.height;
			break;
			case 38:
			acting[1]=false;
			break
			case 39:
			acting[2]=false;
			carorient=car;
			imgwidth=carorient.width;
			imgheight=carorient.height;
			break;
			case 40:
			acting[3]=false;
			break;
		}
	}
	


function avp(){

try {
imgd=canvas.getImageData(xcoord,ycoord,1,1).data;
}
catch(err)
{
info.innerText=err;
}
if (imgd[1]==0){
//info.innerText="acting: " + acting[0]+ acting[1]+ acting[2]+ acting[3] +" pos: "+pos+" dpos: "+dpos+ " vel "+vel+" sidevel: "+sidevel+ " DX: "+DX+" img "+imgd[0]+" "+imgd[1]+" "+imgd[2]+" "+imgd[3];
}
else{
info.innerText="offroad!"
}

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

function drawline(contextO, startx, starty, endx, endy) {
  contextO.beginPath();
  contextO.moveTo(startx, starty);
  contextO.lineTo(endx, endy);
  contextO.closePath();
  contextO.stroke();
}