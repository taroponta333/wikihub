/* =========================================
   WikiHub
   page-view.js

   記事閲覧システム
========================================= */

"use strict";


let currentPage = null;
let currentWiki = null;
let currentPageId = null;


/* =========================================
   起動
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initPageView
);


function initPageView(){

    const params =
        new URLSearchParams(
            location.search
        );


    /*
       新方式

       wiki.html?id=123
    */

    const urlId =
        params.get("id");


    /*
       旧方式との互換
    */

    const oldId =
        localStorage.getItem(
            "wikihub_currentPage"
        );


    currentPageId =
        urlId || oldId;


    if(!currentPageId){

        showPageError(
            "記事IDが指定されていません。"
        );

        return;

    }


    loadArticle();

}


/* =========================================
   記事読み込み
========================================= */

/* =========================================
   記事読み込み
========================================= */

function loadArticle(){

    const wikis = JSON.parse(
        localStorage.getItem("wikihub_wikis")
    ) || [];

    let page = null;
    let wiki = null;


    /* =====================================
       ① URLから記事ID
    ===================================== */

    const params =
        new URLSearchParams(location.search);

    const urlPageId =
        params.get("id");


    /* =====================================
       ② 保存されている記事ID
    ===================================== */

    const savedPageId =
        localStorage.getItem(
            "wikihub_currentPage"
        );


    currentPageId =
        urlPageId || savedPageId;


    if(!currentPageId){

        showPageError(
            "記事IDが指定されていません。"
        );

        return;

    }


    /* =====================================
       ③ Wikiを先に取得
    ===================================== */

    const savedWikiId =
        localStorage.getItem(
            "wikihub_currentWiki"
        );


    if(savedWikiId){

        wiki = wikis.find(

            w =>
                String(w.id) ===
                String(savedWikiId)

        );

    }


    /* =====================================
       ④ Wikiの中から記事を探す
    ===================================== */

    if(wiki && Array.isArray(wiki.pages)){

        page = wiki.pages.find(

            p =>
                String(p.id) ===
                String(currentPageId)

        );

    }


    /* =====================================
       ⑤ Wikiが分からない場合
          全Wikiから検索
    ===================================== */

    if(!page){

        for(const w of wikis){

            if(!Array.isArray(w.pages)){
                continue;
            }


            const found =
                w.pages.find(

                    p =>
                        String(p.id) ===
                        String(currentPageId)

                );


            if(found){

                page = found;
                wiki = w;

                break;

            }

        }

    }


    /* =====================================
       ⑥ 新しい pages 保存方式にも対応
    ===================================== */

    if(!page){

        const pages = JSON.parse(

            localStorage.getItem(
                "wikihub_pages"
            )

        ) || [];


        page = pages.find(

            p =>
                String(p.id) ===
                String(currentPageId)

        );


        if(page){

            wiki = wikis.find(

                w =>
                    String(w.id) ===
                    String(page.wikiId)

            );

        }

    }


    /* =====================================
       ⑦ 見つからない
    ===================================== */

    if(!page){

        showPageError(
            "記事が見つかりません。"
        );

        return;

    }


    /* =====================================
       現在情報を保存
    ===================================== */

    currentPage = page;
    currentWiki = wiki;


    /* =====================================
       currentWikiも確実に保存
    ===================================== */

    if(currentWiki){

        localStorage.setItem(

            "wikihub_currentWiki",

            currentWiki.id

        );

    }


    localStorage.setItem(

        "wikihub_currentPage",

        currentPage.id

    );


    renderPage();

}

/* =========================================
   Wiki取得
========================================= */

function getWikiFromPage(page){

    if(!page){
        return null;
    }


    const wikis = JSON.parse(

        localStorage.getItem(
            "wikihub_wikis"
        )

    ) || [];


    return wikis.find(

        wiki =>
            String(wiki.id) ===
            String(page.wikiId)

    ) || null;

}


/* =========================================
   表示
========================================= */

