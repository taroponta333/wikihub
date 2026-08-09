/*
========================================
 WikiHub
 wiki-pages.js
 記事一覧ページ
========================================
*/

"use strict";


/* ========================================
   グローバル
======================================== */

let currentWiki = null;

let currentWikiId = null;

let allPages = [];

let displayedPages = [];

let currentSearch = "";

let currentCategory = "";

let currentSort = "updated";


/* ========================================
   初期化
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    initWikiPages
);


function initWikiPages(){

    console.log(
        "WikiHub wiki-pages.js initialized"
    );


    currentWikiId =
        getCurrentWikiId();


    loadWiki();


    setupButtons();


    setupSearch();


    setupSortButtons();


    renderAll();

}


/* ========================================
   現在のWiki ID
======================================== */

function getCurrentWikiId(){

    const params =
        new URLSearchParams(
            location.search
        );


    const urlWiki =
        params.get("wiki");


    if(urlWiki){

        localStorage.setItem(
            "wikihub_currentWiki",
            String(urlWiki)
        );

        return String(urlWiki);

    }


    const stored =
        localStorage.getItem(
            "wikihub_currentWiki"
        );


    if(stored){

        return String(stored);

    }


    return null;

}


/* ========================================
   Wikiデータ読み込み
======================================== */

function loadWiki(){

    let wikis = [];


    try{

        wikis =
            JSON.parse(
                localStorage.getItem(
                    "wikihub_wikis"
                )
            ) || [];

    }catch(error){

        console.error(
            "Wikiデータ読み込みエラー:",
            error
        );

        wikis = [];

    }


    if(!Array.isArray(wikis)){

        wikis = [];

    }


    /* Wikiがない */

    if(wikis.length === 0){

        currentWiki = null;

        allPages = [];

        return;

    }


    /* 現在のWikiを検索 */

    if(currentWikiId){

        currentWiki =
            wikis.find(
                wiki =>
                    String(wiki.id) ===
                    String(currentWikiId)
            ) || null;

    }


    /* 見つからなければ先頭 */

    if(!currentWiki){

        currentWiki =
            wikis[0];

        currentWikiId =
            String(currentWiki.id);


        localStorage.setItem(
            "wikihub_currentWiki",
            currentWikiId
        );

    }


    /* pages */

    if(
        currentWiki &&
        Array.isArray(
            currentWiki.pages
        )
    ){

        allPages =
            currentWiki.pages.slice();

    }else{

        allPages = [];

    }


    console.log(
        "Current Wiki:",
        currentWiki
    );


    console.log(
        "Pages:",
        allPages
    );

}


/* ========================================
   ボタン
======================================== */

function setupButtons(){

    const homeButton =
        document.getElementById(
            "wikiHomeButton"
        );


    if(homeButton){

        homeButton.addEventListener(
            "click",
            goHome
        );

    }


    const createButton =
        document.getElementById(
            "createPageButton"
        );


    if(createButton){

        createButton.addEventListener(
            "click",
            createPageButton
        );

    }


    const headerCreate =
        document.getElementById(
            "createPageHeaderButton"
        );


    if(headerCreate){

        headerCreate.addEventListener(
            "click",
            createPageButton
        );

    }


    const bottomCreate =
        document.getElementById(
            "newPageButton"
        );


    if(bottomCreate){

        bottomCreate.addEventListener(
            "click",
            createPageButton
        );

    }

}


/* ========================================
   記事作成
======================================== */

function createPageButton(){

    if(!currentWiki){

        alert(
            "Wikiが選択されていません。"
        );

        return;

    }


    localStorage.setItem(
        "wikihub_currentWiki",
        String(currentWiki.id)
    );


    localStorage.removeItem(
        "wikihub_currentPage"
    );


    location.href =
        "editor.html?new=1&wiki=" +
        encodeURIComponent(
            currentWiki.id
        );

}


/* ========================================
   Wikiトップ
======================================== */

