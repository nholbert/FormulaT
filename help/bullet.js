

function bullet(imgName,frameCount,x,y,bulletOf,bulletStyle,w,h)
{
  this.bulletSpeed=5;
  this.bulletx=x;
  this.bullety=y;
  this.image=0;
  this.bullCurrFrame=1;
  this.bullFrameCount=frameCount;
  this.used=0;
  this.bulletHit=0;
  this.imgName=imgName;
  this.bulletOf=bulletOf;

  //this.move=move; 
  this.renderBullet=renderBullet;
  this.bulletCount=0;
  this.bulletStyle=bulletStyle;
  this.setImage=setImage;
  this.w=w;
  this.h=h;
  this.reset=reset;
  //this.renderBulletSpeed = renderBulletSpeed;
}

function setImage(img){
  //alert(img.src);
  this.image=img;
  this.image.width=this.w;
  this.image.height=this.h;


}

function renderBullet(speed){

 // alert(this.image.src);
  
 if (this.used){ 
 
 
   this.image.position="absolute";
   this.image.style.left=this.bulletx;
   this.image.style.top=this.bullety;
 

  
 
   this.image.src="images/" +this.imgName + this.bullCurrFrame + ".bmp"
 
  //alert(this.bulletOf);
  //alert(this.image.src);
  this.bullCurrFrame++; 
  
  if (this.bullCurrFrame > this.bullFrameCount){ 
	 this.bullCurrFrame = 1;
   }
  
  if (this.bulletOf=="player")
  {

    if (this.bulletStyle== "straight")
    {
         this.bullety-=10
    }
    
    if (this.bulletStyle== "straightleft")
    {
    
      this.bullety-=5;
      this.bulletx-=5;
    
    }
    if (this.bulletStyle== "straightright")
    {
    
       this.bullety-=5;
       this.bulletx+=5;
    
    }
   
    if (this.bullety <= -20)
	this.used=0;



  }



  if (this.bulletOf=="enemy")
  {
   
   
    if (this.bulletStyle== "straight")
    {
        this.bullety+=speed;
    }
    
    if (this.bulletStyle== "straightleft")
    {

	this.bullety+=speed;
      	this.bulletx-=5;

    }
    if (this.bulletStyle== "straightright")
    {

        this.bullety+=speed;
        this.bulletx+=5;

    }
    if (this.bulletStyle== "straightright2")
    {

        this.bullety+=speed;
        this.bulletx++;

    }
  if (this.bulletStyle== "straightleft2")
    {

        this.bullety+=speed;
        this.bulletx--;

    }


   
   
    if (this.bullety >= (document.body.clientHeight))
	this.used=0;
  }
 } 
}


/*function renderBulletSpeed(speed){
 if (this.bulletOf=="player")
  {
   
    if (this.bulletStyle== "straight")
    {
    
         this.bullety--
         this.bullety--
         this.bullety--
    }
    
    if (this.bulletStyle== "straightleft")
    {
    
      this.bullety--;
      this.bulletx--;

      this.bullety--;
      this.bulletx--;

      this.bullety--;
      this.bulletx--;
    
    }
    if (this.bulletStyle== "straightright")
    {
    
       this.bullety--;
       this.bulletx++;

       this.bullety--;
       this.bulletx++;

       this.bullety--;
       this.bulletx++;
   
   
    
    }
   
    if (this.bullety <= -30)
	this.used=0;



  }



  if (this.bulletOf=="enemy")
  {
  
    if (this.bulletStyle== "straight")
    {
        this.bullety+=speed;
        //this.bullety++;
        //this.bullety++;
    }
    
    if (this.bulletStyle== "straightleft")
    {

	this.bullety+=speed;
      	this.bulletx--;

       	this.bullety++;
      	this.bulletx--;

       	this.bullety++;
      	this.bulletx--;



    }
    if (this.bulletStyle== "straightright")
    {

        this.bullety++;
        this.bulletx++;

        this.bullety++;
        this.bulletx++;

        this.bullety++;
        this.bulletx++;


    }
  }
} */

 function reset(){
   this.image.style.visibility="hidden";
   this.used=0;
 }
