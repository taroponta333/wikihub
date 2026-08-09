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
/*==================================
 Wiki一覧表示
==================================*/

document.addEventListener("DOMContentLoaded",function(){

    if(document.getElementById("wikiContainer")){

        renderWikiList();

        updateStatistics();

        setupExplorerButtons();

        setupSearch();

    }

});

/*==================================
 表示
==================================*/

function renderWikiList(){

    const container=document.getElementById("wikiContainer");

    if(!container)return;

    container.innerHTML="";

    loadWikis();

    if(wikis.length===0){

        container.innerHTML=`
        <div class="panel">
            <h2>まだWikiがありません</h2>
            <p>「＋ 新しいWiki」から作成できます。</p>
        </div>
        `;

        return;

    }

    wikis.forEach(function(wiki){

        const card=document.createElement("div");

        card.className="wikiCard";

        card.innerHTML=`

        <div class="wikiTop">

            <img
                src="${wiki.icon}"
                class="wikiIcon">

            <div>

                <h2>${wiki.name}</h2>

                <p>${wiki.description}</p>

            </div>

        </div>

        <div class="wikiInfo">

            👤 ${wiki.owner}<br>
            📂 ${wiki.category}<br>
            📄 ${wiki.statistics.pages}記事<br>
            👥 ${wiki.statistics.members}人

        </div>

        <div class="wikiButtons">

            <button
                onclick="openWiki('${wiki.id}')">

                開く

            </button>

            <button
                onclick="settingWiki('${wiki.id}')">

                設定

            </button>

            <button
                onclick="deleteWiki('${wiki.id}')">

                削除

            </button>

        </div>

        `;

        container.appendChild(card);

    });

}

/*==================================
 Wikiを開く
==================================*/

function openWiki(id){

    localStorage.setItem(

        "wikihub_currentWiki",

        id

    );

    location.href="wiki.html";

}

/*==================================
 Wiki設定
==================================*/

function settingWiki(id){

    localStorage.setItem(

        "wikihub_currentWiki",

        id

    );

    location.href="wiki-settings.html";

}

/*==================================
 削除
==================================*/

function deleteWiki(id){

    if(!confirm("このWikiを削除しますか？")){

        return;

    }

    wikis=wikis.filter(function(w){

        return w.id!==id;

    });

    saveWikis();

    renderWikiList();

    updateStatistics();

}

/*==================================
 検索
==================================*/

function setupSearch(){

    const box=document.getElementById("wikiSearch");

    if(!box)return;

    box.addEventListener("input",function(){

        const keyword=

        this.value.toLowerCase();

        const cards=

        document.querySelectorAll(".wikiCard");

        cards.forEach(function(card){

            if(card.textContent.toLowerCase().includes(keyword)){

                card.style.display="block";

            }else{

                card.style.display="none";

            }

        });

    });

}

/*==================================
 統計
==================================*/

function updateStatistics(){

    let pages=0;

    let members=0;

    wikis.forEach(function(w){

        pages+=w.statistics.pages;

        members+=w.statistics.members;

    });

    document.getElementById("wikiCount").textContent=wikis.length;

    document.getElementById("pageCount").textContent=pages;

    document.getElementById("memberCount").textContent=members;

}

/*==================================
 ボタン
==================================*/

function setupExplorerButtons(){

    const newWiki=document.getElementById("newWiki");

    if(newWiki){

        newWiki.onclick=function(){

            location.href="create-wiki.html";

        };

    }

    const backup=document.getElementById("backup");

    if(backup){

        backup.onclick=function(){

            exportDatabase();

        };

    }

    const restore=document.getElementById("restore");

    if(restore){

        restore.onclick=function(){

            importDatabase();

        };

    }

}

/*==================================
 バックアップ
==================================*/

function exportDatabase(){

    const backup={

        users:JSON.parse(

            localStorage.getItem("wikihub_users")

        ),

        wikis:wikis,

        exported:new Date().toISOString(),

        version:"0.1"

    };

    const blob=new Blob(

        [

            JSON.stringify(

                backup,

                null,

                2

            )

        ],

        {

            type:"application/json"

        }

    );

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="WikiHub_Backup.json";

    a.click();

}