function renderPage(){

    document.title =
        currentPage.title +
        " - WikiHub";


    /*
       Wiki
    */

    const wikiTitle =
        document.getElementById(
            "wikiTitle"
        );


    if(wikiTitle){

        wikiTitle.textContent =

            currentWiki?.title ||
            "Wiki";

    }


    const wikiDescription =
        document.getElementById(
            "wikiDescription"
        );


    if(wikiDescription){

        wikiDescription.textContent =

            currentWiki?.description ||
            "WikiHubの記事";

    }


    /*
       タイトル
    */

    document.getElementById(
        "pageTitle"
    ).textContent =

        currentPage.title;


    /*
       アイコン
    */

    const icon =
        document.getElementById(
            "pageIcon"
        );


    if(currentPage.icon){

        icon.innerHTML = `

            <img
                src="${escapeHtml(
                    currentPage.icon
                )}"
                style="
                    width:72px;
                    height:72px;
                    object-fit:cover;
                    border-radius:14px;
                "
            >

        `;

    }else{

        icon.textContent = "📄";

    }


    /*
       情報
    */

    const author =
        currentPage.author ||
        "不明";


    const created =
        currentPage.createdAt ||
        currentPage.created ||
        "";


    const updated =
        currentPage.updatedAt ||
        currentPage.updated ||
        "";


    document.getElementById(
        "pageInfo"
    ).textContent =

        `👤 ${author}　` +
        `📅 作成：${formatDate(created)}　` +
        `🔄 更新：${formatDate(updated)}`;


    /*
       カテゴリ
    */

    document.getElementById(
        "pageCategory"
    ).textContent =

        currentPage.category ||
        "未分類";


    /*
       タグ
    */

    renderTags();


    /*
       本文
    */

    renderContent();


    /*
       コメント
    */

    renderComments();


    /*
       統計
    */

    renderStatistics();


    /*
       目次
    */

    generateTOC();


    /*
       最近更新
    */

    renderRecentPages();

}


/* =========================================
   本文
========================================= */

function renderContent(){

    const content =
        currentPage.content || "";


    const html =
        parseWikiContent(
            content
        );


    document.getElementById(
        "pageContent"
    ).innerHTML = html;

}


/* =========================================
   簡易Wiki記法
========================================= */

function parseWikiContent(text){

    let html =
        escapeHtml(text);


    /*
       見出し
    */

    html = html.replace(

        /^=== (.*?) ===$/gm,

        "<h3>$1</h3>"

    );


    html = html.replace(

        /^== (.*?) ==$/gm,

        "<h2>$1</h2>"

    );


    /*
       太字
    */

    html = html.replace(

        /'''(.*?)'''/g,

        "<strong>$1</strong>"

    );


    /*
       リンク

       [[記事名]]
    */

    html = html.replace(

        /\[\[(.*?)\]\]/g,

        function(_, title){

            return `

                <a
                    href="#"
                    onclick="openLinkedArticle('${escapeAttribute(title)}');return false;"
                >
                    ${title}
                </a>

            `;

        }

    );


    /*
       改行
    */

    html =
        html.replace(
            /\n/g,
            "<br>"
        );


    /*
       ファイル
    */

    html =
        parseFiles(
            html
        );


    return html;

}


/* =========================================
   Wikiリンク
========================================= */

function openLinkedArticle(title){

    if(!currentWiki){

        return;

    }


    const pages =
        getWikiPagesLocal(
            currentWiki.id
        );


    const target =
        pages.find(

            page =>
                page.title === title

        );


    if(!target){

        alert(
            `「${title}」という記事はまだありません。`
        );

        return;

    }


    location.href =
        "wiki.html?id=" +
        encodeURIComponent(
            target.id
        );

}


/* =========================================
   タグ
========================================= */

function renderTags(){

    const box =
        document.getElementById(
            "pageTags"
        );


    const tags =
        currentPage.tags || [];


    if(tags.length === 0){

        box.textContent =
            "タグなし";

        return;

    }


    box.innerHTML =
        tags.map(

            tag => `

                <span class="tag">
                    ${escapeHtml(tag)}
                </span>

            `

        ).join("");

}


