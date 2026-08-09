/*
========================================
 WikiHub
 wiki-pages.js
 記事一覧システム 完全修正版
========================================
*/

"use strict";

/*========================================
 変数
========================================*/

let currentWikiId = null;

let pages = [];
let visiblePages = [];

let currentSort = "updated";
let currentCategory = null;


/*========================================
 起動
========================================*/

document.addEventListener(
    "DOMContentLoaded",
    initWikiPages
);


/*========================================
 初期化
========================================*/

function initWikiPages(){

    try{

        /*------------------------------
          Wiki ID取得
        ------------------------------*/

        const params =
            new URLSearchParams(
                location.search
            );

        /*
         URL:
         wiki-pages.html?wiki=wiki_xxxxx
        */

        const urlWikiId =
            params.get("wiki");


        /*
         URLに無ければ
         localStorageから取得
        */

        const savedWikiId =
            localStorage.getItem(
                "wikihub_currentWiki"
            );


        currentWikiId =
            urlWikiId ||
            savedWikiId ||
            null;


        /*------------------------------
          Wiki取得
        ------------------------------*/

        currentWiki =
            findCurrentWiki(
                currentWikiId
            );


        if(!currentWiki){

            showLoadError(
                "Wikiが見つかりません。"
            );

            return;

        }


        /*------------------------------
          現在Wikiを保存
        ------------------------------*/

        localStorage.setItem(
            "wikihub_currentWiki",
            String(currentWiki.id)
        );


        /*------------------------------
          Wiki情報
        ------------------------------*/

        renderWikiInfo();


        /*------------------------------
          記事読み込み
        ------------------------------*/

        loadPages();


        /*------------------------------
          ボタン
        ------------------------------*/

        setupButtons();


        /*------------------------------
          検索
        ------------------------------*/

        setupSearch();


    }catch(error){

        console.error(
            "wiki-pages.js 初期化エラー:",
            error
        );

        showLoadError(
            "記事一覧の読み込み中にエラーが発生しました。"
        );

    }

}


/*========================================
 Wiki取得
========================================*/

function findCurrentWiki(id){

    if(!id){

        return null;

    }


    const wikis =
        readJSON(
            "wikihub_wikis",
            []
        );


    return wikis.find(
        wiki =>
            String(wiki.id) ===
            String(id)
    ) || null;

}


/*========================================
 Wiki情報表示
========================================*/

function renderWikiInfo(){

    const title =
        document.getElementById(
            "wikiTitle"
        );


    const description =
        document.getElementById(
            "wikiDescription"
        );


    if(title){

        title.textContent =
            currentWiki.name ||
            currentWiki.title ||
            "名称未設定Wiki";

    }


    if(description){

        description.textContent =
            currentWiki.description ||
            "このWikiには説明がありません。";

    }

}


/*========================================
 記事読み込み
========================================*/

function loadPages(){

    /*
     現在のWikiの記事を取得。

     現行方式:
     wikihub_pages

     旧方式:
     wiki.pages
    */


    const allPages =
        readJSON(
            "wikihub_pages",
            []
        );


    /*------------------------------
      新方式
    ------------------------------*/

    let wikiPages =
        allPages.filter(

            page =>
                String(page.wikiId) ===
                String(currentWiki.id)

        );


    /*------------------------------
      旧方式
    ------------------------------*/

    if(
        wikiPages.length === 0 &&
        Array.isArray(currentWiki.pages)
    ){

        wikiPages =
            currentWiki.pages.slice();

    }


    /*------------------------------
      記事配列を正規化
    ------------------------------*/

    pages =
        wikiPages.map(
            normalizePage
        );


    visiblePages =
        pages.slice();


    /*------------------------------
      各表示
    ------------------------------*/

    renderPageList(
        visiblePages
    );

    renderCategories();

    renderStatistics();

    renderRecentPages();

    renderPopularPages();

}


/*========================================
 記事データ正規化
========================================*/

function normalizePage(page){

    return {

        ...page,

        id:
            page.id ??
            "",

        title:
            page.title ||
            "無題の記事",

        content:
            page.content ||
            "",

        category:
            page.category ||
            "",

        author:
            page.author ||
            "不明",

        views:
            Number(page.views) ||
            0,

        stars:
            Number(page.stars) ||
            0,

        createdAt:
            page.createdAt ||
            page.created ||
            "",

        updatedAt:
            page.updatedAt ||
            page.updated ||
            page.createdAt ||
            page.created ||
            "",

        tags:
            Array.isArray(page.tags)
                ? page.tags
                : []

    };

}