/*==================================
 復元
==================================*/

function importDatabase(){

    const input=document.createElement("input");

    input.type="file";

    input.accept=".json";

    input.onchange=function(){

        const file=input.files[0];

        if(!file)return;

        const reader=new FileReader();

        reader.onload=function(){

            const data=

            JSON.parse(reader.result);

            if(data.users){

                localStorage.setItem(

                    "wikihub_users",

                    JSON.stringify(data.users)

                );

            }

            if(data.wikis){

                localStorage.setItem(

                    "wikihub_wikis",

                    JSON.stringify(data.wikis)

                );

            }

            alert("復元しました！");

            location.reload();

        };

        reader.readAsText(file);

    };

    input.click();

}
/*==================================
 現在のWiki
==================================*/

let currentWiki=null;
let currentPage=null;

document.addEventListener("DOMContentLoaded",function(){

    if(document.getElementById("pageTitle")){

        openCurrentWiki();

    }

});

/*==================================
 Wiki読み込み
==================================*/

function openCurrentWiki(){

    const id=localStorage.getItem(
        "wikihub_currentWiki"
    );

    if(!id){

        alert("Wikiが選択されていません。");
        location.href="explorer.html";
        return;

    }

    loadWikis();

    currentWiki=wikis.find(function(w){

        return w.id===id;

    });

    if(!currentWiki){

        alert("Wikiが見つかりません。");
        return;

    }

    renderPageList();

    openPage(currentWiki.pages[0].id);

    updateWikiInfo();

}

/*==================================
 ページ一覧
==================================*/

function renderPageList(){

    const list=document.getElementById("pageList");

    if(!list)return;

    list.innerHTML="";

    currentWiki.pages.forEach(function(page){

        const item=document.createElement("div");

        item.className="wikiCard";

        item.style.marginBottom="8px";

        item.innerHTML=`

            📄 ${page.title}

        `;

        item.onclick=function(){

            openPage(page.id);

        };

        list.appendChild(item);

    });

}

/*==================================
 ページを開く
==================================*/

function openPage(id){

    currentPage=currentWiki.pages.find(function(p){

        return p.id===id;

    });

    if(!currentPage)return;

    document.getElementById("pageTitle").textContent=
    currentPage.title;

    document.getElementById("pageInfo").innerHTML=`

        作成：
        ${currentPage.created}

        <br>

        更新：
        ${currentPage.updated}

    `;

    document.getElementById("pageContent").innerHTML=

        parseWiki(currentPage.content);

    createTOC();

}

/*==================================
 Wiki記法
==================================*/

