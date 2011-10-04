
<html>
<head>
<title>
galaxy defender II
</title>
<script language="javascript" src="player.js">
</script>

<script language="javascript" src="bullet.js">
</script>

<!--script language="javascript" src="bulletcol.js">
</script-->


<script language ="javascript">

 
 //initialize all vars :)
  var pTime;
  var eTime;
  var enemyCount=5;
  var myScore=0;
  

    //players bullet images
  document.write("<bgsound ID='bgsound' src='sounds/bgplay.mid' loop=1 volume=-60>");
  document.write("<bgsound ID='sndeffect'loop=1 volume=-60>");
  
  document.write('<div style="visibility:hidden" width=0;height=0> style="left:0;top:0">');  
  document.write('<img id="hit" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="bala" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="bala1" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="bala2" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="bala3" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="bala4" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="bala5" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="bala6" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="bala7" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="bala8" style="position:absolute" width="0" height="0" style="left:60;top:90">');  


  //enemy bullets
  document.write('<img id="e1bala1" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e1bala2" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e1bala3" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e1bala4" style="position:absolute" width="0" height="0" style="left:60;top:90">');  

  document.write('<img id="e2bala1" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e2bala2" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e2bala3" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e2bala4" style="position:absolute" width="0" height="0" style="left:60;top:90">');  

  document.write('<img id="e3bala1" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e3bala2" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e3bala3" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e3bala4" style="position:absolute" width="0" height="0" style="left:60;top:90">');  

  document.write('<img id="e4bala1" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e4bala2" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e4bala3" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e4bala4" style="position:absolute" width="0" height="0" style="left:60;top:90">');  

  document.write('<img id="e5bala1" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e5bala2" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e5bala3" style="position:absolute" width="0" height="0" style="left:60;top:90">');  
  document.write('<img id="e5bala4" style="position:absolute" width="0" height="0" style="left:60;top:90">');  

  document.write('</div>');

  //enemy images
  document.write('<div  style="visibility:hidden" width=0;height=0> style="left:60;top:90">');  
  document.write('<img id="enemy1" src="images/enemy1.bmp" style="position:absolute" width=40;height=40>');
  document.write('<img id="enemy2" src="images/enemy2.bmp" style="position:absolute" width=40;height=40>');
  document.write('<img id="enemy3" src="images/enemy3.bmp" style="position:absolute" width=40;height=40>');
  document.write('<img id="enemy4" src="images/enemy4.bmp" style="position:absolute" width=40;height=40>');
  document.write('<img id="enemy5" src="images/enemy5.bmp" style="position:absolute" width=60;height=60>');
  document.write('<img id="enemy6" src="images/enemy5.bmp" style="position:absolute" width=40;height=40>');
  document.write('</div>'); 

  //player images
  document.write('<img id="jet" src="images/jet1.bmp" style="position:absolute" width="40" height="40">');

  document.write('<div id="score" style="position:absolute;top=0px">');
  document.write('</div>');

  document.write('<div>');
  document.write('<img id="health" src="images/health-100.bmp" style="position:absolute">');
  document.write('</div>');

  document.write('<div ID="GO" style="position:absolute">');
  document.write('</div>');


  a=document.body.clientHeight-23;    
  health.style.top=a;
  
  score.innerHTML="<font color='Green' face='system'>Score:0</font>";
  
  
  bull=new bullet("missile",1,2,2,"player","straight",10,20);  
  bull1=new bullet("missile",1,2,2,"player","straight",10,20);  
  bull2=new bullet("missile",1,2,2,"player","straight",10,20);  
  bull3=new bullet("missile",1,2,2,"player","straightleft",10,20);
  bull4=new bullet("missile",1,2,2,"player","straightright",10,20);
  bull5=new bullet("missile",1,4,2,"player","straightleft",10,20);  
  bull6=new bullet("missile",1,2,2,"player","straightright",10,20);
  bull7=new bullet("missile",1,4,2,"player","straight",10,20);  
  bull8=new bullet("missile",1,2,2,"player","straightright",10,20);



  e1bull1=new bullet("mybullet",4,2,2,"enemy","straightleft2",10,20);  
  e1bull2=new bullet("mybullet",4,2,2,"enemy","straight",20,20);  
  e1bull3=new bullet("disk",1,2,2,"enemy","straightright",20,20);  
  e1bull4=new bullet("disk",1,2,2,"enemy","straight",20,20);

  e2bull1=new bullet("plasma",4,2,2,"enemy","straight",10,20);  
  e2bull2=new bullet("mybullet",4,2,2,"enemy","straight",20,20);  
  e2bull3=new bullet("plasma",4,2,2,"enemy","straightleft",20,20);  
  e2bull4=new bullet("disk",1,2,2,"enemy","straight",20,20);

  e3bull1=new bullet("plasma",4,2,2,"enemy","straight",10,20);  
  e3bull2=new bullet("mybullet",4,2,2,"enemy","straight",20,20);  
  e3bull3=new bullet("plasma",4,2,2,"enemy","straightleft2",20,20);  
  e3bull4=new bullet("disk",1,2,2,"enemy","straightright",20,20);

  e4bull1=new bullet("plasma",4,2,2,"enemy","straight",10,20);  
  e4bull2=new bullet("mybullet",4,2,2,"enemy","straightright2",20,20);  
  e4bull3=new bullet("disk",1,2,2,"enemy","straightleft",20,20);  
  e4bull4=new bullet("disk",1,2,2,"enemy","straight",20,20);

  e5bull1=new bullet("plasma",4,2,2,"enemy","straight",10,20);  
  e5bull2=new bullet("mybullet",4,2,2,"enemy","straight",20,20);  
  e5bull3=new bullet("disk",1,2,2,"enemy","straightleft",20,20);  
  e5bull4=new bullet("disk",1,2,2,"enemy","straight",20,20);
  
  bull.setImage(bala);
  bull1.setImage(bala1);
  bull2.setImage(bala2);
  bull3.setImage(bala3);
  bull4.setImage(bala4);
  bull5.setImage(bala5);
  bull6.setImage(bala6);
  bull7.setImage(bala7);
  bull8.setImage(bala8);


  //enemy 1 bullets
  e1bull1.setImage(e1bala1);
  e1bull2.setImage(e1bala2);
  e1bull3.setImage(e1bala3);
  e1bull4.setImage(e1bala4);

  //enemy 2 bullets
  e2bull1.setImage(e2bala1);
  e2bull2.setImage(e2bala2);
  e2bull3.setImage(e2bala3);
  e2bull4.setImage(e2bala4);

  //enemy 3 bullets
  e3bull1.setImage(e3bala1);
  e3bull2.setImage(e3bala2);
  e3bull3.setImage(e3bala3);
  e3bull4.setImage(e3bala4);

  //enemy 4 bullets
  e4bull1.setImage(e4bala1);
  e4bull2.setImage(e4bala2);
  e4bull3.setImage(e4bala3);
  e4bull4.setImage(e4bala4);

  //enemy 5 bullets
  e5bull1.setImage(e5bala1);
  e5bull2.setImage(e5bala2);
  e5bull3.setImage(e5bala3);
  e5bull4.setImage(e5bala4);


  //array of 5 enemies
  enemy = new Array(5);
  enemy[0]= new player(100,"enemy",enemy1,1,45,-90,"enemy");
  enemy[1]= new player(100,"enemy",enemy2,1,60,-20,"enemy");
  enemy[2]= new player(100,"enemy",enemy3,1,220,-70,"enemy");
  enemy[3]= new player(100,"enemy",enemy4,1,120,-25,"enemy");
  enemy[4]= new player(100,"enemy",enemy5,1,0,-20,"enemy");


  //add bullets to enemy enemy 1
  enemy[0].addBullet(e1bull1);
  enemy[0].addBullet(e1bull2);
  enemy[0].addBullet(e1bull3);
  enemy[0].addBullet(e1bull4);

  //add bullets to enemy enemy 2
  enemy[1].addBullet(e2bull1);
  enemy[1].addBullet(e2bull2);
  enemy[1].addBullet(e2bull3);
  enemy[1].addBullet(e2bull4);

  //add bullets to enemy enemy 3
  enemy[2].addBullet(e3bull1);
  enemy[2].addBullet(e3bull2);
  enemy[2].addBullet(e3bull3);
  enemy[2].addBullet(e3bull4);
  
  //add bullets to enemy enemy 4
  enemy[3].addBullet(e4bull1);
  enemy[3].addBullet(e4bull2);
  enemy[3].addBullet(e4bull3);
  enemy[3].addBullet(e4bull4);
  
  //add bullets to enemy enemy 5
  enemy[4].addBullet(e5bull1);
  enemy[4].addBullet(e5bull2);
  enemy[4].addBullet(e5bull3);
  enemy[4].addBullet(e5bull4);


  Player = new player(100,"jet",jet,3,200,200,"player");

  Player.addBullet(bull);
  Player.addBullet(bull1);
  Player.addBullet(bull2);
  Player.addBullet(bull3);
  Player.addBullet(bull4);
  Player.addBullet(bull5);
  
  
  
  function playsound(path){
    sndeffect.src=path;
  }
  
   
 //keydown event handler

