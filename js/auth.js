/*
====================================
 WikiHub
 auth.js
 Part2-3
====================================
*/

"use strict";

/*=========================
 起動
=========================*/

document.addEventListener("DOMContentLoaded", init);

function init(){

    loadUsers();

    setupIconPreview();

    setupRegister();

}

/*=========================
 ユーザー一覧
=========================*/

let users=[];

function loadUsers(){

    const data=localStorage.getItem("wikihub_users");

    if(data){

        users=JSON.parse(data);

    }

}

function saveUsers(){

    localStorage.setItem(
        "wikihub_users",
        JSON.stringify(users)
    );

}

/*=========================
 アイコンプレビュー
=========================*/

function setupIconPreview(){

    const input=document.getElementById("iconInput");

    if(!input)return;

    input.addEventListener("change",function(){

        const file=this.files[0];

        if(!file)return;

        const reader=new FileReader();

        reader.onload=function(e){

            document
            .getElementById("iconPreview")
            .src=e.target.result;

        };

        reader.readAsDataURL(file);

    });

}

/*=========================
 アカウント作成
=========================*/

function setupRegister(){

    const button=document.getElementById("createAccount");

    if(!button)return;

    button.addEventListener("click",createAccount);

}

/*=========================
 登録
=========================*/

function createAccount(){

    const username=
    document.getElementById("username").value.trim();

    const displayName=
    document.getElementById("displayName").value.trim();

    const email=
    document.getElementById("email").value.trim();

    const password=
    document.getElementById("password").value;

    const password2=
    document.getElementById("password2").value;

    const bio=
    document.getElementById("bio").value.trim();

    const agree=
    document.getElementById("agree").checked;

    const icon=
    document.getElementById("iconPreview").src;

    if(username===""){

        alert("ユーザー名を入力してください。");
        return;

    }

    if(password.length<8){

        alert("パスワードは8文字以上です。");
        return;

    }

    if(password!==password2){

        alert("パスワードが一致しません。");
        return;

    }

    if(!agree){

        alert("利用規約に同意してください。");
        return;

    }

    if(findUser(username)){

        alert("そのユーザー名は使用されています。");
        return;

    }

    const user={

        id:createUUID(),

        username:username,

        displayName:
        displayName||username,

        email:email,

        password:password,

        bio:bio,

        icon:icon,

        banner:"",

        created:new Date().toISOString(),

        role:
        users.length===0
        ?"owner"
        :"user",

        editCount:0,

        articleCount:0,

        badges:[],

        favorites:[],

        settings:{

            theme:"light",

            language:"ja"

        }

    };

    users.push(user);

    saveUsers();

    alert("アカウントを作成しました！");

    location.href="login.html";

}

/*=========================
 検索
=========================*/

function findUser(name){

    return users.find(function(user){

        return user.username===name;

    });

}

/*=========================
 UUID
=========================*/

function createUUID(){

    return crypto.randomUUID();

}
