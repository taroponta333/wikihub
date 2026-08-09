/*
========================================
 WikiHub
 editor.js
 Part3-7a
========================================
*/

"use strict";

/*==============================
 変数
==============================*/

let editor;
let preview;
let info;

let autoSaveTimer=null;

let historyStack=[];
let historyIndex=-1;

/*==============================
 初期化
==============================*/

document.addEventListener("DOMContentLoaded",init);

function init(){

    editor=document.getElementById("editor");
    preview=document.getElementById("preview");
    info=document.getElementById("editorInfo");

    if(!editor)return;

    loadCurrentPage();

    setupEditor();

    updatePreview();

    updateInfo();

}

/* =========================================
   編集モード
========================================= */

const editorParams =
    new URLSearchParams(
        location.search
    );

const editMode =
    editorParams.get("edit") === "1";

const editPageId =
    editorParams.get("id");

/* =========================================
   編集対象の記事を取得
========================================= */

function getPageForEdit(){

    if(!editMode || !editPageId){

        return null;

    }


    const wikis =
        JSON.parse(
            localStorage.getItem(
                "wikihub_wikis"
            )
        ) || [];


    /* Wikiを検索 */

    const currentWikiId =
        localStorage.getItem(
            "wikihub_currentWiki"
        );


    let wiki =
        wikis.find(

            w =>
                String(w.id) ===
                String(currentWikiId)

        );


    /* Wikiが見つからなければ
       全Wikiから記事を検索 */

    if(!wiki){

        for(const w of wikis){

            if(!Array.isArray(w.pages)){
                continue;
            }


            const found =
                w.pages.find(

                    p =>
                        String(p.id) ===
                        String(editPageId)

                );


            if(found){

                wiki = w;
                break;

            }

        }

    }


    if(!wiki){

        return null;

    }


    if(!Array.isArray(wiki.pages)){

        return null;

    }


    return {

        wiki: wiki,

        page:
            wiki.pages.find(

                p =>
                    String(p.id) ===
                    String(editPageId)

            ) || null

    };

}

/* =========================================
   編集記事をフォームへ読み込む
========================================= */

function loadPageForEdit(){

    if(!editMode){

        return;

    }


    const result =
        getPageForEdit();


    if(!result || !result.page){

        alert(
            "編集する記事が見つかりません。"
        );

        return;

    }


    const page =
        result.page;


    /* 現在のWiki・記事を保存 */

    localStorage.setItem(
        "wikihub_currentWiki",
        String(result.wiki.id)
    );

    localStorage.setItem(
        "wikihub_currentPage",
        String(page.id)
    );


    /* タイトル */

    const titleInput =
        document.getElementById(
            "pageTitle"
        );

    if(titleInput){

        titleInput.value =
            page.title || "";

    }


    /* 本文 */

    const contentInput =
        document.getElementById(
            "pageContent"
        );

    if(contentInput){

        contentInput.value =
            page.content || "";

    }


    /* カテゴリ */

    const categoryInput =
        document.getElementById(
            "pageCategory"
        );

    if(categoryInput){

        categoryInput.value =
            page.category || "";

    }


    /* タグ */

    const tagsInput =
        document.getElementById(
            "pageTags"
        );

    if(tagsInput){

        if(Array.isArray(page.tags)){

            tagsInput.value =
                page.tags.join(", ");

        }else{

            tagsInput.value =
                page.tags || "";

        }

    }


    /* 編集中の記事ID */

    const hiddenId =
        document.getElementById(
            "pageId"
        );

    if(hiddenId){

        hiddenId.value =
            page.id;

    }


    /* 編集モード表示 */

    const heading =
        document.getElementById(
            "editorTitle"
        );

    if(heading){

        heading.textContent =
            "✏️ 記事を編集";

    }

}

/* =========================================
   WikiHub 保存用セッション処理
========================================= */

/**
 * 現在のログインセッションを取得
 */
function getSession(){

    const keys = [
        "wikihub_session",
        "wikihub_currentUser",
        "currentUser",
        "session"
    ];

    for(const key of keys){

        try{

            const raw =
                localStorage.getItem(key);

            if(!raw){
                continue;
            }

            const data =
                JSON.parse(raw);

            if(data){
                return data;
            }

        }catch(error){

            console.warn(
                "セッション解析失敗:",
                key,
                error
            );

        }

    }

    return null;
}