function goHome(){

    if(currentWiki){

        localStorage.setItem(
            "wikihub_currentWiki",
            String(currentWiki.id)
        );

    }


    location.href =
        "wiki.html";

}


/* ========================================
   検索
======================================== */

function setupSearch(){

    const input =
        document.getElementById(
            "searchInput"
        );


    const button =
        document.getElementById(
            "searchButton"
        );


    if(input){

        input.addEventListener(
            "input",
            function(){

                currentSearch =
                    this.value.trim()
                    .toLowerCase();


                renderAll();

            }
        );


        input.addEventListener(
            "keydown",
            function(event){

                if(event.key === "Enter"){

                    event.preventDefault();

                    currentSearch =
                        this.value.trim()
                        .toLowerCase();

                    renderAll();

                }

            }
        );

    }


    if(button){

        button.addEventListener(
            "click",
            function(){

                if(input){

                    currentSearch =
                        input.value
                        .trim()
                        .toLowerCase();

                }

                renderAll();

            }
        );

    }

}


/* ========================================
   並び順
======================================== */

function setupSortButtons(){

    const updatedButton =
        document.getElementById(
            "sortUpdatedButton"
        );


    const titleButton =
        document.getElementById(
            "sortTitleButton"
        );


    if(updatedButton){

        updatedButton.addEventListener(
            "click",
            function(){

                currentSort =
                    "updated";

                renderPageList();

            }
        );

    }


    if(titleButton){

        titleButton.addEventListener(
            "click",
            function(){

                currentSort =
                    "title";

                renderPageList();

            }
        );

    }

}


/* ========================================
   全体描画
======================================== */

function renderAll(){

    renderWikiInfo();

    renderCategories();

    renderPageList();

    renderStatistics();

    renderRecentPages();

    renderPopularPages();

}


/* ========================================
   Wiki情報
======================================== */

function renderWikiInfo(){

    const title =
        document.getElementById(
            "wikiTitle"
        );


    const description =
        document.getElementById(
            "wikiDescription"
        );


    if(!currentWiki){

        if(title){

            title.textContent =
                "Wikiがありません";

        }


        if(description){

            description.textContent =
                "Wikiデータを作成してください。";

        }

        return;

    }


    if(title){

        title.textContent =
            currentWiki.name ||
            currentWiki.title ||
            "Wiki";

    }


    if(description){

        description.textContent =
            currentWiki.description ||
            "このWikiにはまだ説明がありません。";

    }

}


/* ========================================
   カテゴリ
======================================== */

function renderCategories(){

    const container =
        document.getElementById(
            "categoryList"
        );


    if(!container){

        return;

    }


    const categories = {};


    allPages.forEach(
        page => {

            const category =
                page.category ||
                "未分類";


            if(!categories[category]){

                categories[category] = 0;

            }


            categories[category]++;

        }
    );


    const names =
        Object.keys(
            categories
        ).sort();


    if(names.length === 0){

        container.innerHTML =
            "<p>カテゴリはありません。</p>";

        return;

    }


    container.innerHTML = "";


    /* 全記事 */

    const allButton =
        document.createElement(
            "button"
        );


    allButton.type =
        "button";


    allButton.className =
        "btn btn-secondary w100";


    allButton.textContent =
        "📚 すべての記事 (" +
        allPages.length +
        ")";


    allButton.addEventListener(
        "click",
        function(){

            currentCategory = "";

            renderAll();

        }
    );


    container.appendChild(
        allButton
    );


    /* カテゴリ */

    names.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "btn btn-secondary w100 mt10";


            button.textContent =
                "📁 " +
                category +
                " (" +
                categories[category] +
                ")";


            button.addEventListener(
                "click",
                function(){

                    currentCategory =
                        category;

                    renderAll();

                }
            );


            container.appendChild(
                button
            );

        }
    );

}


/* ========================================
   記事フィルター
======================================== */

