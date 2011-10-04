
function player(health,imgName,img,frameCount,x,y,p)
{
  this.exploded=0;
  this.health=health;
  this.x=x;
  this.y=y;
  this.image=img;
  this.currFrame=1;
  this.frameCount=frameCount;
  this.framecounttemp=frameCount;
  this.imgNameTemp=img.src;
  this.imgName=imgName;
  this.bullets = new Array(10);
  this.bullCount=0;
  this.addBullet=addBullet;
  this.bulletNumber=0;
  this.type=p;
  this.resetPlayer=resetPlayer;
  this.imgTemp=img;
  this.hit=0; 
  //methods
  
  this.move=move; 
  this.renderPlayer=renderPlayer;
  this.explode=explode;
  this.fire=fire;
  this.enemyfire=enemyfire; 
  this.used=1;
  this.explodefinished=0;

  img.style.visibility="visible";

}


function addBullet(bull){
 //if (bullCount <= 10){
   this.bullCount++;
   //alert(this.bullCount);
    this.bullets[this.bullCount-1]=bull;
   this.bullets[this.bullCount-1].image.style.top=100;

   
 //}
    
}

function move(x,y)
{
  this.x=x;
  this.y=y;
}

function renderPlayer(){
  
  this.image.position="absolute";
  this.image.style.left=this.x;
  this.image.style.top=this.y;
 
  if (this.x <= 0)
    this.x=40;

  if (this.frameCount > 1)
  	this.image.src="images/" +this.imgName + this.currFrame + ".bmp"
     

  if (this.exploded == 0) {
    this.currFrame++; 
 
    if (this.currFrame > this.frameCount) 
	 this.currFrame = 1;
   }

  //alert(this.exploded); 
  if (this.exploded==1){// && this.explodefinished==0){
   //  alert("x");
    if (this.currFrame > this.frameCount) 
    {
      this.health=0;
      currFrame = 1;
      this.explodefinished=1;
      this.used=0;
      //alert(this.explodefinished);
      //alert("x");
      this.frameCount=this.framecounttemp;
      this.image.src=this.imgNameTemp;
      //alert("x");
      this.exploded=0;
      //alert("h");
      //resetPlayer(4,-10);
      currFrame=1;
      this.image.style.visibility="hidden";

     if (this.type=="player"){    
	Player.image.style.visibility="Hidden";
     }

      if (this.type="enemy"){
        this.y = -10;
        this.x=Math.random()*(document.body.clientHeight-70);
        this.image.style.visibility="visible";
      }
      
    }
    else 
     this.currFrame++;   
   }


   if (this.type=="enemy") {
   
    if(this.y >= document.body.clientHeight){
      this.y = -50;
      this.x=Math.random()*(document.body.clientHeight-40);
      
    }
  }
}

function explode(){
//alert("x");
 this.exploded=1;
 //this.image.height=this.image.height;
 //this.image.width=this.image.width;
 this.imgName="explosion2";
 this.frameCount=28
 
}


function resetPlayer(x,y){
  //alert("resery");
  //this.imgName="";
  this.image=this.imgTemp;
  this.frameCount=this.framecounttemp;
  //alert(this.imgName);
  this.image.src=this.imgNameTemp;
  this.exploded=0;
  //this.explodefinished=0;
  //this.image.height=40;
  //this.image.width=40;
  this.health=100;
  this.used=1;

  this.x=x;
  this.y=y;
  
}

function fire(){
  //search  for available bullets
 // alert(this.type);
 if (this.type="player"){ 
    //	 alert("p");
   for (i=0;i<this.bullCount;i++){
   //this.bullets[i].image.width=20;
   //this.bullets[i].image.height=20;

    if(this.bullets[i].used==0){
      this.bullets[i].used=1;
      this.bullets[i].bulletx=this.x+5;
      this.bullets[i].bullety=this.y-5;
      this.bullets[i].image.style.visibility="visible";
      break;
    }
  }
 }
 
 //else
  
  /*if (this.type="enemy") {
    alert(this.type);
  
   for (i=0;i<this.bullCount;i++){

    if(this.bullets[i].used==0){
      this.bullets[i].used=1;
      this.bullets[i].bulletx=this.x+5;
      this.bullets[i].bullety=this.y+5;
      this.bullets[i].image.style.visibility="visible";
      break;
    }
  }
 
}*/

}




function enemyfire(){
  //search  for available bullets
 // alert(this.type);
  
  if (this.type="enemy") {
   //alert("a");
   for (i=0;i<this.bullCount;i++){

    if(this.bullets[i].used==0){
      this.bullets[i].used=1;
      this.bullets[i].bulletx=this.x+5;
      this.bullets[i].bullety=this.y+5;
      this.bullets[i].image.style.visibility="visible";
      break;
    }
  }
 
}

}