/**
 * 現在のユーザー名を取得
 */
function getSessionUsername(){

    const session = getSession();

    if(!session){
        return "guest";
    }

    return (
        session.username ||
        session.userName ||
        session.name ||
        session.displayName ||
        "guest"
    );

}


/**
 * 現在のユーザーIDを取得
 */
function getSessionUserId(){

    const session = getSession();

    if(!session){
        return null;
    }

    return (
        session.id ||
        session.userId ||
        session.uid ||
        null
    );

}


/**
 * 保存前のログイン確認
 */
function checkSession(){

    const session = getSession();

    if(!session){

        alert(
            "ログイン情報を取得できません。\n" +
            "ログインし直してください。"
        );

        return false;

    }

    return true;

}


/**
 * 記事保存用のユーザー情報
 */
function getEditorUser(){

    const session = getSession();

    if(!session){

        return {
            id: null,
            username: "guest"
        };

    }

    return {

        id:
            session.id ||
            session.userId ||
            session.uid ||
            null,

        username:
            session.username ||
            session.userName ||
            session.name ||
            session.displayName ||
            "guest"

    };

}

/*==============================
 ページ読込
==============================*/

function loadCurrentPage(){

    const page=

    JSON.parse(localStorage.getItem("wikihub_editPage"));

    if(!page)return;

    document.getElementById("pageTitleInput").value=

    page.title;

    editor.value=

    page.content;

}

/* =========================================
   WikiHub トースト通知
========================================= */

function showToast(message, type = "info", duration = 2500){

    /* 既存のToastがあれば削除 */

    const oldToast =
        document.getElementById("wikihub-toast");

    if(oldToast){
        oldToast.remove();
    }


    /* Toast作成 */

    const toast =
        document.createElement("div");

    toast.id =
        "wikihub-toast";

    toast.textContent =
        message;


    /* 基本スタイル */

    toast.style.position =
        "fixed";

    toast.style.left =
        "50%";

    toast.style.bottom =
        "30px";

    toast.style.transform =
        "translateX(-50%)";

    toast.style.zIndex =
        "99999";

    toast.style.padding =
        "12px 22px";

    toast.style.borderRadius =
        "10px";

    toast.style.fontSize =
        "15px";

    toast.style.fontWeight =
        "bold";

    toast.style.boxShadow =
        "0 4px 15px rgba(0,0,0,0.25)";

    toast.style.color =
        "#fff";


    /* 種類ごとの表示 */

    if(type === "success"){

        toast.style.background =
            "#28a745";

    }else if(type === "error"){

        toast.style.background =
            "#dc3545";

    }else if(type === "warning"){

        toast.style.background =
            "#f0ad4e";

    }else{

        toast.style.background =
            "#2870d8";

    }


    /* 画面へ追加 */

    document.body.appendChild(
        toast
    );


    /* 自動消去 */

    setTimeout(() => {

        if(toast){

            toast.style.opacity =
                "0";

            toast.style.transition =
                "opacity 0.3s";

            setTimeout(() => {

                toast.remove();

            }, 300);

        }

    }, duration);

}

/*==============================
 エディター
==============================*/

function setupEditor(){

    saveHistory();

    editor.addEventListener("input",function(){

        updatePreview();

        updateInfo();

        autoSave();

        saveHistory();

    });

}

/*==============================
 プレビュー
==============================*/

function updatePreview(){

    preview.innerHTML=

    parseWiki(editor.value);

}

/*==============================
 情報
==============================*/

function updateInfo(){

    const text=editor.value;

    const chars=text.length;

    const lines=text.split("\n").length;

    info.innerHTML=

    `
    文字数：${chars}
    <br>
    行数：${lines}
    `;

}

/*==============================
 自動保存
==============================*/

function autoSave(){

    clearTimeout(autoSaveTimer);

    autoSaveTimer=setTimeout(function(){

        localStorage.setItem(

            "wikihub_draft",

            editor.value

        );

        console.log("Draft Saved");

    },1000);

}

/*==============================
 保存
==============================*/

document.addEventListener("keydown",function(e){

    if(e.ctrlKey&&e.key==="s"){

        e.preventDefault();

        savePage();

    }

});