function parseWiki(text){

    let html=text;

    html=html.replace(/^# (.*)$/gm,"<h1>$1</h1>");

    html=html.replace(/^## (.*)$/gm,"<h2>$1</h2>");

    html=html.replace(/^### (.*)$/gm,"<h3>$1</h3>");

    html=html.replace(/\*\*(.*?)\*\*/g,"<b>$1</b>");

    html=html.replace(/\*(.*?)\*/g,"<i>$1</i>");

    html=html.replace(/\n/g,"<br>");

    html=html.replace(

        /\[\[(.*?)\]\]/g,

        function(match,title){

            return `<a href="#" onclick="jumpPage('${title}')">${title}</a>`;

        }

    );

    return html;

}

/*==================================
 内部リンク
==================================*/

function jumpPage(title){

    const page=currentWiki.pages.find(function(p){

        return p.title===title;

    });

    if(!page){

        alert("ページがありません。");
        return;

    }

    openPage(page.id);

}

/*==================================
 目次
==================================*/

function createTOC(){

    const toc=document.getElementById("toc");

    if(!toc)return;

    toc.innerHTML="";

    const headers=

    document.querySelectorAll(

        "#pageContent h1,#pageContent h2,#pageContent h3"

    );

    headers.forEach(function(h,index){

        const div=document.createElement("div");

        div.innerHTML=

        (index+1)+" "+h.textContent;

        div.style.cursor="pointer";

        div.onclick=function(){

            h.scrollIntoView({

                behavior:"smooth"

            });

        };

        toc.appendChild(div);

    });

}

/*==================================
 Wiki情報
==================================*/

function updateWikiInfo(){

    document.getElementById("wikiPages").textContent=

    currentWiki.statistics.pages;

    document.getElementById("wikiMembers").textContent=

    currentWiki.statistics.members;

    document.getElementById("wikiCategories").textContent=

    1;

}

/*==================================
 Wiki検索
==================================*/

const pageSearch=document.getElementById("pageSearch");

if(pageSearch){

pageSearch.addEventListener("input",function(){

const word=this.value.toLowerCase();

const cards=document.querySelectorAll("#pageList .wikiCard");

cards.forEach(function(card){

if(card.textContent.toLowerCase().includes(word)){

card.style.display="block";

}else{

card.style.display="none";

}

});

});

}

/*==================================
 Page System
==================================*/

function getPages(){

    return JSON.parse(

        localStorage.getItem(

            "wikihub_pages"

        )

    )||[];

}

function savePages(pages){

    localStorage.setItem(

        "wikihub_pages",

        JSON.stringify(pages)

    );

}
function createPage(

    wikiId,

    title,

    category,

    content

){

    const pages=getPages();

    const session=getSession();

    const page={

        id:Date.now(),

        wikiId,

        title,

        icon:"",

        category,

        tags:[],

        content,

        author:session.username,

        createdAt:new Date().toISOString(),

        updatedAt:new Date().toISOString(),

        views:0,

        stars:0,

        comments:[],

        history:[],

        attachments:[]

    };

    pages.push(page);

    savePages(pages);

    return page;

}
function createMainPage(

    wikiId

){

    createPage(

        wikiId,

        "メインページ",

        "ホーム",

`# ようこそ！

このWikiへようこそ！

この記事を編集してWikiを作りましょう。`

    );

}

/*==================================
 Wiki取得
==================================*/

function getWiki(wikiId){

    const data =
        localStorage.getItem(
            "wikihub_wikis"
        );

    if(!data){
        return null;
    }

    const list =
        JSON.parse(data);

    return list.find(

        wiki =>
            String(wiki.id) ===
            String(wikiId)

    ) || null;

}


/*==================================
 Wiki保存
==================================*/

function saveWiki(wiki){

    const data =
        localStorage.getItem(
            "wikihub_wikis"
        );

    const list =
        data
        ? JSON.parse(data)
        : [];


    const index =
        list.findIndex(

            item =>
                String(item.id) ===
                String(wiki.id)

        );


    if(index === -1){

        list.push(wiki);

    }else{

        list[index] = wiki;

    }


    localStorage.setItem(

        "wikihub_wikis",

        JSON.stringify(list)

    );


    return wiki;

}

function getWikiPages(

    wikiId

){

    return getPages()

    .filter(

        p=>p.wikiId===wikiId

    );

}
function getPage(

    id

){

    return getPages()

    .find(

        p=>p.id==id

    );

}
function updatePage(

    id,

    data

){

    const pages=getPages();

    const page=

    pages.find(

        p=>p.id==id

    );

    if(!page)return;

    Object.assign(

        page,

        data

    );

    page.updatedAt=

    new Date()

    .toISOString();

    savePages(pages);

}
function deletePage(

    id

){

    const pages=

    getPages()

    .filter(

        p=>p.id!=id

    );

    savePages(

        pages

    );

}
function searchPages(

    wikiId,

    keyword

){

    keyword=

    keyword.toLowerCase();

    return getWikiPages(

        wikiId

    ).filter(

        page=>

        page.title

        .toLowerCase()

        .includes(keyword)

        ||

        page.content

        .toLowerCase()

        .includes(keyword)

    );

}