/* =========================================
   目次
========================================= */

function generateTOC(){

    const box =
        document.getElementById(
            "toc"
        );


    const content =
        currentPage.content || "";


    const matches =
        content.match(
            /^== .*? ==$/gm
        ) || [];


    if(matches.length === 0){

        box.innerHTML =
            "目次はありません。";

        return;

    }


    box.innerHTML =
        "<ul>" +

        matches.map(

            heading => {

                const title =
                    heading
                    .replace(/^== /,"")
                    .replace(/ ==$/,"");


                return `

                    <li>
                        ${escapeHtml(title)}
                    </li>

                `;

            }

        ).join("") +

        "</ul>";

}


/* =========================================
   コメント
========================================= */

function renderComments(){

    const box =
        document.getElementById(
            "comments"
        );


    const comments =
        currentPage.comments || [];


    if(comments.length === 0){

        box.innerHTML = `

            <div class="empty">
                コメントはまだありません。
            </div>

        `;

        return;

    }


    box.innerHTML =
        comments.map(

            comment => `

                <div class="comment">

                    <div class="comment-body">

                        <div class="comment-user">

                            ${escapeHtml(
                                comment.user ||
                                "ユーザー"
                            )}

                        </div>

                        <div class="comment-date">

                            ${formatDate(
                                comment.date
                            )}

                        </div>

                        <div class="comment-text">

                            ${escapeHtml(
                                comment.text
                            )}

                        </div>

                    </div>

                </div>

            `

        ).join("");

}


/* =========================================
   コメント追加
========================================= */

function addComment(){

    const input =
        document.getElementById(
            "commentInput"
        );


    const text =
        input.value.trim();


    if(!text){

        alert(
            "コメントを入力してください。"
        );

        return;

    }


    const session =
        typeof getSession === "function"
            ? getSession()
            : null;


    if(!session){

        alert(
            "コメントするにはログインしてください。"
        );

        return;

    }


    if(!currentPage.comments){

        currentPage.comments = [];

    }


    currentPage.comments.push({

        id:Date.now(),

        user:
            session.username ||
            "ユーザー",

        text:text,

        date:
            new Date().toISOString()

    });


    saveCurrentPage();


    input.value = "";

    renderComments();

}


/* =========================================
   記事保存
========================================= */

function saveCurrentPage(){

    /*
       新方式
    */

    const pages =
        JSON.parse(

            localStorage.getItem(
                "wikihub_pages"
            )

        ) || [];


    const index =
        pages.findIndex(

            p =>
                String(p.id) ===
                String(currentPage.id)

        );


    if(index !== -1){

        pages[index] =
            currentPage;


        localStorage.setItem(

            "wikihub_pages",

            JSON.stringify(pages)

        );

        return;

    }


    /*
       旧方式
    */

    const wikis =
        JSON.parse(

            localStorage.getItem(
                "wikihub_wikis"
            )

        ) || [];


    for(const wiki of wikis){

        if(!Array.isArray(wiki.pages)){
            continue;
        }


        const index =
            wiki.pages.findIndex(

                p =>
                    String(p.id) ===
                    String(currentPage.id)

            );


        if(index !== -1){

            wiki.pages[index] =
                currentPage;


            localStorage.setItem(

                "wikihub_wikis",

                JSON.stringify(wikis)

            );

            return;

        }

    }

}


/* =========================================
   統計
========================================= */

function renderStatistics(){

    const pages =
        getWikiPagesLocal(
            currentWiki?.id
        );


    document.getElementById(
        "wikiPages"
    ).textContent =
        pages.length;


    /*
       閲覧数
    */

    if(
        typeof currentPage.views !==
        "number"
    ){

        currentPage.views = 0;

    }


    currentPage.views++;


    document.getElementById(
        "pageViews"
    ).textContent =
        currentPage.views;


    document.getElementById(
        "pageStars"
    ).textContent =
        currentPage.stars || 0;


    saveCurrentPage();

}