/*========================================
 記事一覧表示
========================================*/

function renderPageList(list){

    const box =
        document.getElementById(
            "pageList"
        );


    if(!box){

        return;

    }


    /*
     件数表示
    */

    const count =
        document.getElementById(
            "pageListCount"
        );


    if(count){

        count.textContent =
            `${list.length}件`;

    }


    /*
     空の場合
    */

    if(list.length === 0){

        box.innerHTML = `

            <div class="empty">

                <div
                    style="
                        font-size:42px;
                        margin-bottom:10px;
                    "
                >
                    📄
                </div>

                <strong>
                    記事がありません
                </strong>

                <p
                    style="
                        margin-top:8px;
                        color:#777;
                    "
                >
                    最初の記事を作成しましょう！
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    id="emptyCreatePageButton"
                    style="margin-top:15px;"
                >
                    ＋ 新しい記事
                </button>

            </div>

        `;


        const button =
            document.getElementById(
                "emptyCreatePageButton"
            );


        if(button){

            button.addEventListener(
                "click",
                createPage
            );

        }


        return;

    }


    /*
     一覧クリア
    */

    box.innerHTML = "";


    /*
     カード作成
    */

    list.forEach(
        page => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "article-card hover-up";


            /*
             タイトル
            */

            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "article-title";


            title.style.cursor =
                "pointer";


            title.innerHTML = `

                <span
                    style="
                        font-size:24px;
                        margin-right:8px;
                    "
                >
                    📄
                </span>

                ${escapeHtml(
                    page.title
                )}

            `;


            title.addEventListener(
                "click",
                function(){

                    openPage(
                        page.id
                    );

                }
            );


            /*
             情報
            */

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "article-info";


            info.innerHTML = `

                <span>
                    👤
                    ${escapeHtml(
                        page.author
                    )}
                </span>

                <span>
                    📂
                    ${escapeHtml(
                        page.category ||
                        "なし"
                    )}
                </span>

                <span>
                    👁
                    ${page.views}
                </span>

                <span>
                    ⭐
                    ${page.stars}
                </span>

            `;


            /*
             更新日時
            */

            const updated =
                document.createElement(
                    "div"
                );


            updated.className =
                "article-updated";


            if(page.updatedAt){

                updated.textContent =
                    "更新: " +
                    formatDate(
                        page.updatedAt
                    );

            }


            /*
             ボタン
            */

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "article-actions";


            const openButton =
                document.createElement(
                    "button"
                );


            openButton.type =
                "button";


            openButton.className =
                "btn btn-primary";


            openButton.textContent =
                "📖 開く";


            openButton.addEventListener(
                "click",
                function(){

                    openPage(
                        page.id
                    );

                }
            );


            actions.appendChild(
                openButton
            );


            /*
             カードへ追加
            */

            card.appendChild(
                title
            );

            card.appendChild(
                info
            );

            card.appendChild(
                updated
            );

            card.appendChild(
                actions
            );


            box.appendChild(
                card
            );

        }
    );

}


/*========================================
 記事を開く
========================================*/

function openPage(id){

    if(!id){

        return;

    }


    /*
     現在の記事を保存
    */

    localStorage.setItem(
        "wikihub_currentPage",
        String(id)
    );


    /*
     現在Wikiも保存
    */

    if(currentWiki){

        localStorage.setItem(
            "wikihub_currentWiki",
            String(currentWiki.id)
        );

    }


    /*
     wiki.htmlへ
    */

    location.href =
        "wiki.html?id=" +
        encodeURIComponent(
            id
        );

}


/*========================================
 検索設定
========================================*/

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

                searchPages(
                    input.value
                );

            }
        );


        input.addEventListener(
            "keydown",
            function(e){

                if(e.key === "Enter"){

                    e.preventDefault();

                    searchPages(
                        input.value
                    );

                }

            }
        );

    }


    if(button){

        button.addEventListener(
            "click",
            function(){

                searchPages(
                    input
                        ? input.value
                        : ""
                );

            }
        );

    }

}


/*========================================
 検索
========================================*/

