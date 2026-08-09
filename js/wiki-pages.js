/*========================================
 WikiHub
 wiki-pages.js
========================================*/

let currentWikiId = null;
let currentWiki = null;
let pages = [];

/*========================================
 初期化
========================================*/

window.addEventListener("load", initWikiPages);

function initWikiPages(){

    const params = new URLSearchParams(location.search);

    currentWikiId = Number(params.get("wiki"));

    currentWiki = getWiki(currentWikiId);

    if(!currentWiki){

        alert("Wikiが見つかりません。");

        location.href = "explorer.html";

        return;

    }

    document.getElementById("wikiTitle").textContent =
        currentWiki.title;

    document.getElementById("wikiDescription").textContent =
        currentWiki.description || "説明はありません。";

    loadPages();

}

/*========================================
 記事読み込み
========================================*/

function loadPages(){

    pages = getWikiPages(currentWikiId);

    renderPageList(pages);

    renderCategories();

    renderStatistics();

    renderRecentPages();

    renderPopularPages();

}

/*========================================
 記事一覧
========================================*/

function renderPageList(list){

    const box =
        document.getElementById(
            "pageList"
        );


    if(list.length === 0){

        box.innerHTML = `

            <div class="empty">

                記事がありません。

                <br><br>

                最初の記事を作成しましょう！

            </div>

        `;

        return;

    }


    box.innerHTML = "";


    list.forEach(page => {

        const card =
            document.createElement("div");


        card.className =
            "article-card hover-up";


        card.innerHTML = `

            <div
                class="article-title"
                style="cursor:pointer;"
            >

                ${page.icon

                    ? `<img
                        src="${escapeHtml(page.icon)}"
                        style="
                            width:32px;
                            height:32px;
                            border-radius:8px;
                            object-fit:cover;
                            vertical-align:middle;
                            margin-right:8px;
                        "
                    >`

                    : "📄"
                }

                ${escapeHtml(page.title)}

            </div>


            <div class="article-info">

                <span>
                    👤 ${escapeHtml(
                        page.author || "不明"
                    )}
                </span>

                <span>
                    📂 ${escapeHtml(
                        page.category || "なし"
                    )}
                </span>

                <span>
                    👁 ${page.views || 0}
                </span>

                <span>
                    ⭐ ${page.stars || 0}
                </span>

            </div>


            <button
                class="btn btn-primary"
                onclick="openPage('${page.id}')">

                📖 開く

            </button>

        `;


        card
            .querySelector(".article-title")
            .onclick = function(){

                openPage(page.id);

            };


        box.appendChild(card);


        const spacer =
            document.createElement("br");


        box.appendChild(spacer);

    });

}
/*========================================
 開く
========================================*/

function openPage(id){

    location.href =

    "wiki.html?id="+id;

}

/*========================================
 検索
========================================*/

function searchPage(){

    const keyword =

    document

    .getElementById("searchInput")

    .value

    .trim()

    .toLowerCase();

    if(keyword===""){

        renderPageList(pages);

        return;

    }

    const result = pages.filter(page=>{

        return(

            page.title

            .toLowerCase()

            .includes(keyword)

            ||

            page.content

            .toLowerCase()

            .includes(keyword)

        );

    });

    renderPageList(result);

}

/*========================================
 カテゴリ
========================================*/

function renderCategories(){

    const box =

    document.getElementById(

        "categoryList"

    );

    const categories =

    [...new Set(

        pages.map(

            p=>p.category

        )

    )];

    box.innerHTML = "";

    categories.forEach(cat=>{

        box.innerHTML +=

        `<div class="tag">

        ${cat||"なし"}

        </div>`;

    });

}

/*========================================
 統計
========================================*/

function renderStatistics(){

    document.getElementById(

        "pageCount"

    ).textContent =

    pages.length;

    let total=0;

    pages.forEach(page=>{

        total+=page.views;

    });

    document.getElementById(

        "totalViews"

    ).textContent=

    total;

}

/*========================================
 最近更新
========================================*/

function renderRecentPages(){

    const box=

    document.getElementById(

        "recentPages"

    );

    const recent=

    [...pages]

    .sort((a,b)=>

    new Date(b.updatedAt)-new Date(a.updatedAt))

    .slice(0,5);

    box.innerHTML="";

    recent.forEach(page=>{

        box.innerHTML+=`

        <div>

        📄

        <a href="wiki.html?id=${page.id}">

        ${page.title}

        </a>

        </div>

        `;

    });

}

/*========================================
 人気記事
========================================*/

function renderPopularPages(){

    const box=

    document.getElementById(

        "popularPages"

    );

    const popular=

    [...pages]

    .sort((a,b)=>b.views-a.views)

    .slice(0,5);

    box.innerHTML="";

    popular.forEach(page=>{

        box.innerHTML+=`

        <div>

        ⭐

        <a href="wiki.html?id=${page.id}">

        ${page.title}

        </a>

        </div>

        `;

    });

}

/*========================================
 新しい記事
========================================*/

function createPageButton(){

    location.href=

    "create-page.html?wiki="+

    currentWikiId;

}

/*========================================
 Wikiトップ
========================================*/

function goHome(){

    location.href=

    "explorer.html";

}

function escapeHtml(value){

    return String(value ?? "")

        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}
