document.addEventListener("DOMContentLoaded", () => {


const scrambledWord = document.getElementById("scrambledWord");
const wordInput = document.getElementById("wordInput");
const checkBtn = document.getElementById("checkWord");
const nextBtn = document.getElementById("nextWord");

const wordMessage = document.getElementById("wordMessage");
const correctWord = document.getElementById("correctWord");

const wordScore = document.getElementById("wordScore");
const questionNumber = document.getElementById("questionNumber");

const playerName = document.getElementById("playerWordName");
const leaderWord = document.getElementById("leaderWord");


if(!scrambledWord) return;


let words = [];
let currentWord = "";

let score = 0;
let question = 0;

let answered = false;



async function loadWords(){

try{

const response = await fetch("/api/game-words");

words = await response.json();


if(words.length < 10){

wordMessage.innerHTML =
"⚠️ Bazada kifayət qədər söz yoxdur.";

return;

}


words.sort(()=>Math.random()-0.5);


startGame();


}

catch(error){

console.log(error);

wordMessage.innerHTML =
"❌ Söz bazası yüklənmədi.";

}

}




function shuffle(word){

let result = word;
let count = 0;


while(result === word && count < 30){

result =
word
.split("")
.sort(()=>Math.random()-0.5)
.join("");

count++;

}


return result;

}




function startGame(){

score = 0;
question = 0;


wordScore.innerHTML = "0";
questionNumber.innerHTML = "0";


checkBtn.style.display="inline-block";
nextBtn.style.display="none";


nextQuestion();

}





function nextQuestion(){


answered=false;


if(question >= 10){

finishGame();

return;

}


currentWord =
words[question];


scrambledWord.innerHTML =
shuffle(currentWord);


wordInput.value="";


wordMessage.innerHTML="";

correctWord.innerHTML="";


question++;


questionNumber.innerHTML =
question;


nextBtn.style.display="none";


}






function checkAnswer(){


if(answered)
return;


let answer =
wordInput.value
.trim()
.toLowerCase();



if(answer===""){

wordMessage.innerHTML =
"⚠️ Cavabı yazın.";

return;

}



answered=true;



if(answer === currentWord){


score += 10;


wordScore.innerHTML =
score;


wordMessage.innerHTML =
"✅ Düz cavab! +10 bal";


}

else{


wordMessage.innerHTML =
"❌ Səhv cavab";


correctWord.innerHTML =
"Doğru cavab: <b>"
+
currentWord
+
"</b>";

}



nextBtn.style.display="inline-block";


}








function finishGame(){



let name =
playerName.value.trim();


if(name==="")
name="Adsız";



let resultMessage;


if(score===100){

resultMessage =
"🏆 Möhtəşəm! Bütün sözləri düzgün tapdın!";

}

else if(score>=70){

resultMessage =
"🔥 Əla nəticə!";

}

else if(score>=40){

resultMessage =
"👍 Yaxşı nəticə!";

}

else{

resultMessage =
"🎯 Oyun tamamlandı.";

}




let leaders =
JSON.parse(localStorage.getItem("wordLeaders"))
|| [];



leaders.push({

name:name,
score:score,
date:new Date().toLocaleDateString()

});



leaders.sort(
(a,b)=>b.score-a.score
);



localStorage.setItem(
"wordLeaders",
JSON.stringify(
leaders.slice(0,10)
)
);





scrambledWord.innerHTML =
"🎮 Oyun bitdi";



correctWord.innerHTML="";



wordMessage.style.display="block";


wordMessage.innerHTML = `

<div class="final-result">

<h2>${resultMessage}</h2>

<h3>🏅 Nəticən: ${score}/100</h3>

<p>
Düz cavablar:
<b>${score/10}/10</b>
</p>


<button onclick="location.reload()">
🔄 Yenidən oyna
</button>


</div>

`;



checkBtn.style.display="none";

nextBtn.style.display="none";



showLeaders();


}








function showLeaders(){


if(!leaderWord)
return;



let leaders =
JSON.parse(localStorage.getItem("wordLeaders"))
|| [];



leaderWord.innerHTML="";



leaders.forEach((player,index)=>{


leaderWord.innerHTML += `

<tr>

<td>${index+1}</td>

<td>${player.name}</td>

<td>${player.score}</td>

</tr>

`;


});


}






checkBtn.onclick = checkAnswer;

nextBtn.onclick = nextQuestion;


showLeaders();

loadWords();



});