function searchPages(keyword){

    const word =
        String(
            keyword || ""
        )
        .trim()
        .toLowerCase();


    /*
     検索解除
    */

    if(word === ""){

        currentCategory =
            null;

        visiblePages =
            pages.slice();

        updateSearchStatus();

        renderPageList(
            visiblePages
        );

        return;

    }


    /*
     検索
    */

    visiblePages =
        pages.filter(
            page => {

                const title =
                    String(
                        page.title
                    )
                    .toLowerCase();


                const content =
                    String(
                        page.content
                    )
                    .toLowerCase();


                const category =
                    String(
                        page.category
                    )
                    .toLowerCase();


                const tags =
                    Array.isArray(
                        page.tags
                    )
                    ? page.tags
                        .join(" ")
                        .toLowerCase()
                    : "";


                return (

                    title.includes(word) ||

                    content.includes(word) ||

                    category.includes(word) ||

                    tags.includes(word)

                );

            }
        );


    currentCategory =
        null;


    updateSearchStatus(
        `"${keyword}" の検索結果`
    );


    renderPageList(
        visiblePages
    );

}


/*========================================
 検索状態
========================================*/

function updateSearchStatus(text){

    const status =
        document.getElementById(
            "searchStatus"
        );


    if(!status){

        return;

    }


    if(!text){

        status.style.display =
            "none";

        status.textContent =
            "";

        return;

    }


    status.style.display =
        "block";


    status.textContent =
        text;

}


/*========================================
 カテゴリ
========================================*/

function renderCategories(){

    const box =
        document.getElementById(
            "categoryList"
        );


    if(!box){

        return;

    }


    const map =
        new Map();


    pages.forEach(
        page => {

            const category =
                page.category ||
                "なし";


            map.set(
                category,
                (map.get(category) || 0) + 1
            );

        }
    );


    if(map.size === 0){

        box.innerHTML =
            `<div style="color:#777;">
                カテゴリはありません
            </div>`;

        return;

    }


    box.innerHTML = "";


    /*
     すべて
    */

    const all =
        document.createElement(
            "button"
        );


    all.type =
        "button";


    all.className =
        "category-button";


    all.textContent =
        `📚 すべて (${pages.length})`;


    all.addEventListener(
        "click",
        function(){

            currentCategory =
                null;

            visiblePages =
                pages.slice();

            updateSearchStatus();

            renderPageList(
                visiblePages
            );

        }
    );


    box.appendChild(
        all
    );


    /*
     各カテゴリ
    */

    [...map.entries()]
        .sort(
            (a,b) =>
                a[0].localeCompare(
                    b[0],
                    "ja"
                )
        )
        .forEach(
            ([category,count]) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "category-button";


                button.textContent =
                    `📂 ${category} (${count})`;


                button.addEventListener(
                    "click",
                    function(){

                        filterCategory(
                            category
                        );

                    }
                );


                box.appendChild(
                    button
                );

            }
        );

}


/*========================================
 カテゴリ絞り込み
========================================*/

function filterCategory(category){

    currentCategory =
        category;


    visiblePages =
        pages.filter(
            page =>
                (
                    page.category ||
                    "なし"
                ) === category
        );


    updateSearchStatus(
        `カテゴリ: ${category}`
    );


    renderPageList(
        visiblePages
    );

}


/*========================================
 統計
========================================*/

function renderStatistics(){

    const pageCount =
        document.getElementById(
            "pageCount"
        );


    const totalViews =
        document.getElementById(
            "totalViews"
        );


    const totalEdits =
        document.getElementById(
            "totalEdits"
        );


    /*
     記事数
    */

    if(pageCount){

        pageCount.textContent =
            pages.length;

    }


    /*
     閲覧数
    */

    let views = 0;


    pages.forEach(
        page => {

            views +=
                Number(
                    page.views
                ) || 0;

        }
    );


    if(totalViews){

        totalViews.textContent =
            views;

    }


    /*
     編集数

     Wiki statistics を優先。
     無ければ履歴から計算。
    */

    let edits =
        Number(
            currentWiki?.statistics?.edits
        ) || 0;


    if(edits === 0){

        pages.forEach(
            page => {

                if(
                    Array.isArray(
                        page.history
                    )
                ){

                    edits +=
                        page.history.length;

                }

            }
        );

    }


    if(totalEdits){

        totalEdits.textContent =
            edits;

    }

}


/*========================================
 最近更新
========================================*/

