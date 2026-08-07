/*
=============================
WikiHub
autocomplete.js
=============================
*/

"use strict";

let autoBox;

/*--------------------------
 初期化
--------------------------*/

document.addEventListener(

"DOMContentLoaded",

initAutocomplete

);

function initAutocomplete(){

autoBox=document.createElement("div");

autoBox.id="autocompleteBox";

document.body.appendChild(autoBox);

editor.addEventListener(

"keyup",

checkAutocomplete

);

}

/*--------------------------
 [[ を検出
--------------------------*/

function checkAutocomplete(){

const pos=editor.selectionStart;

const text=

editor.value.substring(

0,

pos

);

const match=

text.match(/\[\[([^\]]*)$/);

if(!match){

hideAutocomplete();

return;

}

const keyword=

match[1].toLowerCase();

showSuggestions(keyword);

}

/*--------------------------
 候補表示
--------------------------*/

function showSuggestions(keyword){

autoBox.innerHTML="";

if(!currentWiki)return;

const pages=

currentWiki.pages.filter(

p=>

p.title

.toLowerCase()

.includes(keyword)

);

if(pages.length===0){

hideAutocomplete();

return;

}

pages.forEach(function(page){

const item=

document.createElement("div");

item.className=

"autocompleteItem";

item.textContent=

page.title;

item.onclick=function(){

insertSuggestion(

page.title

);

};

autoBox.appendChild(item);

});

const rect=

editor.getBoundingClientRect();

autoBox.style.left=

rect.left+"px";

autoBox.style.top=

(rect.bottom-5)+"px";

autoBox.style.display="block";

}

/*--------------------------
 挿入
--------------------------*/

function insertSuggestion(title){

const pos=

editor.selectionStart;

const text=

editor.value;

const start=

text.lastIndexOf("[[");

editor.value=

text.substring(

0,

start

)

+

"[["
+

title
+

"]]"

+

text.substring(pos);

hideAutocomplete();

updatePreview();

editor.focus();

}

/*--------------------------
 非表示
--------------------------*/

function hideAutocomplete(){

autoBox.style.display="none";

}
