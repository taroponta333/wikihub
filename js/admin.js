/*
==============================
WikiHub
admin.js
==============================
*/

"use strict";

let currentPanel="";

/*==========================
起動
==========================*/

document.addEventListener(

"DOMContentLoaded",

initAdmin

);

function initAdmin(){

loadUsers();

loadWikis();

}

/*==========================
画面切替
==========================*/

function showPanel(name){

currentPanel=name;

switch(name){

case "users":

showUsers();

break;

case "pages":

showPages();

break;

case "files":

showFiles();

break;

case "categories":

showCategories();

break;

case "history":

showHistory();

break;

case "settings":

showSettings();

break;

}

}