function renderRecentPages(){

    const box =
        document.getElementById(
            "recentPages"
        );


    if(!box){

        return;

    }


    const recent =
        pages
            .slice()
            .sort(
                (a,b) =>
                    getTime(
                        b.updatedAt
                    ) -
                    getTime(
                        a.updatedAt
                    )
            )
            .slice(
                0,
                5
            );


    if(recent.length === 0){

        box.textContent =
            "なし";

        return;

    }


    box.innerHTML = "";


    recent.forEach(
        page => {

            const item =
                document.createElement(
                    "div"
                );


            item.style.marginBottom =
                "8px";


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                "wiki.html?id=" +
                encodeURIComponent(
                    page.id
                );


            link.textContent =
                "📄 " +
                page.title;


            item.appendChild(
                link
            );


            box.appendChild(
                item
            );

        }
    );

}


/*========================================
 人気記事
========================================*/

function renderPopularPages(){

    const box =
        document.getElementById(
            "popularPages"
        );


    if(!box){

        return;

    }


    const popular =
        pages
            .slice()
            .sort(
                (a,b) =>
                    (
                        Number(b.views) || 0
                    ) -
                    (
                        Number(a.views) || 0
                    )
            )
            .slice(
                0,
                5
            );


    if(popular.length === 0){

        box.textContent =
            "なし";

        return;

    }


    box.innerHTML = "";


    popular.forEach(
        page => {

            const item =
                document.createElement(
                    "div"
                );


            item.style.marginBottom =
                "8px";


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                "wiki.html?id=" +
                encodeURIComponent(
                    page.id
                );


            link.textContent =
                "⭐ " +
                page.title;


            item.appendChild(
                link
            );


            box.appendChild(
                item
            );

        }
    );

}


/*========================================
 ソート
========================================*/

function sortByUpdated(){

    currentSort =
        "updated";


    visiblePages =
        visiblePages
            .slice()
            .sort(
                (a,b) =>
                    getTime(
                        b.updatedAt
                    ) -
                    getTime(
                        a.updatedAt
                    )
            );


    renderPageList(
        visiblePages
    );

}


/*========================================
 名前順
========================================*/

function sortByTitle(){

    currentSort =
        "title";


    visiblePages =
        visiblePages
            .slice()
            .sort(
                (a,b) =>
                    String(
                        a.title
                    ).localeCompare(
                        String(
                            b.title
                        ),
                        "ja"
                    )
            );


    renderPageList(
        visiblePages
    );

}


/*========================================
 ボタン設定
========================================*/

function setupButtons(){

    /*
     更新順
    */

    const sortUpdated =
        document.getElementById(
            "sortUpdatedButton"
        );


    if(sortUpdated){

        sortUpdated.addEventListener(
            "click",
            sortByUpdated
        );

    }


    /*
     名前順
    */

    const sortTitle =
        document.getElementById(
            "sortTitleButton"
        );


    if(sortTitle){

        sortTitle.addEventListener(
            "click",
            sortByTitle
        );

    }


    /*
     Wikiトップ
    */

    const wikiHome =
        document.getElementById(
            "wikiHomeButton"
        );


    if(wikiHome){

        wikiHome.addEventListener(
            "click",
            function(){

                if(currentWiki){

                    localStorage.setItem(
                        "wikihub_currentWiki",
                        String(
                            currentWiki.id
                        )
                    );

                }

                location.href =
                    "wiki.html";

            }
        );

    }


    /*
     新しい記事
    */

    const create =
        document.getElementById(
            "createPageButton"
        );


    if(create){

        create.addEventListener(
            "click",
            createPage
        );

    }


    /*
     ヘッダーの記事作成
    */

    const headerCreate =
        document.getElementById(
            "createPageHeaderButton"
        );


    if(headerCreate){

        headerCreate.addEventListener(
            "click",
            createPage
        );

    }

}


/*========================================
 新しい記事
========================================*/

function createPage(){

    if(!currentWiki){

        alert(
            "Wikiが読み込まれていません。"
        );

        return;

    }


    /*
     Wikiを保存
    */

    localStorage.setItem(
        "wikihub_currentWiki",
        String(
            currentWiki.id
        )
    );


    /*
     既存の作成画面へ
    */

    location.href =
        "create-page.html?wiki=" +
        encodeURIComponent(
            currentWiki.id
        );

}


/*========================================
 日付
========================================*/

