document.addEventListener("DOMContentLoaded", () => {

"use strict";


/*======================================
 ELEMENTLƏR
======================================*/

const $ = (id) =>
    document.getElementById(id);


const elements = {

    wordInput: $("word"),

    checkBtn: $("checkBtn"),

    result: $("result"),

    aiSearchBtn: $("aiSearchBtn"),

    aiResult: $("aiResult"),

    favoriteBtn: $("favoriteBtn"),

    favoritesList: $("favoritesList"),

    checkedCount: $("checkedCount"),

    checkedCount2: $("checkedCount2"),

    correctCount: $("correctCount"),

    wrongCount: $("wrongCount"),

    aiCount: $("aiCount")

};



/*======================================
 STORAGE
======================================*/

const Storage = {


    get(key, def){


        try{


            const data =
                localStorage.getItem(key);


            return data
                ? JSON.parse(data)
                : def;


        }catch{


            return def;

        }

    },


    set(key,value){


        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

    }


};




/*======================================
 STATİSTİKA
======================================*/


let stats = Storage.get(

    "stats",

    {

        checked:0,

        correct:0,

        wrong:0,

        ai:0

    }

);




function updateStats(){


    const data = [


        [elements.checkedCount,stats.checked],


        [elements.checkedCount2,stats.checked],


        [elements.correctCount,stats.correct],


        [elements.wrongCount,stats.wrong],


        [elements.aiCount,stats.ai]


    ];



    data.forEach(([el,value])=>{


        if(el)

            el.textContent=value;


    });



    Storage.set(

        "stats",

        stats

    );


}



updateStats();




/*======================================
 REQUEST
======================================*/


async function post(url,data){


    const res = await fetch(

        url,

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },


            body:
            JSON.stringify(data)

        }

    );


    return await res.json();


}



/*======================================
 SÖZ YOXLAMA
======================================*/


if(elements.checkBtn){


elements.checkBtn.addEventListener(
"click",
async()=>{


const word =
elements.wordInput.value
.trim();



if(!word){


elements.result.innerHTML =
`
<div class="error">

⚠️ Söz daxil edin

</div>
`;

return;

}



try{


const data = await post(

"/yoxla",

{word}

);



stats.checked++;



if(data.status==="correct"){


stats.correct++;


elements.result.innerHTML =
`
<div class="success">

<h3>✅ Düzgündür</h3>

<p>${data.word}</p>

</div>
`;


}

else{


stats.wrong++;


let suggestionHTML = "";


if(data.suggestions && data.suggestions.length > 0){


suggestionHTML = `

<div class="suggestions">

<h4>💡 Bəlkə bunu nəzərdə tutursunuz?</h4>

${data.suggestions.map(word => `

<button class="suggest-word">
${word}
</button>

`).join("")}

</div>

`;

}


elements.result.innerHTML =
`
<div class="error">

<h3>❌ Tapılmadı</h3>

<p>${data.message}</p>

${suggestionHTML}

</div>
`;

}


updateStats();



}catch(error){


console.error(error);


elements.result.innerHTML =
`
<div class="error">

Server xətası

</div>
`;

}


});


}
/*======================================
 AI ANALİZ
======================================*/


if(elements.aiSearchBtn){


elements.aiSearchBtn.addEventListener(
"click",
async()=>{


const word =
elements.wordInput.value
.trim();



if(!word){


elements.aiResult.innerHTML =
`
<div class="error">

Əvvəl söz yazın

</div>
`;

return;

}



elements.aiSearchBtn.disabled=true;


elements.aiSearchBtn.innerHTML=
"⏳ Analiz edilir...";



elements.aiResult.innerHTML =
`
<div class="ai-card-result">

🤖 AI analiz edir...

</div>
`;



try{


const data = await post(

"/ai_axtar",

{word}

);



stats.ai++;


updateStats();



elements.aiResult.innerHTML =
`

<div class="ai-card-result fade">


<h3>🤖 AI Analizi</h3>



<div class="ai-box">

<span>✅ Düzgün yazılış</span>

<p>
${data.correct || "-"}
</p>

</div>



<div class="ai-box">

<span>📖 Mənası</span>

<p>
${data.meaning || "-"}
</p>

</div>



<div class="ai-box">

<span>🔤 Nitq hissəsi</span>

<p>
${data.part || "-"}
</p>

</div>



<div class="ai-box">

<span>📝 Nümunə</span>

<p>
${data.example || "-"}
</p>

</div>



</div>

`;



}catch(error){


console.error(error);



elements.aiResult.innerHTML =
`
<div class="error">

❌ AI cavabı alınmadı

</div>
`;



}finally{


elements.aiSearchBtn.disabled=false;


elements.aiSearchBtn.innerHTML=
"🤖 AI ilə analiz et";


}



});


}



/*======================================
 ENTER İLƏ YOXLAMA
======================================*/


if(elements.wordInput){


elements.wordInput.addEventListener(

"keydown",

(e)=>{


if(e.key==="Enter"){


e.preventDefault();


elements.checkBtn?.click();


}


}

);


}





/*======================================
 TƏKLİF EDİLƏN SÖZƏ BASMA
======================================*/


document.addEventListener(

"click",

(e)=>{


if(
e.target.classList.contains(
"suggest-word"
)

){


elements.wordInput.value =
e.target.textContent.trim();



elements.checkBtn.click();


}


}

);
/*======================================
 FAVORİLƏR
======================================*/


let favorites = Storage.get(

"favorites",

[]

);



function renderFavorites(){


if(!elements.favoritesList)

return;



if(favorites.length===0){


elements.favoritesList.innerHTML=
`
<p>
Hələ sevimli söz yoxdur.
</p>
`;

return;

}



elements.favoritesList.innerHTML="";



favorites.forEach((word,index)=>{


const div =
document.createElement("div");



div.className =
"favorite-item";



div.innerHTML =
`

<span>
⭐ ${word}
</span>


<button 
class="delete-favorite"
data-index="${index}">
❌
</button>

`;



elements.favoritesList.appendChild(div);



});


}





if(elements.favoriteBtn){


elements.favoriteBtn.addEventListener(

"click",

()=>{


const word =
elements.wordInput.value.trim();



if(!word)

return;



if(!favorites.includes(word)){


favorites.unshift(word);


Storage.set(

"favorites",

favorites

);



renderFavorites();


}


}

);


}





document.addEventListener(

"click",

(e)=>{


if(
e.target.classList.contains(
"delete-favorite"
)

){


const index =
Number(
e.target.dataset.index
);



favorites.splice(

index,

1

);



Storage.set(

"favorites",

favorites

);



renderFavorites();



}



}

);



renderFavorites();





/*======================================
 TEMA
======================================*/


const themeBtn =
document.querySelector(".theme");



if(themeBtn){


themeBtn.addEventListener(

"click",

()=>{


document.body.classList.toggle(
"theme-gold"
);



}


);


}





/*======================================
 AUTO FOCUS
======================================*/


if(elements.wordInput){


elements.wordInput.focus();


}





/*======================================
 SƏHİFƏ ANİMASİYASI
======================================*/


const observer =
new IntersectionObserver(

(entries)=>{


entries.forEach(entry=>{


if(entry.isIntersecting){


entry.target.classList.add(
"show"
);


}


});


},


{


threshold:0.15


}


);





document.querySelectorAll(

".feature,.stat-card,.hero-right,.favorites-section"

).forEach(el=>{


el.classList.add(

"hidden"

);



observer.observe(el);



});





});