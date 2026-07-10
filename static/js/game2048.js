document.addEventListener("DOMContentLoaded",()=>{

const board=document.getElementById("board");
const scoreText=document.getElementById("score");
const restartBtn=document.getElementById("restart2048");

if(!board) return;


let grid=[];
let score=0;
let best=localStorage.getItem("best2048") || 0;



function startGame(){

grid=[
[0,0,0,0],
[0,0,0,0],
[0,0,0,0],
[0,0,0,0]
];

score=0;

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

let p=empty[Math.floor(Math.random()*empty.length)];

grid[p[0]][p[1]]
=
Math.random()<0.9 ? 2 : 4;

}

}





function draw(){

board.innerHTML="";


for(let r=0;r<4;r++){

for(let c=0;c<4;c++){


let tile=document.createElement("div");

tile.className="tile";


if(grid[r][c]!==0){

tile.textContent=grid[r][c];

tile.setAttribute(
"data-value",
grid[r][c]
);

}


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


}





function slide(row){

let arr=row.filter(x=>x!==0);


for(let i=0;i<arr.length-1;i++){

if(arr[i]===arr[i+1]){

arr[i]*=2;

score+=arr[i];

arr.splice(i+1,1);

}

}


while(arr.length<4)
arr.push(0);


return arr;

}




function moveLeft(){

let changed=false;


for(let r=0;r<4;r++){

let old=[...grid[r]];

grid[r]=slide(grid[r]);


if(old.toString()!=grid[r].toString())
changed=true;

}


if(changed){

addTile();
draw();

}

}





function rotate(){

let result=[
[0,0,0,0],
[0,0,0,0],
[0,0,0,0],
[0,0,0,0]
];


for(let r=0;r<4;r++){

for(let c=0;c<4;c++){

result[c][3-r]=grid[r][c];

}

}


grid=result;

}





function move(dir){


if(dir==="left"){

moveLeft();

}



if(dir==="right"){

rotate();
rotate();

moveLeft();

rotate();
rotate();

}



if(dir==="up"){

rotate();
rotate();
rotate();

moveLeft();

rotate();

}



if(dir==="down"){

rotate();

moveLeft();

rotate();
rotate();
rotate();

}


}







// PC KLAVİATURA

document.addEventListener("keydown",(e)=>{


if(e.key==="ArrowLeft")
move("left");


if(e.key==="ArrowRight")
move("right");


if(e.key==="ArrowUp")
move("up");


if(e.key==="ArrowDown")
move("down");


});








// TELEFON SWIPE

let startX=0;
let startY=0;



board.addEventListener(
"touchstart",
(e)=>{

e.preventDefault();

startX=e.touches[0].clientX;
startY=e.touches[0].clientY;


},
{passive:false}
);




board.addEventListener(
"touchend",
(e)=>{

e.preventDefault();


let endX=e.changedTouches[0].clientX;
let endY=e.changedTouches[0].clientY;


let dx=endX-startX;
let dy=endY-startY;



if(Math.abs(dx)>Math.abs(dy)){


if(dx>30)
move("right");


if(dx<-30)
move("left");


}

else{


if(dy>30)
move("down");


if(dy<-30)
move("up");


}



},
{passive:false}
);






restartBtn?.addEventListener(
"click",
startGame
);



startGame();


});