function getFilteredPages(){

    let pages =
        allPages.slice();


    /* カテゴリ */

    if(currentCategory){

        pages =
            pages.filter(
                page =>
                    (
                        page.category ||
                        "未分類"
                    ) ===
                    currentCategory
            );

    }


    /* 検索 */

    if(currentSearch){

        pages =
            pages.filter(
                page => {

                    const title =
                        String(
                            page.title || ""
                        ).toLowerCase();


                    const content =
                        String(
                            page.content || ""
                        ).toLowerCase();


                    const category =
                        String(
                            page.category || ""
                        ).toLowerCase();


                    const tags =
                        Array.isArray(
                            page.tags
                        )
                            ? page.tags.join(" ")
                            : String(
                                page.tags || ""
                            );


                    return (

                        title.includes(
                            currentSearch
                        )

                        ||

                        content.includes(
                            currentSearch
                        )

                        ||

                        category.includes(
                            currentSearch
                        )

                        ||

                        tags
                            .toLowerCase()
                            .includes(
                                currentSearch
                            )

                    );

                }
            );

    }


    /* ソート */

    if(currentSort === "title"){

        pages.sort(
            (a,b) =>
                String(
                    a.title || ""
                ).localeCompare(
                    String(
                        b.title || ""
                    ),
                    "ja"
                )
        );

    }else{

        pages.sort(
            (a,b) =>
                getTime(
                    b.updated
                ) -
                getTime(
                    a.updated
                )
        );

    }


    return pages;

}


/* ========================================
   記事一覧
======================================== */