/* =========================================
   最近更新
========================================= */

function renderRecentPages(){

    const box =
        document.getElementById(
            "recentPages"
        );


    const pages =
        getWikiPagesLocal(
            currentWiki?.id
        );


    const recent =
        [...pages]

        .sort(

            (a,b) =>

                new Date(
                    b.updatedAt ||
                    b.updated ||
                    0
                )

                -

                new Date(
                    a.updatedAt ||
                    a.updated ||
                    0
                )

        )

        .slice(0,5);


    if(recent.length === 0){

        box.textContent =
            "記事なし";

        return;

    }


    box.innerHTML =
        recent.map(

            page => `

                <div style="margin-bottom:8px;">

                    📄

                    <a
                        href="wiki.html?id=${encodeURIComponent(page.id)}"
                    >
                        ${escapeHtml(page.title)}
                    </a>

                </div>

            `

        ).join("");

}


/* =========================================
   Wiki記事取得
========================================= */

function getWikiPagesLocal(wikiId){

    const pages =
        JSON.parse(

            localStorage.getItem(
                "wikihub_pages"
            )

        ) || [];


    if(wikiId){

        const modern =
            pages.filter(

                p =>
                    String(p.wikiId) ===
                    String(wikiId)

            );


        if(modern.length){

            return modern;

        }

    }


    const wikis =
        JSON.parse(

            localStorage.getItem(
                "wikihub_wikis"
            )

        ) || [];


    const wiki =
        wikis.find(

            w =>
                String(w.id) ===
                String(wikiId)

        );


    return wiki?.pages || [];

}


/* =========================================
   編集
========================================= */

function editCurrentPage(){

    localStorage.setItem(

        "wikihub_currentPage",

        currentPage.id

    );


    if(currentWiki){

        localStorage.setItem(

            "wikihub_currentWiki",

            currentWiki.id

        );

    }


    location.href =
        "editor.html";

}


/* =========================================
   履歴
========================================= */

function showHistory(){

    const history =
        currentPage.history || [];


    if(history.length === 0){

        alert(
            "編集履歴はありません。"
        );

        return;

    }


    console.table(history);


    alert(
        `編集履歴：${history.length}件\n\n` +
        "詳細は開発者コンソールでも確認できます。"
    );

}


/* =========================================
   お気に入り
========================================= */

function toggleFavorite(){

    const favorites =
        JSON.parse(

            localStorage.getItem(
                "wikihub_favorites"
            )

        ) || [];


    const id =
        String(currentPage.id);


    const index =
        favorites.indexOf(id);


    if(index === -1){

        favorites.push(id);

        alert(
            "⭐ お気に入りに追加しました！"
        );

    }else{

        favorites.splice(
            index,
            1
        );

        alert(
            "お気に入りから削除しました。"
        );

    }


    localStorage.setItem(

        "wikihub_favorites",

        JSON.stringify(
            favorites
        )

    );

}


/* =========================================
   新規記事
========================================= */

/* =========================================
   新しい記事を作成
========================================= */

