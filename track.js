var trackWidth;

//function getClosestNodePaint (mx, my, r) {
//    var nodenum = nodeArray.length;
//    for (var i = 0; i < nodenum; i++) {
//        var curr = nodeArray[i];
//        if (curr.x < mx + r && curr.x > mx - r && curr.y < my + r && curr.y > my - r) {
//            return curr;
//        }
//    }
//    return null;
//}

//function nodeDraw(mx, my, r) {
//    var modr = r + 5
//    var paintNode = getClosestNodePaint(mx, my, modr);
//    if (paintNode) {
//        context.fillStyle = "white";
//        context.fillText(paintNode.id, paintNode.x, paintNode.y);
//    }
//}

function nodeDraw(){
    for (var i = 0; i < 20; i++) {
        var curr = nodeArray[i];
        trcontext.fillStyle = "white";
        trcontext.textAlign = "center";
        trcontext.textBaseline = "middle";
        trcontext.fillText(curr.id, curr.x, curr.y);
    }
}

function blankBackground() {
    this.draw = function draw(ptcontext) {
        ptcontext.fillStyle = "#000000";  // black canvas
        ptcontext.fillRect(0, 0, WIDTH, HEIGHT);
    }
}

// the painting function
function paint(mx, my, r) {
        var brushColor = document.getElementById("brushColor");
        ptcontext.fillStyle = brushColor.value;
        ptcontext.beginPath();
        ptcontext.arc(mx, my, r, 0, Math.PI*2, true);
        ptcontext.closePath();
        ptcontext.fill();
        //// redraw the unclipped grass section, player car, and finish line
        //if (trackSelected==0){
        //    trackIn.draw(context);
        //}
        //player1.draw(carcontx);
        //finish.draw(context);
        //nodeDraw(mx, my, r);
}

//----------------------//
//     SQUARE TRACK     //
//----------------------//

function sqtrack() {
    this.width = 75;
    this.color = "#199B19"; // grass color
    
    var cornerRadius = 50;
    
    this.draw = function draw(trcontext) {
        trcontext.fillStyle = this.color;
        trcontext.beginPath();
        //Inside square
        trcontext.moveTo(550, 50);
        trcontext.arcTo(650, 50, 650, 100, 50);
        trcontext.lineTo(650, 350);
        trcontext.arcTo(650, 400, 600, 400, 50);
        trcontext.lineTo(100, 400);
        trcontext.arcTo(50, 400, 50, 350, 50);
        trcontext.lineTo(50, 100);
        trcontext.arcTo(50, 50, 100, 50, 50);
        trcontext.lineTo(550, 50);
        //Outside box
        trcontext.lineTo(550, 0);
        trcontext.lineTo(0, 0);
        trcontext.lineTo(0, HEIGHT);
        trcontext.lineTo(WIDTH, HEIGHT);
        trcontext.lineTo(700, 0);
        trcontext.lineTo(550, 0);
        trcontext.closePath();
        trcontext.fill();
        //Inside Grass
        trcontext.moveTo(550 - this.width, 50 + this.width);
        trcontext.arcTo(650 - this.width, 50 + this.width, 650 - this.width, 100 + this.width, 50);
        trcontext.lineTo(650 - this.width, 350 - this.width);
        trcontext.arcTo(650 - this.width, 400 - this.width, 600 - this.width, 400 - this.width, 50);
        trcontext.lineTo(100 + this.width, 400 - this.width);
        trcontext.arcTo(50 + this.width, 400 - this.width, 50 + this.width, 350 - this.width, 50);
        trcontext.lineTo(50 + this.width, 100 + this.width);
        trcontext.arcTo(50 + this.width, 50 + this.width, 100 + this.width, 50 + this.width, 50);
        trcontext.closePath();
        trcontext.fill();
        //Finish Line
        trcontext.fillStyle = "#CCFF33"; // finish line
        trcontext.fillRect(575, 180, 75, 10);
    }
}

function getSqNodes() {
    trcontext.fillStyle = "white";
    var nx = 600;
    var ny = 200;
    var id = 0;
    for (var i = 1; i < 21; i++) {
        id += 1;
        if (id < 3) {
            ny -= 50;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id > 2 && id < 8) {
            ny = 90
            nx -= 87
            nodeArray.push( new node (nx, ny, id));
        }
        if (id == 8) {
            ny = 100;
            nx = 90;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id > 8 && id < 13) {
            ny += 60;
            nx = 85;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id > 12 && id < 18) {
            ny = 360;
            nx += 87;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id == 18) {
            ny = 340;
            nx = 605;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id > 18 && id < 21) {
            ny -= 50;
            nx = 605;
            nodeArray.push( new node (nx, ny, id));
        }
        trcontext.textAlign = "center";
        trcontext.textBaseline = "middle";
        trcontext.fillText(id, nx, ny);
    }
}

