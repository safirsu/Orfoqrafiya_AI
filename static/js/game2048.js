document.addEventListener("DOMContentLoaded",()=>{


const board=document.getElementById("board");
const scoreText=document.getElementById("score");
const restart=document.getElementById("restart2048");


if(!board) return;


let grid=[];
let score=0;
let best=localStorage.getItem("best2048") || 0;
let gameEnded=false;



function startGame(){

grid=[
[0,0,0,0],
[0,0,0,0],
[0,0,0,0],
[0,0,0,0]
];


score=0;
gameEnded=false;


addTile();
addTile();


draw();

}





function addTile(){


let empty=[];


for(let r=0;r<4;r++){

for(let c=0;c<4;c++){


if(grid[r][c]===0)

empty.push([r,c]);


}

}



if(empty.length){


let pos=
empty[
Math.floor(Math.random()*empty.length)
];


grid[pos[0]][pos[1]]
=
Math.random()<0.9 ? 2 : 4;


}


}





function draw(){


board.innerHTML="";


for(let r=0;r<4;r++){


for(let c=0;c<4;c++){


let value=grid[r][c];


let tile=document.createElement("div");


tile.className="tile tile-"+value;



if(value!==0)

tile.textContent=value;



board.appendChild(tile);


}

}



scoreText.textContent=score;



if(score>best){

best=score;

localStorage.setItem(
"best2048",
best
);

}


}function slide(row){


let arr=row.filter(
x=>x!==0
);


let result=[];



for(let i=0;i<arr.length;i++){


if(arr[i]===arr[i+1]){


let merged=arr[i]*2;


result.push(merged);


score+=merged;


i++;


}

else{


result.push(arr[i]);


}


}




while(result.length<4)

result.push(0);



return result;


}









function moveLeft(){


let moved=false;



for(let r=0;r<4;r++){


let old=[...grid[r]];


grid[r]=slide(grid[r]);



if(old.join("")!==grid[r].join(""))

moved=true;



}



return moved;


}









function rotateClockwise(){


let newGrid=[

[0,0,0,0],
[0,0,0,0],
[0,0,0,0],
[0,0,0,0]

];



for(let r=0;r<4;r++){


for(let c=0;c<4;c++){


newGrid[c][3-r]=grid[r][c];


}

}



grid=newGrid;


}









function move(direction){


if(gameEnded)

return;



let moved=false;



if(direction==="left"){


moved=moveLeft();


}





if(direction==="right"){


rotateClockwise();

rotateClockwise();


moved=moveLeft();


rotateClockwise();

rotateClockwise();


}





if(direction==="up"){


rotateClockwise();

rotateClockwise();

rotateClockwise();


moved=moveLeft();


rotateClockwise();



}





if(direction==="down"){


rotateClockwise();


moved=moveLeft();


rotateClockwise();

rotateClockwise();

rotateClockwise();



}





if(moved){


addTile();


draw();



if(checkGameOver()){


gameEnded=true;


setTimeout(()=>{

alert(
"Game Over! Skor: "+score
);


},100);


}



}


}function checkGameOver(){


for(let r=0;r<4;r++){


for(let c=0;c<4;c++){


if(grid[r][c]===0)

return false;



if(c<3 && grid[r][c]===grid[r][c+1])

return false;



if(r<3 && grid[r][c]===grid[r+1][c])

return false;



}


}



return true;


}









/* ==========================
   KLAVİATURA İDARƏSİ
========================== */


document.addEventListener("keydown",(e)=>{


if(
e.key==="ArrowLeft" ||
e.key==="ArrowRight" ||
e.key==="ArrowUp" ||
e.key==="ArrowDown"
){

e.preventDefault();


}



switch(e.key){


case "ArrowLeft":

move("left");

break;



case "ArrowRight":

move("right");

break;



case "ArrowUp":

move("up");

break;



case "ArrowDown":

move("down");

break;



}


});









/* ==========================
   TELEFON SWIPE İDARƏSİ
========================== */


let touchStartX = 0;
let touchStartY = 0;



document.addEventListener("touchstart",(e)=>{


touchStartX =
e.changedTouches[0].screenX;


touchStartY =
e.changedTouches[0].screenY;


});






document.addEventListener("touchend",(e)=>{


let touchEndX =
e.changedTouches[0].screenX;


let touchEndY =
e.changedTouches[0].screenY;



let diffX =
touchEndX - touchStartX;


let diffY =
touchEndY - touchStartY;



if(Math.abs(diffX) > Math.abs(diffY)){



if(diffX > 50){


move("right");


}


else if(diffX < -50){


move("left");


}



}

else{



if(diffY > 50){


move("down");


}



else if(diffY < -50){


move("up");


}



}



});





/* ==========================
   YENİDƏN BAŞLAT
========================== */


if(restart){


restart.addEventListener(
"click",
startGame
);


}






/* ==========================
   OYUNU BAŞLAT
========================== */


startGame();



});