function createNewPage(){

    /* Wikiが取得できているか確認 */

    if(!currentWiki){

        /*
           念のためlocalStorageから再取得
        */

        const wikis = JSON.parse(

            localStorage.getItem(
                "wikihub_wikis"
            )

        ) || [];


        const wikiId =
            localStorage.getItem(
                "wikihub_currentWiki"
            );


        currentWiki =
            wikis.find(

                w =>
                    String(w.id) ===
                    String(wikiId)

            );

    }


    /* Wikiが本当に無い */

    if(!currentWiki){

        alert(
            "Wikiが見つかりません。\n" +
            "先にWikiを開いてください。"
        );

        return;

    }


    /* pages配列が無ければ作る */

    if(!Array.isArray(currentWiki.pages)){

        currentWiki.pages = [];

    }


    /* =====================================
       新しい記事
    ===================================== */

    const now =
        new Date().toISOString();


    const page = {

        id:
            "page_" +
            crypto.randomUUID(),

        title:
            "新しい記事",

        content:
            "",

        category:
            "",

        tags:
            [],

        author:
            getCurrentUsername(),

        created:
            now,

        updated:
            now,

        views:
            0,

        stars:
            0,

        comments:
            [],

        history:
            []

    };


    /* Wikiに追加 */

    currentWiki.pages.push(page);


    /* 統計更新 */

    if(!currentWiki.statistics){

        currentWiki.statistics = {

            pages:0,

            files:0,

            edits:0,

            members:1

        };

    }


    currentWiki.statistics.pages =
        currentWiki.pages.length;


    /* Wiki保存 */

    const wikis = JSON.parse(

        localStorage.getItem(
            "wikihub_wikis"
        )

    ) || [];


    const wikiIndex =
        wikis.findIndex(

            w =>
                String(w.id) ===
                String(currentWiki.id)

        );


    if(wikiIndex === -1){

        alert(
            "Wikiの保存に失敗しました。"
        );

        return;

    }


    wikis[wikiIndex] =
        currentWiki;


    localStorage.setItem(

        "wikihub_wikis",

        JSON.stringify(wikis)

    );


    /* 現在の記事 */

    localStorage.setItem(

        "wikihub_currentWiki",

        currentWiki.id

    );


    localStorage.setItem(

        "wikihub_currentPage",

        page.id

    );


    /* =====================================
       エディターへ
    ===================================== */

    location.href =
        "editor.html";

}

/* =========================================
   記事一覧
========================================= */

function goWikiPages(){

    if(!currentWiki){

        location.href =
            "explorer.html";

        return;

    }


    location.href =
        "wiki-pages.html?wiki=" +
        encodeURIComponent(
            currentWiki.id
        );

}


/* =========================================
   ホーム
========================================= */

function goHome(){

    location.href =
        "index.html";

}


/* =========================================
   エラー
========================================= */

function showPageError(message){

    document.getElementById(
        "pageTitle"
    ).textContent =
        "記事を開けません";


    document.getElementById(
        "pageContent"
    ).innerHTML = `

        <div class="empty-page">

            <h2>📄 記事が見つかりません</h2>

            <p>
                ${escapeHtml(message)}
            </p>

            <button
                class="btn btn-primary"
                onclick="goHome()">

                🏠 ホームへ戻る

            </button>

        </div>

    `;

}


/* =========================================
   ファイル
========================================= */

function parseFiles(html){

    const files =
        JSON.parse(

            localStorage.getItem(
                "wikihub_files"
            )

        ) || [];


    files.forEach(

        file => {

            html =
                html.replaceAll(

                    "[[File:" +
                    file.name +
                    "]]",

                    `<img
                        src="${file.data}"
                        style="
                            max-width:100%;
                            border-radius:10px;
                            margin:10px 0;
                        "
                    >`

                );

        }

    );


    return html;

}


/* =========================================
   HTMLエスケープ
========================================= */

function escapeHtml(value){

    return String(value ?? "")

        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}


function escapeAttribute(value){

    return escapeHtml(value)
        .replaceAll("\\","\\\\")
        .replaceAll("'","\\'");

}


/* =========================================
   日付
========================================= */

function formatDate(date){

    if(!date){
        return "---";
    }


    const d =
        new Date(date);


    if(
        Number.isNaN(
            d.getTime()
        )
    ){

        return "---";

    }


    return d.toLocaleString(
        "ja-JP"
    );

}

/* =========================================
   現在のユーザー名
========================================= */

function getCurrentUsername(){

    try{

        const session =
            JSON.parse(

                localStorage.getItem(
                    "wikihub_session"
                )

            );


        if(session){

            return (
                session.username ||
                session.displayName ||
                "guest"
            );

        }

    }catch(error){

        console.error(
            "Session error:",
            error
        );

    }


    return "guest";

}