//---------------//
// CORNERS TRACK // -- FINISH "CLIPPING" SO THAT THE GRASS IS REDRAWN
//---------------//

// draws the rounded rectangles
function cornertrack() {
    this.width = 75;
    this.color = "#199B19";
    
    var cornerRadius = this.width/4;
    
    // draws a big black rectangle for the track
    this.draw = function draw(context) {
        trcontext.strokeStyle = this.color;
        trcontext.lineWidth = 1;
        trcontext.fillStyle = this.color;
        trcontext.beginPath();
        //Inside lines
        trcontext.moveTo(650, 200);
        trcontext.arcTo(650, 25, 400, 50, cornerRadius);
        trcontext.lineTo(400, 50);
        trcontext.arcTo(25, 25, 250, 250, cornerRadius);
        trcontext.lineTo(150, 200);
        trcontext.arcTo(50, 150, 50, 350, cornerRadius);
        trcontext.lineTo(50, 425);
        trcontext.lineTo(450, 425);
        trcontext.lineTo(450, 350);
        trcontext.arcTo(650, 450, 650, 200, cornerRadius);
        trcontext.lineTo(650, 200);
        //Outside lines
        trcontext.lineTo(WIDTH, 200);
        trcontext.lineTo(WIDTH, HEIGHT);
        trcontext.lineTo(0, HEIGHT);
        trcontext.lineTo(0, 0);
        trcontext.lineTo(WIDTH, 0);
        trcontext.lineTo(WIDTH, 200);
        trcontext.closePath();
        trcontext.fill();
        
        //Inside grass
        trcontext.moveTo(650 - this.width, 200);
        trcontext.lineTo(650 - this.width, 25 + this.width);
        trcontext.arcTo(400, 50 + this.width, 25 + this.width, 25 + this.width, cornerRadius);
        trcontext.lineTo(25 + this.width * 2, 25 + this.width);
        trcontext.arcTo(150 + this.width * 2, 200 + this.width * 2, 50 + this.width, 150 + this.width, cornerRadius);
        trcontext.lineTo(50 + this.width, 150 + this.width * 1.5);
        trcontext.lineTo(50 + this.width, 425 - this.width);
        trcontext.lineTo(450 - this.width, 425 - this.width);
        trcontext.arcTo(450 - this.width, 350 - this.width * 1.7, 650 - this.width, 450 - this.width, cornerRadius);
        trcontext.lineTo(650 - this.width, 450 - this.width * 1.7);
        trcontext.closePath();
        trcontext.fill();
        //Finish Line
        trcontext.fillStyle = "#CCFF33"; // finish line
        trcontext.fillRect(575, 180, 75, 10);
    }
}

function getCornerNodes() {
    trcontext.fillStyle = "white";
    var nx = 610;
    var ny = 165;
    var id = 0;
    for (var i = 1; i < 21; i++) {
        id += 1;
        if (id < 3) {
            ny -= 50;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id > 2 && id < 5) {
            ny += 15
            nx -= 100
            nodeArray.push( new node (nx, ny, id));
        }
        if (id > 4 && id < 7) {
            ny -= 13;
            nx -= 100;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id == 7) {
            ny = 80;
            nx = 130;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id == 8) {
            ny += 75;
            nx += 30;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id == 9) {
            ny += 75;
            nx += 30;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id == 10){
            ny -= 5;
            nx -= 50;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id == 11) {
            ny -= 10;
            nx -= 50;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id == 12) {
            ny += 90;
            //nx -= 50;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id == 13) {
            ny = 390;
            //nx = nx;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id > 13 && id < 16) {
            //ny = ny;
            nx += 160;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id == 16) {
            ny = 300;
            //nx += 20;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id > 16 && id < 19) {
            ny += 30;
            nx += 100;
            nodeArray.push( new node (nx, ny, id));
        }
        if (id > 18) {
            ny -= 80;
            //nx += 90;
            nodeArray.push( new node (nx, ny, id));
        }
        trcontext.textAlign = "center";
        trcontext.textBaseline = "middle";
        trcontext.fillText(id, nx, ny);
    }
}