function savePage(){

    alert("保存機能はPart3-7bで実装します。");

}

/*==============================
 Tab入力
==============================*/

editor?.addEventListener("keydown",function(e){

    if(e.key==="Tab"){

        e.preventDefault();

        const start=this.selectionStart;

        const end=this.selectionEnd;

        this.value=

        this.value.substring(0,start)

        +"    "

        +this.value.substring(end);

        this.selectionStart=

        this.selectionEnd=

        start+4;

    }

});

/*==============================
 Undo
==============================*/

function saveHistory(){

    historyStack.push(

        editor.value

    );

    historyIndex=

    historyStack.length-1;

}

/*==============================
 Ctrl+Z
==============================*/

document.addEventListener("keydown",function(e){

    if(e.ctrlKey&&e.key==="z"){

        e.preventDefault();

        undo();

    }

});

function undo(){

    if(historyIndex<=0)return;

    historyIndex--;

    editor.value=

    historyStack[historyIndex];

    updatePreview();

    updateInfo();

}

/*==============================
 Ctrl+Y
==============================*/

document.addEventListener("keydown",function(e){

    if(e.ctrlKey&&e.key==="y"){

        e.preventDefault();

        redo();

    }

});

function redo(){

    if(historyIndex>=historyStack.length-1)return;

    historyIndex++;

    editor.value=

    historyStack[historyIndex];

    updatePreview();

    updateInfo();

}
/*==================================
 Part3-7b
 保存システム
==================================*/

/*==============================
 保存ボタン
==============================*/

document.addEventListener("DOMContentLoaded",function(){

    const save=document.getElementById("savePage");

    if(save){

        save.addEventListener("click",savePage);

    }

});

/*==============================
 保存
==============================*/

function savePage(){

    loadWikis();

    const wikiID=

    localStorage.getItem("wikihub_currentWiki");

    const pageID=

    localStorage.getItem("wikihub_currentPage");

    const wiki=

    wikis.find(w=>w.id===wikiID);

    if(!wiki){

        alert("Wikiが見つかりません。");

        return;

    }

    let page=

    wiki.pages.find(p=>p.id===pageID);

    if(!page){

        page={

            id:createPageID(),

            title:"新しいページ",

            content:"",

            created:new Date().toISOString(),

            updated:new Date().toISOString(),

            category:"",

            tags:[],

            history:[]

        };

        wiki.pages.push(page);

    }

    page.title=

    document.getElementById("pageTitleInput").value.trim();

    page.content=

    editor.value;

    page.category=

    document.getElementById("pageCategory").value.trim();

    page.tags=

    document.getElementById("pageTags")

    .value

    .split(",")

    .map(t=>t.trim())

    .filter(t=>t!="");

    page.updated=

    new Date().toISOString();

    /*==============================
      編集履歴
    ==============================*/

    page.history.push({

        date:new Date().toISOString(),

        content:page.content,

        title:page.title,

        editor:getSession()?.username || "guest"

    });

    wiki.statistics.pages=

    wiki.pages.length;

    wiki.statistics.edits++;

    saveWikis();

    localStorage.setItem(

        "wikihub_currentPage",

        page.id

    );

    showToast("保存しました！");

}
      /*==================================
 新しいページ
==================================*/

function createNewPage(){

    loadWikis();

    const wiki=

    wikis.find(

        w=>w.id===

        localStorage.getItem(

            "wikihub_currentWiki"

        )

    );

    if(!wiki)return;

    const page={

        id:createPageID(),

        title:"新しいページ",

        content:"",

        created:new Date().toISOString(),

        updated:new Date().toISOString(),

        category:"",

        tags:[],

        history:[]

    };

    wiki.pages.push(page);

    saveWikis();

    localStorage.setItem(

        "wikihub_currentPage",

        page.id

    );

    location.reload();

}
/*==================================
 ページ削除
==================================*/

function deleteCurrentPage(){

    if(!confirm("このページを削除しますか？")){

        return;

    }

    loadWikis();

    const wiki=

    wikis.find(

        w=>w.id===

        localStorage.getItem(

            "wikihub_currentWiki"

        )

    );

    if(!wiki)return;

    const id=

    localStorage.getItem(

        "wikihub_currentPage"

    );

    wiki.pages=

    wiki.pages.filter(

        p=>p.id!==id

    );

    wiki.statistics.pages=

    wiki.pages.length;

    saveWikis();

    location.href="wiki.html";

}
/*==================================
 履歴
==================================*/