function formatDate(value){

    if(!value){

        return "不明";

    }


    const date =
        new Date(value);


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return String(value);

    }


    return date.toLocaleString(
        "ja-JP"
    );

}


/*========================================
 時刻
========================================*/

function getTime(value){

    if(!value){

        return 0;

    }


    const time =
        new Date(value)
            .getTime();


    return Number.isNaN(time)
        ? 0
        : time;

}


/*========================================
 JSON安全読み込み
========================================*/

function readJSON(
    key,
    fallback
){

    try{

        const raw =
            localStorage.getItem(
                key
            );


        if(!raw){

            return fallback;

        }


        const data =
            JSON.parse(
                raw
            );


        return data ?? fallback;


    }catch(error){

        console.error(
            `localStorage "${key}" の読み込みに失敗:`,
            error
        );


        return fallback;

    }

}


/*========================================
 HTMLエスケープ
========================================*/

function escapeHtml(value){

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


/*========================================
 読み込みエラー
========================================*/

function showLoadError(message){

    const title =
        document.getElementById(
            "wikiTitle"
        );


    const description =
        document.getElementById(
            "wikiDescription"
        );


    const pageList =
        document.getElementById(
            "pageList"
        );


    if(title){

        title.textContent =
            "⚠️ 読み込みエラー";

    }


    if(description){

        description.textContent =
            message;

    }


    if(pageList){

        pageList.innerHTML = `

            <div
                class="empty"
                style="
                    padding:30px;
                    text-align:center;
                "
            >

                <div
                    style="
                        font-size:40px;
                        margin-bottom:10px;
                    "
                >
                    ⚠️
                </div>

                <strong>
                    ${escapeHtml(message)}
                </strong>

                <br><br>

                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="location.href='explorer.html'"
                >
                    Wiki一覧へ戻る
                </button>

            </div>

        `;

    }

}

/*==================================
 記事削除
==================================*/

function deletePage(pageId){

    if(!pageId){

        alert("削除する記事が指定されていません。");

        return;

    }


    const wikiId =
        localStorage.getItem(
            "wikihub_currentWiki"
        );


    if(!wikiId){

        alert("Wikiが選択されていません。");

        return;

    }


    loadWikis();


    const wiki =
        wikis.find(
            w =>
                String(w.id) ===
                String(wikiId)
        );


    if(!wiki){

        alert("Wikiが見つかりません。");

        return;

    }


    if(!Array.isArray(wiki.pages)){

        alert("記事データが見つかりません。");

        return;

    }


    const page =
        wiki.pages.find(
            p =>
                String(p.id) ===
                String(pageId)
        );


    if(!page){

        alert("記事が見つかりません。");

        return;

    }


    /*==============================
      確認
    ==============================*/

    const result =
        confirm(
            `「${page.title || "無題の記事"}」を削除しますか？\n\n` +
            "この操作は元に戻せません。"
        );


    if(!result){

        return;

    }


    /*==============================
      削除
    ==============================*/

    wiki.pages =
        wiki.pages.filter(
            p =>
                String(p.id) !==
                String(pageId)
        );


    /*==============================
      統計更新
    ==============================*/

    if(!wiki.statistics){

        wiki.statistics = {};

    }


    wiki.statistics.pages =
        wiki.pages.length;


    /*==============================
      保存
    ==============================*/

    saveWikis();


    /*==============================
      現在記事を解除
    ==============================*/

    const currentPage =
        localStorage.getItem(
            "wikihub_currentPage"
        );


    if(
        String(currentPage) ===
        String(pageId)
    ){

        localStorage.removeItem(
            "wikihub_currentPage"
        );

    }


    /*==============================
      完了
    ==============================*/

    if(
        typeof showToast ===
        "function"
    ){

        showToast(
            "記事を削除しました。",
            "success"
        );

    }else{

        alert(
            "記事を削除しました。"
        );

    }


    /*==============================
      一覧更新
    ==============================*/

    if(
        typeof renderPageList ===
        "function"
    ){

        renderPageList();

    }else{

        location.reload();

    }

}

/*========================================
 デバッグ用
========================================*/

window.WikiHubPages = {

    reload:
        loadPages,

    search:
        searchPages,

    sortUpdated:
        sortByUpdated,

    sortTitle:
        sortByTitle,

    openPage:
        openPage,

    createPage:
        createPage

};
