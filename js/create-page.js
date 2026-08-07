/*========================================
 WikiHub
 create-page.js
========================================*/

let currentWikiId = null;
let pageIconData = "";

/*========================================
 初期化
========================================*/

window.addEventListener("load", initCreatePage);

function initCreatePage(){

    const params = new URLSearchParams(location.search);

    currentWikiId = Number(params.get("wiki"));

    const wiki = getWiki(currentWikiId);

    if(wiki){

        document.getElementById("wikiName").textContent =
            wiki.title;

    }

    const session = getSession();

    if(session){

        document.getElementById("authorName").textContent =
            session.username;

    }

    document
        .getElementById("pageContent")
        .addEventListener(
            "input",
            updateCharCount
        );

    document
        .getElementById("pageIcon")
        .addEventListener(
            "change",
            loadIcon
        );

    updateCharCount();

}

/*========================================
 文字数
========================================*/

function updateCharCount(){

    const text = document.getElementById(
        "pageContent"
    ).value;

    document.getElementById(
        "charCount"
    ).textContent = text.length;

}

/*========================================
 アイコン読み込み
========================================*/

function loadIcon(e){

    const file = e.target.files[0];

    if(!file){

        return;

    }

    const reader = new FileReader();

    reader.onload = function(){

        pageIconData = reader.result;

    };

    reader.readAsDataURL(file);

}

/*========================================
 下書き保存
========================================*/

function saveDraft(){

    const draft={

        wikiId:currentWikiId,

        title:getValue("pageTitle"),

        category:getValue("pageCategory"),

        tags:getTags(),

        content:getValue("pageContent"),

        icon:pageIconData,

        updated:new Date().toISOString()

    };

    const drafts=

    JSON.parse(

        localStorage.getItem(

            "wikihub_drafts"

        )

    )||[];

    drafts.push(draft);

    localStorage.setItem(

        "wikihub_drafts",

        JSON.stringify(drafts)

    );

    alert("下書きを保存しました！");

}

/*========================================
 公開
========================================*/

function publishPage(){

    const title = getValue("pageTitle");

    if(title===""){

        alert("タイトルを入力してください");

        return;

    }

    const page = createPage(

        currentWikiId,

        title,

        getValue("pageCategory"),

        getValue("pageContent")

    );

    page.icon = pageIconData;

    page.tags = getTags();

    page.updatedAt =
        new Date().toISOString();

    updatePage(

        page.id,

        page

    );

    alert("記事を公開しました！");

    location.href =
        "wiki.html?id="+page.id;

}

/*========================================
 プレビュー
========================================*/

function previewPage(){

    sessionStorage.setItem(

        "wikihub_preview",

        JSON.stringify({

            title:getValue(

                "pageTitle"

            ),

            content:getValue(

                "pageContent"

            ),

            category:getValue(

                "pageCategory"

            ),

            tags:getTags(),

            icon:pageIconData

        })

    );

    window.open(

        "preview.html",

        "_blank"

    );

}

/*========================================
 タグ取得
========================================*/

function getTags(){

    return getValue(

        "pageTags"

    )

    .split(",")

    .map(

        t=>t.trim()

    )

    .filter(

        t=>t!==""

    );

}

/*========================================
 共通
========================================*/

function getValue(id){

    return document

    .getElementById(id)

    .value

    .trim();

}
