/*
====================================
 WikiHub
 wiki.js
 Part3-2
====================================
*/

"use strict";

/*==============================
 初期化
==============================*/

let wikis=[];

document.addEventListener("DOMContentLoaded",init);

function init(){

    loadWikis();

    setupIconPreview();

    setupCreateButton();

}

/*==============================
 Wiki読み込み
==============================*/

function loadWikis(){

    const data=localStorage.getItem("wikihub_wikis");

    if(data){

        wikis=JSON.parse(data);

    }

}

/*==============================
 保存
==============================*/

function saveWikis(){

    localStorage.setItem(
        "wikihub_wikis",
        JSON.stringify(wikis)
    );

}

/*==============================
 アイコン
==============================*/

function setupIconPreview(){

    const input=document.getElementById("wikiIcon");

    if(!input)return;

    input.addEventListener("change",function(){

        const file=this.files[0];

        if(!file)return;

        const reader=new FileReader();

        reader.onload=function(e){

            document
            .getElementById("wikiIconPreview")
            .src=e.target.result;

        };

        reader.readAsDataURL(file);

    });

}

/*==============================
 作成ボタン
==============================*/

function setupCreateButton(){

    const button=document.getElementById("createWiki");

    if(!button)return;

    button.addEventListener("click",createWiki);

}

/*==============================
 Wiki作成
==============================*/

function createWiki(){

    const session=JSON.parse(
        localStorage.getItem("wikihub_session")
    );

    if(!session){

        alert("ログインしてください。");

        return;

    }

    const name=
    document.getElementById("wikiName").value.trim();

    if(name===""){

        alert("Wiki名を入力してください。");

        return;

    }

    if(findWiki(name)){

        alert("同じ名前のWikiがあります。");

        return;

    }

    const wiki={

        id:createWikiID(),

        name:name,

        description:
        document.getElementById("wikiDescription").value,

        icon:
        document.getElementById("wikiIconPreview").src,

        visibility:
        document.getElementById("wikiVisibility").value,

        category:
        document.getElementById("wikiCategory").value,

        theme:
        document.getElementById("wikiTheme").value,

        owner:
        session.username,

        created:
        new Date().toISOString(),

        comments:
        document.getElementById("allowComments").checked,

        registerOnly:
        document.getElementById("allowRegisterOnly").checked,

        pages:[
            {

                id:createPageID(),

                title:
                document.getElementById("mainPage").value,

                content:
                "# ようこそ！",

                created:
                new Date().toISOString(),

                updated:
                new Date().toISOString()

            }

        ],

        members:[

            session.username

        ],

        statistics:{

            pages:1,

            files:0,

            edits:0,

            members:1

        }

    };

    wikis.push(wiki);

    saveWikis();

    alert("Wikiを作成しました！");

    location.href="index.html";

}

/*==============================
 Wiki検索
==============================*/

function findWiki(name){

    return wikis.find(function(w){

        return w.name===name;

    });

}

/*==============================
 ID生成
==============================*/

function createWikiID(){

    return "wiki_"+crypto.randomUUID();

}

function createPageID(){

    return "page_"+crypto.randomUUID();

}