var playerX=0,playerY=0;
playerX=(document.body.clientWidth/2)-20;
playerY=document.body.clientHeight/2;
var KEY="";

function keydown()
{
  //check the key pressed
  switch(event.keyCode){
    //up
    case 38:
     KEY="UP";
      break; 
    //down
    case 40:
      KEY="DOWN";
      break;
    //left
    case 37:
      KEY="LEFT"
      break;
    //right
    case 39:
      KEY="RIGHT";
      break;
    case 32:
     Player.fire();
     break;
   case 88:
     bgsound.src="";
     sndeffect.src="";
     location.href="menu.html"; 
    break;

  }
 
}
 
var speed = 5;  

 function bulletTimer(){
  
  //render all availbale bullets of the player :) 
  //Player.type="player";
   for(i=0;i<Player.bullCount;i++){

      Player.bullets[i].renderBullet(5);
     
  }
   if (myScore > 0)
   if ((myScore % 3000)==0)
   {
     speed++;

   }
   for(i=0;i<5;i++)
     for(j=0;j<enemy[i].bullCount;j++)
       enemy[i].bullets[j].renderBullet(speed);    
  
 }
 
var keydisable=0;
 //timer of the jet,the player
 function playerTimer(){
 
   Player.renderPlayer();
   if(keydisable) {
    GO.style.left=(document.body.clientWidth/2)-40;
    GO.style.top=(document.body.clientHeight/2)-20;
    GO.innerHTML="<font color='Green' face='system'>GAME OVER</font>";
    return;  
   }

  //Player.move(playerX,playerY);
  switch(KEY){
     case "UP":
      playerY-=3;
      break; 

    case "DOWN":
      playerY+=3;

      break;

    case "LEFT":
      playerX-=3;
      
      break;

    case "RIGHT":
      playerX+=3;
      
      break;

  
  }  
 
  if (playerX <=0)
   playerX=0;

  if (playerY <=0)
   playerY=0;

  

  if (playerX >= (document.body.clientWidth)-40)
    playerX= (document.body.clientWidth)-40;

   if (playerY >= (document.body.clientHeight)-40)
    playerY= (document.body.clientHeight)-40;

  
  Player.move(playerX,playerY);
  
  //test if player hit
  for(i=0;i<5;i++){
  if ((enemy[i].y >= Player.y) && (enemy[i].y <= (Player.y + Player.image.height)) && 
        ((enemy[i].x >= Player.x) && (enemy[i].x <= (Player.x + Player.image.width))))
   {
     Player.health=0;
     if (Player.health==0){
         Player.explode();
         playsound("sounds/bplode.wav");
         keydisable=1;
         health.src="images/health-0.bmp"

      }
      

   } 
     
   for(j=0;j<enemy[i].bullCount;j++){    
    
     if ((enemy[i].bullets[j].bullety >= Player.y) && (enemy[i].bullets[j].bullety <= (Player.y + Player.image.height)) && 
        ((enemy[i].bullets[j].bulletx >= Player.x) && (enemy[i].bullets[j].bulletx <= (Player.x + Player.image.width))))
     {     
          Player.hit=1; 
          if (Player.health==0){
             Player.explode();
             playsound("sounds/bplode.wav");
             keydisable=1;
          }
         
         
        enemy[i].bullets[j].reset();   
   } 
  }    
  }  


    //if the player is hit
    if(Player.hit)
    {
     if (Player.health > 0)
      Player.health-=5;
	
      //Player.image.src="images/hit.bmp";

      if (Player.health <=75 && Player.health >=51)
        health.src="images/health-75.bmp"
      if (Player.health <=50 && Player.health >=26)
        health.src="images/health-50.bmp"
      if (Player.health <=25 && Player.health >=1)
        health.src="images/health-25.bmp"
      if (Player.health ==0)
        health.src="images/health-0.bmp"

 
     //score.innerHTML='<FONT color="green">'+Player.health
     Player.hit=0;   
    } 
   
 } 

 

 function enemyTimer(){
  for(i=0;i<enemyCount;i++)
  {
   // enemy[i].type="enemy";
    enemy[i].renderPlayer();
   enemy[i].y++;
   a=new String();
   
   a=Math.random()*20+"";
   
   num = a.indexOf(1,0);
   if(num == 7){
    enemy[i].enemyfire();
   }
     
   for(j=0;j<Player.bullCount;j++){    

     
    
    if (Player.bullets[j].used==1){
     //if(Player.bullets[i].bulletOf=="player") 
     if ((Player.bullets[j].bullety >= enemy[i].y) && (Player.bullets[j].bullety <= (enemy[i].y + enemy[i].image.height)) && 
        ((Player.bullets[j].bulletx >= enemy[i].x) && (Player.bullets[j].bulletx <= (enemy[i].x + enemy[i].image.width))))
      {
      //alert("kim");
       playsound("sounds/bplode.wav");
       enemy[i].explode();
        myScore+=100;
        Player.bullets[j].reset();

       score.innerHTML="<font face='system' color='green'>" + "Score:"+ myScore + "</font>"
     }

   } //if    
   

  
   } //for j

  }  //for i
 }


 
  




 function init(){
  pTime=setInterval("playerTimer()",20);
  eTime=setInterval("enemyTimer()",20);
  setInterval("bulletTimer()",50);
  keydisable=0;
 
 }



</script>
</head>
<body bgcolor="black" background="images/menubg.gif" onload="init()" onKeydown="keydown()">

</div><!-- Default Insight Tag --> 
<script type="text/javascript"> 
  var _bizo_data_partner_id = "131";
</script> 
<script type="text/javascript"> 
  var _bizo_p = (("https:" == document.location.protocol) ? "https://sjs." : "http://js.");
  document.write(unescape("%3Cscript src='" + _bizo_p + "bizographics.com/convert_data.js?partner_id=" + _bizo_data_partner_id + "' type='text/javascript'%3E%3C/script%3E"));
</script> 
 
 
</body>
</html>