function renderPageList(){

    const container =
        document.getElementById(
            "pageList"
        );


    if(!container){

        return;

    }


    displayedPages =
        getFilteredPages();


    const count =
        document.getElementById(
            "pageListCount"
        );


    if(count){

        count.textContent =
            displayedPages.length +
            "件";

    }


    const title =
        document.getElementById(
            "pageListTitle"
        );


    if(title){

        if(currentSearch){

            title.textContent =
                "🔍 検索結果";

        }else if(currentCategory){

            title.textContent =
                "📁 " +
                currentCategory;

        }else{

            title.textContent =
                "すべての記事";

        }

    }


    const status =
        document.getElementById(
            "searchStatus"
        );


    if(status){

        if(
            currentSearch ||
            currentCategory
        ){

            status.style.display =
                "block";


            const parts = [];


            if(currentSearch){

                parts.push(
                    "検索: 「" +
                    escapeHTML(
                        currentSearch
                    ) +
                    "」"
                );

            }


            if(currentCategory){

                parts.push(
                    "カテゴリ: " +
                    escapeHTML(
                        currentCategory
                    )
                );

            }


            status.innerHTML =
                parts.join(
                    "　"
                );

        }else{

            status.style.display =
                "none";

        }

    }


    if(displayedPages.length === 0){

        container.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:50px 20px;
                    color:#777;
                "
            >

                <div
                    style="
                        font-size:45px;
                        margin-bottom:10px;
                    "
                >
                    📭
                </div>

                <h2>
                    記事がありません
                </h2>

                <p>
                    条件に一致する記事が見つかりませんでした。
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    id="emptyCreateButton"
                >
                    ＋ 新しい記事を作成
                </button>

            </div>

        `;


        const emptyButton =
            document.getElementById(
                "emptyCreateButton"
            );


        if(emptyButton){

            emptyButton.addEventListener(
                "click",
                createPageButton
            );

        }


        return;

    }


    container.innerHTML = "";


    displayedPages.forEach(
        page => {

            container.appendChild(
                createPageCard(
                    page
                )
            );

        }
    );

}


/* ========================================
   記事カード
======================================== */

function createPageCard(page){

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "wiki-page-card";


    card.style.cssText = `
        padding:16px;
        margin-bottom:12px;
        border:1px solid #ddd;
        border-radius:8px;
        background:#fff;
        cursor:pointer;
        transition:transform .15s, box-shadow .15s;
    `;


    card.addEventListener(
        "mouseenter",
        function(){

            this.style.transform =
                "translateY(-2px)";

            this.style.boxShadow =
                "0 4px 12px rgba(0,0,0,.10)";

        }
    );


    card.addEventListener(
        "mouseleave",
        function(){

            this.style.transform =
                "";

            this.style.boxShadow =
                "";

        }
    );


    card.addEventListener(
        "click",
        function(){

            openPage(
                page
            );

        }
    );


    const title =
        document.createElement(
            "h3"
        );


    title.style.marginTop =
        "0";


    title.innerHTML =
        "📄 " +
        escapeHTML(
            page.title ||
            "無題の記事"
        );


    const meta =
        document.createElement(
            "div"
        );


    meta.style.cssText = `
        color:#777;
        font-size:13px;
        margin:8px 0;
    `;


    meta.innerHTML =
        getCategoryHTML(
            page
        ) +
        "　" +
        formatDate(
            page.updated ||
            page.created
        );


    const description =
        document.createElement(
            "p"
        );


    description.style.cssText = `
        margin:8px 0;
        color:#444;
        line-height:1.6;
    `;


    description.textContent =
        getExcerpt(
            page.content
        );


    card.appendChild(
        title
    );


    card.appendChild(
        meta
    );


    card.appendChild(
        description
    );


    /* タグ */

    if(
        Array.isArray(
            page.tags
        ) &&
        page.tags.length > 0
    ){

        const tags =
            document.createElement(
                "div"
            );


        tags.style.marginTop =
            "10px";


        page.tags
            .slice(0,8)
            .forEach(
                tag => {

                    const span =
                        document.createElement(
                            "span"
                        );


                    span.textContent =
                        "#" + tag;


                    span.style.cssText = `
                        display:inline-block;
                        margin:2px 4px 2px 0;
                        padding:3px 7px;
                        border-radius:12px;
                        background:#eef3ff;
                        color:#3366cc;
                        font-size:12px;
                    `;


                    tags.appendChild(
                        span
                    );

                }
            );


        card.appendChild(
            tags
        );

    }


    return card;

}


/* ========================================
   記事を開く
======================================== */

function openPage(page){

    if(!page || !page.id){

        return;

    }


    localStorage.setItem(
        "wikihub_currentWiki",
        String(
            currentWiki.id
        )
    );


    localStorage.setItem(
        "wikihub_currentPage",
        String(
            page.id
        )
    );


    /*
       記事ページがある場合は
       wiki.htmlへ
    */

    location.href =
        "wiki.html?id=" +
        encodeURIComponent(
            page.id
        );

}


/* ========================================
   統計
======================================== */

function renderStatistics(){

    const pageCount =
        document.getElementById(
            "pageCount"
        );


    if(pageCount){

        pageCount.textContent =
            allPages.length;

    }


    let totalViews = 0;

    let totalEdits = 0;


    allPages.forEach(
        page => {

            totalViews +=
                Number(
                    page.views ||
                    0
                );


            if(
                Array.isArray(
                    page.history
                )
            ){

                totalEdits +=
                    page.history.length;

            }

        }
    );


    /* Wiki統計も確認 */

    if(currentWiki){

        if(
            currentWiki.statistics
        ){

            if(
                Number.isFinite(
                    Number(
                        currentWiki
                            .statistics
                            .views
                    )
                )
            ){

                totalViews =
                    Number(
                        currentWiki
                            .statistics
                            .views
                    );

            }


            if(
                Number.isFinite(
                    Number(
                        currentWiki
                            .statistics
                            .edits
                    )
                )
            ){

                totalEdits =
                    Number(
                        currentWiki
                            .statistics
                            .edits
                    );

            }

        }

    }


    const views =
        document.getElementById(
            "totalViews"
        );


    if(views){

        views.textContent =
            totalViews;

    }


    const edits =
        document.getElementById(
            "totalEdits"
        );


    if(edits){

        edits.textContent =
            totalEdits;

    }

}


/* ========================================
   最近更新
======================================== */

function renderRecentPages(){

    const container =
        document.getElementById(
            "recentPages"
        );


    if(!container){

        return;

    }


    const pages =
        allPages
            .slice()
            .sort(
                (a,b) =>
                    getTime(
                        b.updated
                    ) -
                    getTime(
                        a.updated
                    )
            )
            .slice(0,5);


    renderMiniPageList(
        container,
        pages
    );

}


/* ========================================
   人気記事
======================================== */

function renderPopularPages(){

    const container =
        document.getElementById(
            "popularPages"
        );


    if(!container){

        return;

    }


    const pages =
        allPages
            .slice()
            .sort(
                (a,b) =>
                    Number(
                        b.views || 0
                    ) -
                    Number(
                        a.views || 0
                    )
            )
            .slice(0,5);


    renderMiniPageList(
        container,
        pages
    );

}


/* ========================================
   ミニ記事一覧
======================================== */

function renderMiniPageList(
    container,
    pages
){

    if(!pages.length){

        container.innerHTML =
            "<p>なし</p>";

        return;

    }


    container.innerHTML = "";


    pages.forEach(
        page => {

            const item =
                document.createElement(
                    "div"
                );


            item.style.cssText = `
                padding:8px 0;
                border-bottom:1px solid #eee;
                cursor:pointer;
            `;


            item.innerHTML = `

                <strong>
                    📄
                    ${escapeHTML(
                        page.title ||
                        "無題"
                    )}
                </strong>

                <br>

                <small
                    style="color:#777;"
                >
                    ${formatDate(
                        page.updated ||
                        page.created
                    )}
                </small>

            `;


            item.addEventListener(
                "click",
                function(){

                    openPage(
                        page
                    );

                }
            );


            container.appendChild(
                item
            );

        }
    );

}


/* ========================================
   カテゴリHTML
======================================== */

function getCategoryHTML(page){

    const category =
        page.category ||
        "未分類";


    return `
        <span>
            📁
            ${escapeHTML(
                category
            )}
        </span>
    `;

}


/* ========================================
   本文抜粋
======================================== */

function getExcerpt(content){

    if(!content){

        return "本文はありません。";

    }


    let text =
        String(
            content
        );


    text =
        text
            .replace(
                /```[\s\S]*?```/g,
                ""
            )
            .replace(
                /\[\[File:[^\]]+\]\]/g,
                ""
            )
            .replace(
                /\[\[([^\]|]+)(\|[^\]]+)?\]\]/g,
                "$1"
            )
            .replace(
                /[*#>`{|}=]/g,
                ""
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if(text.length > 120){

        text =
            text.substring(
                0,
                120
            ) +
            "...";

    }


    return text ||
        "本文はありません。";

}


/* ========================================
   日付
======================================== */

function formatDate(value){

    if(!value){

        return "日時不明";

    }


    const date =
        new Date(
            value
        );


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return "日時不明";

    }


    return date.toLocaleString(
        "ja-JP",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ========================================
   時刻
======================================== */

function getTime(value){

    if(!value){

        return 0;

    }


    const time =
        new Date(
            value
        ).getTime();


    return Number.isNaN(
        time
    )
        ? 0
        : time;

}


/* ========================================
   HTMLエスケープ
======================================== */

function escapeHTML(value){

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ========================================
   外部から使えるようにする
======================================== */

window.createPageButton =
    createPageButton;


window.goHome =
    goHome;


window.searchPage =
    function(){

        const input =
            document.getElementById(
                "searchInput"
            );


        if(input){

            currentSearch =
                input.value
                    .trim()
                    .toLowerCase();

        }


        renderAll();

    };


/* ========================================
   Wiki変更用
======================================== */

window.reloadWikiPages =
    function(){

        currentWikiId =
            getCurrentWikiId();

        loadWiki();

        renderAll();

    };
