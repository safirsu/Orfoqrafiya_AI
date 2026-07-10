"use strict";


let board = [];
let score = 0;


function startGame(){

    board = [];

    score = 0;


    for(let r=0;r<4;r++){

        board[r]=[];

        for(let c=0;c<4;c++){

            board[r][c]=0;

        }

    }


    addTile();
    addTile();

    draw();

}



function addTile(){

    let empty=[];


    for(let r=0;r<4;r++){

        for(let c=0;c<4;c++){

            if(board[r][c]===0){

                empty.push([r,c]);

            }

        }

    }


    if(empty.length){

        let pos =
        empty[Math.floor(Math.random()*empty.length)];


        board[pos[0]][pos[1]]
        =
        Math.random()<0.9 ? 2 : 4;

    }

}



function draw(){

    let html="";


    board.forEach(row=>{

        row.forEach(value=>{

            html += `
            <div class="tile">
            ${value || ""}
            </div>
            `;

        });

    });


    document.getElementById("board").innerHTML=html;


    document.getElementById("scoreValue").innerText=score;

}



function slide(row){

    row = row.filter(x=>x);


    for(let i=0;i<row.length-1;i++){

        if(row[i]===row[i+1]){

            row[i]*=2;

            score+=row[i];

            row.splice(i+1,1);

        }

    }


    while(row.length<4){

        row.push(0);

    }


    return row;

}



function moveLeft(){

    for(let r=0;r<4;r++){

        board[r]=slide(board[r]);

    }

    addTile();

    draw();

}



function rotate(){

    let newBoard=[];


    for(let c=0;c<4;c++){

        newBoard[c]=[];

        for(let r=3;r>=0;r--){

            newBoard[c].push(board[r][c]);

        }

    }


    board=newBoard;

}



function moveRight(){

    rotate();
    rotate();

    moveLeft();

    rotate();
    rotate();

}



function moveUp(){

    rotate();
    rotate();
    rotate();

    moveLeft();

    rotate();

}



function moveDown(){

    rotate();

    moveLeft();

    rotate();
    rotate();
    rotate();

}



/* KLAVİATURA */

document.addEventListener(
"keydown",
function(e){


    if(
        [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown"
        ].includes(e.key)
    ){

        e.preventDefault();

    }


    if(e.key==="ArrowLeft")
        moveLeft();


    if(e.key==="ArrowRight")
        moveRight();


    if(e.key==="ArrowUp")
        moveUp();


    if(e.key==="ArrowDown")
        moveDown();


},
{
    passive:false
});



/* TELEFON SWIPE */

let startX=0;
let startY=0;


document.addEventListener(
"touchstart",
e=>{

    startX=e.touches[0].clientX;

    startY=e.touches[0].clientY;

});



document.addEventListener(
"touchend",
e=>{


    let endX=e.changedTouches[0].clientX;

    let endY=e.changedTouches[0].clientY;


    let dx=endX-startX;

    let dy=endY-startY;


    if(Math.abs(dx)>Math.abs(dy)){


        if(dx>40)
            moveRight();


        if(dx<-40)
            moveLeft();


    }
    else{


        if(dy>40)
            moveDown();


        if(dy<-40)
            moveUp();


    }


});



function restartGame(){

    startGame();

}


startGame();