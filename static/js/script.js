document.addEventListener("DOMContentLoaded", () => {


/* ==========================
   ELEMENTLƏR
========================== */


const wordInput = document.getElementById("word");

const checkBtn =
document.getElementById("checkBtn");


const result =
document.getElementById("result");


const favoriteBtn =
document.getElementById("favoriteBtn");


const favoritesList =
document.getElementById("favoritesList");


const aiSearchBtn =
document.getElementById("aiSearchBtn");


const aiResult =
document.getElementById("aiResult");



const checkedCount =
document.getElementById("checkedCount");


const checkedCount2 =
document.getElementById("checkedCount2");


const correctCount =
document.getElementById("correctCount");


const wrongCount =
document.getElementById("wrongCount");


const aiCount =
document.getElementById("aiCount");





/* ==========================
   STATİSTİKA
========================== */


let stats =
JSON.parse(
localStorage.getItem("stats")
)
||
{

checked:0,

correct:0,

wrong:0,

ai:0

};




function updateStats(){


if(checkedCount)
checkedCount.textContent =
stats.checked;



if(checkedCount2)
checkedCount2.textContent =
stats.checked;



if(correctCount)
correctCount.textContent =
stats.correct;



if(wrongCount)
wrongCount.textContent =
stats.wrong;



if(aiCount)
aiCount.textContent =
stats.ai;



localStorage.setItem(
"stats",
JSON.stringify(stats)
);


}



updateStats();





/* ==========================
   SÖZ YOXLAMA
========================== */


if(checkBtn){


checkBtn.onclick =
async()=>{


let word =
wordInput.value.trim();



if(!word){


result.innerHTML =
`

<div class="empty">

⚠️ Söz daxil edin

</div>

`;

return;

}



result.innerHTML =
"⏳ Yoxlanılır...";



try{


let response =
await fetch("/yoxla",{


method:"POST",


headers:{


"Content-Type":
"application/json"

},


body:JSON.stringify({

word:word

})


});



let data =
await response.json();



stats.checked++;



if(data.status==="correct"){


stats.correct++;



result.innerHTML =
`

<div class="success">

<h3>
✅ Düzgündür
</h3>


<p>
${data.word}
</p>


</div>

`;



}
else{


stats.wrong++;


result.innerHTML =
`

<div class="error">

<h3>
❌ Tapılmadı
</h3>


<p>
${data.message || ""}
</p>


</div>

`;



}



updateStats();



}

catch(e){


console.log(e);


result.innerHTML =
"❌ Server xətası";


}


};


}
/* ==========================
   AI ANALİZ
========================== */


if(aiSearchBtn){


aiSearchBtn.onclick =
async()=>{


let word =
wordInput.value.trim();



if(!word){


aiResult.innerHTML =

`

<div class="ai-card-result error">


<h3>
⚠️ Xəbərdarlıq
</h3>


<p>
Əvvəl söz yazın.
</p>


</div>

`;


return;

}



aiResult.innerHTML =

`

<div class="ai-card-result">

<h3>
🤖 AI analiz edir...
</h3>

</div>

`;



try{


let response =
await fetch("/ai_axtar",{


method:"POST",


headers:{


"Content-Type":
"application/json"

},


body:JSON.stringify({

word:word

})


});



let data =
await response.json();



stats.ai++;

updateStats();





/*
   AI cavabı JSON gəlirsə
*/

let aiData;



try{


aiData =
JSON.parse(data.result);


}

catch{


aiData = null;


}





if(aiData){


aiResult.innerHTML =


`

<div class="ai-card-result">


<h3>
🤖 AI Analizi
</h3>



<div class="ai-box">

<span>
✅ Düzgün yazılış
</span>

<p>
${aiData.correct || "Tapılmadı"}
</p>

</div>



<div class="ai-box">

<span>
📖 Sözün mənası
</span>

<p>
${aiData.meaning || "Məlumat yoxdur"}
</p>

</div>




<div class="ai-box">

<span>
🔤 Nitq hissəsi
</span>

<p>
${aiData.part || "Məlumat yoxdur"}
</p>

</div>




<div class="ai-box">

<span>
📝 Nümunə cümlə
</span>

<p>
${aiData.example || "Məlumat yoxdur"}
</p>

</div>



</div>

`;



}

else{


aiResult.innerHTML =


`

<div class="ai-card-result">


<h3>
🤖 AI Analizi
</h3>


<p>

${data.result || "AI cavabı boş gəldi"}

</p>


</div>

`;


}



}


catch(error){


console.log(error);


aiResult.innerHTML =

`

<div class="ai-card-result error">

❌ AI bağlantı xətası

</div>

`;


}



};


}/* ==========================
   SEVİMLİLƏR
========================== */


let favorites =

JSON.parse(

localStorage.getItem("favorites")

)

|| [];





function showFavorites(){



if(!favoritesList)
return;




if(favorites.length === 0){



favoritesList.innerHTML =

`

<p>
Hələ sevimli söz yoxdur.
</p>

`;



return;


}




favoritesList.innerHTML = "";




favorites.forEach(word=>{


favoritesList.innerHTML +=


`

<div class="favorite-item">

⭐ ${word}

</div>

`;


});



}



showFavorites();





if(favoriteBtn){



favoriteBtn.onclick = ()=>{



let word =

wordInput.value.trim();




if(!word)
return;





if(!favorites.includes(word)){



favorites.push(word);



localStorage.setItem(

"favorites",

JSON.stringify(favorites)

);



showFavorites();



}



};



}/* ==========================
   TEMA SİSTEMİ
========================== */


const themeBtn =
document.querySelector(".theme");



const themes = [

"theme-aurora",

"theme-gold",

"theme-emerald",

"theme-arctic"

];





function changeTheme(theme){



themes.forEach(t=>{


document.body.classList.remove(t);


});



document.body.classList.add(theme);



localStorage.setItem(

"theme",

theme

);



}






if(themeBtn){



themeBtn.onclick = ()=>{



let current =
themes.find(t=>

document.body.classList.contains(t)

);



let index =
themes.indexOf(current);



if(index === -1){

index = 0;

}



let next =

themes[

(index + 1)

%

themes.length

];



changeTheme(next);



};



}






// yadda saxlanan tema


let savedTheme =

localStorage.getItem("theme");



if(savedTheme){


changeTheme(savedTheme);


}/* ==========================
   ENTER İLƏ YOXLAMA
========================== */


if(wordInput){


wordInput.addEventListener(
"keydown",
(e)=>{


if(e.key === "Enter"){


if(checkBtn){

checkBtn.click();

}


}


});


}





/* ==========================
   AI ENTER DÜYMƏSİ
========================== */


if(aiResult){


aiResult.innerHTML = "";

}




});