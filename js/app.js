/*
==================================
 WikiHub
 app.js
 Part1-3
==================================
*/

"use strict";

/*==============================
  起動
==============================*/

document.addEventListener("DOMContentLoaded", init);

function init(){

    console.log("WikiHub Start");

    loadTheme();

    loadRecent();

    setupSearch();

    setupButtons();

}

/*==============================
  ボタン
==============================*/

function setupButtons(){

    const login=document.getElementById("loginButton");
    const register=document.getElementById("registerButton");

    if(login){

        login.addEventListener("click",function(){

            location.href="login.html";

        });

    }

    if(register){

        register.addEventListener("click",function(){

            location.href="register.html";

        });

    }

}

/*==============================
  検索
==============================*/

function setupSearch(){

    const box=document.getElementById("searchBox");
    const button=document.getElementById("searchButton");

    if(!box)return;

    function search(){

        const word=box.value.trim();

        if(word===""){

            alert("検索キーワードを入力してください。");

            return;

        }

        console.log("検索:",word);

        alert("検索機能はPart2で実装します。\n\n検索："+word);

    }

    button.addEventListener("click",search);

    box.addEventListener("keydown",function(e){

        if(e.key==="Enter"){

            search();

        }

    });

}

/*==============================
  ダークモード
==============================*/

function loadTheme(){

    let theme=localStorage.getItem("theme");

    if(theme===null){

        theme="light";

        localStorage.setItem("theme",theme);

    }

    if(theme==="dark"){

        document.body.classList.add("dark");

    }

}

function toggleTheme(){

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

    }else{

        localStorage.setItem("theme","light");

    }

}

/*==============================
  最近見た記事
==============================*/

function loadRecent(){

    let recent=JSON.parse(localStorage.getItem("recentPages"));

    if(recent===null){

        recent=[];

        localStorage.setItem("recentPages",JSON.stringify(recent));

    }

    console.log("最近見た記事",recent);

}

/*==============================
  お気に入り
==============================*/

function addFavorite(title){

    let favorites=JSON.parse(localStorage.getItem("favorites"));

    if(favorites===null){

        favorites=[];

    }

    if(!favorites.includes(title)){

        favorites.push(title);

    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

}

/*==============================
  通知
==============================*/

function showToast(message){

    const toast=document.createElement("div");

    toast.className="toast";

    toast.textContent=message;

    document.body.appendChild(toast);

    setTimeout(function(){

        toast.classList.add("show");

    },10);

    setTimeout(function(){

        toast.classList.remove("show");

        setTimeout(function(){

            toast.remove();

        },300);

    },2500);

}

/*==============================
  Utility
==============================*/

function save(key,data){

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}

function load(key){

    return JSON.parse(
        localStorage.getItem(key)
    );

}