function openHistory(){

    loadWikis();

    const wiki=

    wikis.find(

        w=>w.id===

        localStorage.getItem(

            "wikihub_currentWiki"

        )

    );

    if(!wiki)return;

    const page=

    wiki.pages.find(

        p=>p.id===

        localStorage.getItem(

            "wikihub_currentPage"

        )

    );

    if(!page)return;

    console.table(page.history);

}
/*==================================
 Part3-7c
 高度なエディター
==================================*/

/*==============================
 初期化
==============================*/

document.addEventListener("DOMContentLoaded",function(){

    setupImageDrop();

    setupTemplateButtons();

    setupPreviewButton();

});

/*==============================
 ドラッグ＆ドロップ
==============================*/

function setupImageDrop(){

    if(!editor)return;

    editor.addEventListener("dragover",function(e){

        e.preventDefault();

    });

    editor.addEventListener("drop",function(e){

        e.preventDefault();

        const file=e.dataTransfer.files[0];

        if(!file)return;

        if(!file.type.startsWith("image/")){

            alert("画像のみ追加できます。");

            return;

        }

        const reader=new FileReader();

        reader.onload=function(event){

            insertText(

                "\n[[File:"+file.name+"]]\n"

            );

            saveLocalImage(

                file.name,

                event.target.result

            );

        };

        reader.readAsDataURL(file);

    });

}

/*==============================
 ローカル画像保存
==============================*/

function saveLocalImage(name,data){

    let files=

    JSON.parse(

        localStorage.getItem(

            "wikihub_files"

        )

    )||[];

    files.push({

        id:crypto.randomUUID(),

        name:name,

        type:"image",

        data:data,

        created:new Date().toISOString()

    });

    localStorage.setItem(

        "wikihub_files",

        JSON.stringify(files)

    );

}

/*==============================
 テンプレート
==============================*/

function setupTemplateButtons(){

    const templates={

        infobox:
`{{Infobox
|タイトル=
|画像=
|説明=
}}`,

        quote:
`> 引用文`,

        code:
"```javascript\n\n```",

        table:
`{| class="wikitable"
|-
!項目
!内容
|-
|A
|B
|}`

    };

    window.insertTemplate=function(type){

        if(!templates[type])return;

        insertText(

            templates[type]

        );

    };

}

/*==============================
 テキスト挿入
==============================*/

function insertText(text){

    const start=

    editor.selectionStart;

    const end=

    editor.selectionEnd;

    editor.setRangeText(

        text,

        start,

        end,

        "end"

    );

    editor.focus();

    updatePreview();

}

/*==============================
 プレビュー切替
==============================*/

function setupPreviewButton(){

    const button=

    document.getElementById(

        "previewButton"

    );

    if(!button)return;

    button.onclick=function(){

        preview.hidden=

        !preview.hidden;

    };

}

/*==============================
 Fileタグ
==============================*/

function parseFiles(html){

    let files=

    JSON.parse(

        localStorage.getItem(

            "wikihub_files"

        )

    )||[];

    files.forEach(function(file){

        html=html.replaceAll(

            "[[File:"+file.name+"]]",

            `<img
                src="${file.data}"
                style="
                    max-width:100%;
                    border-radius:8px;
                    margin:10px 0;
                ">`

        );

    });

    return html;

}

/*==============================
 プレビュー更新
==============================*/

const oldPreview=updatePreview;

updatePreview=function(){

    let html=

    parseWiki(editor.value);

    html=parseFiles(html);

    preview.innerHTML=html;

}

/*==============================
 オートリカバリー
==============================*/

window.addEventListener(

    "beforeunload",

    function(){

        localStorage.setItem(

            "wikihub_recovery",

            editor.value

        );

    }

);

function restoreRecovery(){

    const draft=

    localStorage.getItem(

        "wikihub_recovery"

    );

    if(!draft)return;

    if(confirm("前回の編集内容を復元しますか？")){

        editor.value=draft;

        updatePreview();

    }

}
