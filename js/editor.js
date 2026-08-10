/*
========================================
 WikiHub
 editor.js
 完全書き直し版
 Part 1 / 4
========================================
*/

"use strict";

/*========================================
 変数
========================================*/

let editor = null;
let preview = null;
let info = null;

let autoSaveTimer = null;

let historyStack = [];
let historyIndex = -1;


/*========================================
 URLパラメータ
========================================*/

const editorParams =
    new URLSearchParams(location.search);

const editMode =
    editorParams.get("edit") === "1";

const editPageId =
    editorParams.get("id");


/*========================================
 初期化
========================================*/

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    editor =
        document.getElementById("editor");

    preview =
        document.getElementById("preview");

    info =
        document.getElementById("editorInfo");


    if (!editor) {

        console.error(
            "editor が見つかりません。"
        );

        return;

    }


    /*
     * 編集モードなら
     * URLの記事を読み込む
     */

    if (
        editMode &&
        editPageId
    ) {

        loadPageForEdit();

    } else {

        loadCurrentPage();

    }


    setupEditor();

    setupImageDrop();

    setupTemplateButtons();

    setupPreviewButton();

    setupTabInput();

    setupSaveButton();

    setupDeleteButton();

    updatePreview();

    updateInfo();


    console.log(
        "WikiHub Editor initialized",
        {
            editMode,
            editPageId
        }
    );

}


/*========================================
 編集対象の記事を取得
========================================*/

function getPageForEdit() {

    if (
        !editMode ||
        !editPageId
    ) {

        return null;

    }


    let wikis = [];


    try {

        wikis =
            JSON.parse(
                localStorage.getItem(
                    "wikihub_wikis"
                )
            ) || [];

    } catch (error) {

        console.error(
            "Wikiデータ読み込み失敗:",
            error
        );

        return null;

    }


    /*
     * 現在のWiki
     */

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


    /*
     * 現在のWikiに無ければ
     * 全Wikiから検索
     */

    if (!wiki) {

        for (const w of wikis) {

            if (
                !Array.isArray(
                    w.pages
                )
            ) {

                continue;

            }


            const found =
                w.pages.some(
                    page =>
                        String(page.id) ===
                        String(editPageId)
                );


            if (found) {

                wiki = w;

                break;

            }

        }

    }


    if (
        !wiki ||
        !Array.isArray(wiki.pages)
    ) {

        return null;

    }


    const page =
        wiki.pages.find(
            p =>
                String(p.id) ===
                String(editPageId)
        );


    if (!page) {

        return null;

    }


    return {
        wiki,
        page
    };

}


/*========================================
 編集記事をフォームへ読み込む
========================================*/

function loadPageForEdit() {

    const result =
        getPageForEdit();


    if (
        !result ||
        !result.page
    ) {

        alert(
            "編集する記事が見つかりません。"
        );

        return;

    }


    const {
        wiki,
        page
    } = result;


    /*
     * 現在のWiki・記事を保存
     */

    localStorage.setItem(
        "wikihub_currentWiki",
        String(wiki.id)
    );

    localStorage.setItem(
        "wikihub_currentPage",
        String(page.id)
    );


    /*
     * タイトル
     */

    const title =
        document.getElementById(
            "pageTitleInput"
        );

    if (title) {

        title.value =
            page.title || "";

    }


    /*
     * 本文
     */

    if (editor) {

        editor.value =
            page.content || "";

    }


    /*
     * カテゴリ
     */

    const category =
        document.getElementById(
            "pageCategory"
        );

    if (category) {

        category.value =
            page.category || "";

    }


    /*
     * タグ
     */

    const tags =
        document.getElementById(
            "pageTags"
        );

    if (tags) {

        if (
            Array.isArray(
                page.tags
            )
        ) {

            tags.value =
                page.tags.join(", ");

        } else {

            tags.value =
                page.tags || "";

        }

    }


    /*
     * 見出し
     */

    const heading =
        document.getElementById(
            "editorTitle"
        );

    if (heading) {

        heading.textContent =
            "✏️ 記事を編集";

    }


    /*
     * 削除ボタンを表示
     * 編集モードのみ
     */

    const deleteButton =
        document.getElementById(
            "deletePage"
        );

    if (deleteButton) {

        deleteButton.style.display =
            "inline-flex";

    }

}


/*========================================
 現在ページ読込
========================================*/

function loadCurrentPage() {

    let page = null;


    /*
     * 編集ページキャッシュ
     */

    try {

        page =
            JSON.parse(
                localStorage.getItem(
                    "wikihub_editPage"
                )
            );

    } catch (error) {

        page = null;

    }


    /*
     * キャッシュが無ければ
     * Wikiデータから探す
     */

    if (!page) {

        const wikiId =
            localStorage.getItem(
                "wikihub_currentWiki"
            );

        const pageId =
            localStorage.getItem(
                "wikihub_currentPage"
            );


        try {

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


            if (
                wiki &&
                Array.isArray(
                    wiki.pages
                )
            ) {

                page =
                    wiki.pages.find(
                        p =>
                            String(p.id) ===
                            String(pageId)
                    ) || null;

            }

        } catch (error) {

            console.warn(
                "現在ページの読み込み失敗:",
                error
            );

        }

    }


    if (!page) {

        return;

    }


    const title =
        document.getElementById(
            "pageTitleInput"
        );

    const category =
        document.getElementById(
            "pageCategory"
        );

    const tags =
        document.getElementById(
            "pageTags"
        );


    if (title) {

        title.value =
            page.title || "";

    }


    if (editor) {

        editor.value =
            page.content || "";

    }


    if (category) {

        category.value =
            page.category || "";

    }


    if (tags) {

        tags.value =
            Array.isArray(page.tags)
                ? page.tags.join(", ")
                : page.tags || "";

    }

}

/*========================================
 WikiHub
 editor.js
 Part 2 / 4
 セッション・Editor・保存
========================================*/


/*========================================
 セッション
========================================*/

function getSession() {

    const keys = [
        "wikihub_session",
        "wikihub_currentUser",
        "currentUser",
        "session"
    ];


    for (const key of keys) {

        try {

            const raw =
                localStorage.getItem(key);


            if (!raw) {

                continue;

            }


            /*
             * JSON形式
             */

            try {

                const data =
                    JSON.parse(raw);

                if (data) {

                    return data;

                }

            } catch (error) {

                /*
                 * JSONではなく
                 * 文字列として保存されている場合
                 */

                return {
                    username: raw
                };

            }

        } catch (error) {

            console.warn(
                "セッション取得失敗:",
                key,
                error
            );

        }

    }


    return null;

}


/*========================================
 ユーザー名
========================================*/

function getSessionUsername() {

    const session =
        getSession();


    if (!session) {

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


/*========================================
 ユーザーID
========================================*/

function getSessionUserId() {

    const session =
        getSession();


    if (!session) {

        return null;

    }


    return (
        session.id ||
        session.userId ||
        session.uid ||
        null
    );

}


/*========================================
 ログイン確認
========================================*/

function checkSession() {

    const session =
        getSession();


    if (!session) {

        alert(
            "ログイン情報を取得できません。\n" +
            "ログインし直してください。"
        );

        return false;

    }


    return true;

}


/*========================================
 Editorユーザー情報
========================================*/

function getEditorUser() {

    const session =
        getSession();


    if (!session) {

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


/*========================================
 Toast通知
========================================*/

function showToast(
    message,
    type = "info",
    duration = 2500
) {

    /*
     * 古いToastを削除
     */

    const oldToast =
        document.getElementById(
            "wikihub-toast"
        );


    if (oldToast) {

        oldToast.remove();

    }


    /*
     * Toast作成
     */

    const toast =
        document.createElement(
            "div"
        );


    toast.id =
        "wikihub-toast";


    toast.textContent =
        message;


    /*
     * 基本スタイル
     */

    Object.assign(
        toast.style,
        {

            position: "fixed",

            left: "50%",

            bottom: "30px",

            transform:
                "translateX(-50%)",

            zIndex: "99999",

            padding:
                "12px 22px",

            borderRadius:
                "10px",

            fontSize:
                "15px",

            fontWeight:
                "bold",

            boxShadow:
                "0 4px 15px rgba(0,0,0,.25)",

            color: "#fff",

            opacity: "1"

        }
    );


    /*
     * 種類
     */

    if (type === "success") {

        toast.style.background =
            "#28a745";

    } else if (
        type === "error"
    ) {

        toast.style.background =
            "#dc3545";

    } else if (
        type === "warning"
    ) {

        toast.style.background =
            "#f0ad4e";

    } else {

        toast.style.background =
            "#2870d8";

    }


    document.body.appendChild(
        toast
    );


    /*
     * 自動消去
     */

    setTimeout(
        () => {

            if (
                !toast.isConnected
            ) {

                return;

            }


            toast.style.opacity =
                "0";

            toast.style.transition =
                "opacity .3s";


            setTimeout(
                () => {

                    if (
                        toast.isConnected
                    ) {

                        toast.remove();

                    }

                },
                300
            );

        },
        duration
    );

}


/*========================================
 Editorセットアップ
========================================*/

function setupEditor() {

    if (!editor) {

        return;

    }


    /*
     * 初期履歴
     */

    saveHistory();


    /*
     * 入力
     */

    editor.addEventListener(
        "input",
        () => {

            updatePreview();

            updateInfo();

            autoSave();

            saveHistory();

        }
    );

}


/*========================================
 プレビュー更新
========================================*/

function updatePreview() {

    if (
        !preview ||
        !editor
    ) {

        return;

    }


    let html = "";


    try {

        if (
            typeof parseWiki ===
            "function"
        ) {

            html =
                parseWiki(
                    editor.value
                );

        } else {

            html =
                escapeHTML(
                    editor.value
                );

        }

    } catch (error) {

        console.error(
            "Wiki構文解析エラー:",
            error
        );


        html =
            escapeHTML(
                editor.value
            );

    }


    /*
     * ローカル画像
     */

    html =
        parseFiles(html);


    preview.innerHTML =
        html;

}


/*========================================
 HTMLエスケープ
========================================*/

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/*========================================
 Editor情報
========================================*/

function updateInfo() {

    if (
        !info ||
        !editor
    ) {

        return;

    }


    const text =
        editor.value;


    const chars =
        text.length;


    const lines =
        text.split("\n").length;


    info.innerHTML =

        `文字数：${chars}` +
        `<br>` +
        `行数：${lines}`;

}


/*========================================
 自動保存
========================================*/

function autoSave() {

    if (!editor) {

        return;

    }


    clearTimeout(
        autoSaveTimer
    );


    autoSaveTimer =
        setTimeout(
            () => {

                localStorage.setItem(
                    "wikihub_draft",
                    editor.value
                );


                console.log(
                    "WikiHub Draft Saved"
                );

            },
            1000
        );

}


/*========================================
 保存ボタン
========================================*/

function setupSaveButton() {

    const saveButton =
        document.getElementById(
            "savePage"
        );


    if (!saveButton) {

        return;

    }


    saveButton.addEventListener(
        "click",
        savePage
    );

}


/*========================================
 Ctrl + S
========================================*/

document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
                "s"
        ) {

            event.preventDefault();

            savePage();

        }

    }
);


/*========================================
 記事保存
========================================*/

function savePage() {

    /*
     * ログイン確認
     */

    if (!checkSession()) {

        return;

    }


    /*
     * Wikiシステム確認
     */

    if (
        typeof loadWikis !==
        "function" ||
        typeof saveWikis !==
        "function"
    ) {

        showToast(
            "Wiki保存システムが読み込まれていません。",
            "error"
        );

        console.error(
            "loadWikis / saveWikis が見つかりません。"
        );

        return;

    }


    /*
     * Wiki読み込み
     */

    loadWikis();


    /*
     * Wiki ID
     */

    const wikiID =
        localStorage.getItem(
            "wikihub_currentWiki"
        );


    /*
     * 編集モードなら
     * URLのIDを優先
     */

    const pageID =
        editMode &&
        editPageId

            ? String(editPageId)

            : String(
                localStorage.getItem(
                    "wikihub_currentPage"
                ) || ""
            );


    /*
     * Wiki検索
     */

    const wiki =
        wikis.find(
            w =>
                String(w.id) ===
                String(wikiID)
        );


    if (!wiki) {

        showToast(
            "Wikiが見つかりません。",
            "error"
        );

        return;

    }


    /*
     * pages保証
     */

    if (
        !Array.isArray(
            wiki.pages
        )
    ) {

        wiki.pages = [];

    }


    /*
     * 記事検索
     */

    let page =
        wiki.pages.find(
            p =>
                String(p.id) ===
                String(pageID)
        );


    /*
     * 編集モードで記事が無い
     */

    if (
        editMode &&
        !page
    ) {

        showToast(
            "編集する記事が見つかりません。",
            "error"
        );

        return;

    }


    /*
     * 新規記事
     */

    if (!page) {

        page = {

            id:
                typeof createPageID ===
                "function"

                    ? createPageID()

                    : crypto.randomUUID(),

            title:
                "新しいページ",

            content:
                "",

            created:
                new Date().toISOString(),

            updated:
                new Date().toISOString(),

            category:
                "",

            tags:
                [],

            history:
                []

        };


        wiki.pages.push(
            page
        );

    }


    /*
     * 入力欄
     */

    const titleInput =
        document.getElementById(
            "pageTitleInput"
        );


    const categoryInput =
        document.getElementById(
            "pageCategory"
        );


    const tagsInput =
        document.getElementById(
            "pageTags"
        );


    const title =
        titleInput
            ? titleInput.value.trim()
            : "";


    const content =
        editor
            ? editor.value
            : "";


    const category =
        categoryInput
            ? categoryInput.value.trim()
            : "";


    const tagsText =
        tagsInput
            ? tagsInput.value
            : "";


    /*
     * タイトル必須
     */

    if (!title) {

        showToast(
            "タイトルを入力してください。",
            "warning"
        );


        if (titleInput) {

            titleInput.focus();

        }


        return;

    }


    /*
     * タグ
     */

    const tags =
        tagsText
            .split(",")
            .map(
                tag =>
                    tag.trim()
            )
            .filter(
                Boolean
            );


    /*
     * 履歴
     */

    if (
        !Array.isArray(
            page.history
        )
    ) {

        page.history = [];

    }


    page.history.push({

        date:
            new Date().toISOString(),

        content:
            content,

        title:
            title,

        editor:
            getSessionUsername()

    });


    /*
     * 記事更新
     */

    page.title =
        title;

    page.content =
        content;

    page.category =
        category;

    page.tags =
        tags;

    page.updated =
        new Date().toISOString();


    /*
     * 作成者
     */

    if (!page.author) {

        page.author =
            getSessionUsername();

    }


    /*
     * 統計
     */

    if (!wiki.statistics) {

        wiki.statistics = {

            pages:
                0,

            files:
                0,

            edits:
                0,

            members:
                1

        };

    }


    wiki.statistics.pages =
        wiki.pages.length;


    wiki.statistics.edits =
        Number(
            wiki.statistics.edits || 0
        ) + 1;


    /*
     * Wiki保存
     */

    saveWikis();


    /*
     * 現在ページ更新
     */

    localStorage.setItem(
        "wikihub_currentPage",
        String(page.id)
    );


    localStorage.setItem(
        "wikihub_currentWiki",
        String(wiki.id)
    );


    localStorage.setItem(
        "wikihub_editPage",
        JSON.stringify(page)
    );


    /*
     * 下書き削除
     */

    localStorage.removeItem(
        "wikihub_draft"
    );


    /*
     * 完了
     */

    showToast(
        editMode
            ? "記事を更新しました！"
            : "記事を保存しました！",
        "success"
    );


    /*
     * Wiki記事ページへ
     */

    setTimeout(
        () => {

            location.href =
                "wiki.html?id=" +
                encodeURIComponent(
                    page.id
                );

        },
        700
    );

}

/*========================================
 WikiHub
 editor.js
 Part 3 / 4
 削除・履歴・Undo / Redo
========================================*/


/*========================================
 削除ボタンセットアップ
========================================*/

function setupDeleteButton() {

    const deleteButton =
        document.getElementById(
            "deletePage"
        );


    if (!deleteButton) {

        console.log(
            "削除ボタンはありません。"
        );

        return;

    }


    /*
     * 新規作成モードでは非表示
     */

    if (!editMode) {

        deleteButton.style.display =
            "none";

        return;

    }


    /*
     * 編集モードでは表示
     */

    deleteButton.style.display =
        "inline-flex";


    /*
     * クリックイベント
     */

    deleteButton.addEventListener(
        "click",
        deleteCurrentPage
    );

}


/*========================================
 記事削除
========================================*/

function deleteCurrentPage() {

    console.log(
        "deleteCurrentPage() called"
    );


    /*
     * URLの記事IDを最優先
     */

    const urlParams =
        new URLSearchParams(
            location.search
        );


    const urlPageId =
        urlParams.get("id");


    const pageId =
        urlPageId ||
        localStorage.getItem(
            "wikihub_currentPage"
        );


    /*
     * Wiki ID
     */

    const wikiId =
        localStorage.getItem(
            "wikihub_currentWiki"
        );


    console.log(
        "削除対象:",
        {
            wikiId,
            pageId
        }
    );


    /*
     * IDチェック
     */

    if (!pageId) {

        showToast(
            "削除する記事が選択されていません。",
            "error"
        );

        return;

    }


    if (!wikiId) {

        showToast(
            "Wikiが選択されていません。",
            "error"
        );

        return;

    }


    /*
     * Wikiシステム確認
     */

    if (
        typeof loadWikis !==
        "function"
    ) {

        showToast(
            "Wikiデータを読み込めません。",
            "error"
        );

        console.error(
            "loadWikis が存在しません。"
        );

        return;

    }


    if (
        typeof saveWikis !==
        "function"
    ) {

        showToast(
            "Wikiデータを保存できません。",
            "error"
        );

        console.error(
            "saveWikis が存在しません。"
        );

        return;

    }


    /*
     * Wiki読み込み
     */

    loadWikis();


    /*
     * Wiki検索
     */

    const wiki =
        wikis.find(
            w =>
                String(w.id) ===
                String(wikiId)
        );


    if (!wiki) {

        showToast(
            "Wikiが見つかりません。",
            "error"
        );

        return;

    }


    /*
     * pagesチェック
     */

    if (
        !Array.isArray(
            wiki.pages
        )
    ) {

        showToast(
            "記事データがありません。",
            "error"
        );

        return;

    }


    /*
     * 記事検索
     */

    const page =
        wiki.pages.find(
            p =>
                String(p.id) ===
                String(pageId)
        );


    if (!page) {

        showToast(
            "削除する記事が見つかりません。",
            "error"
        );


        console.error(
            "記事が見つかりません:",
            pageId
        );


        return;

    }


    /*
     * タイトル
     */

    const title =
        page.title ||
        "無題の記事";


    /*
     * 最終確認
     */

    const confirmed =
        window.confirm(
            "この記事を削除しますか？\n\n" +
            "「" +
            title +
            "」\n\n" +
            "この操作は元に戻せません。"
        );


    if (!confirmed) {

        return;

    }


    /*
     * 記事削除
     */

    wiki.pages =
        wiki.pages.filter(
            p =>
                String(p.id) !==
                String(pageId)
        );


    /*
     * 統計更新
     */

    if (!wiki.statistics) {

        wiki.statistics = {

            pages: 0,

            files: 0,

            edits: 0,

            members: 1

        };

    }


    wiki.statistics.pages =
        wiki.pages.length;


    /*
     * 保存
     */

    saveWikis();


    /*
     * 現在ページ情報削除
     */

    localStorage.removeItem(
        "wikihub_currentPage"
    );


    localStorage.removeItem(
        "wikihub_editPage"
    );


    localStorage.removeItem(
        "wikihub_draft"
    );


    localStorage.removeItem(
        "wikihub_recovery"
    );


    /*
     * 完了通知
     */

    showToast(
        "「" +
        title +
        "」を削除しました。",
        "success"
    );


    /*
     * 記事一覧へ戻る
     */

    setTimeout(
        () => {

            location.href =
                "wiki-pages.html";

        },
        700
    );

}


/*========================================
 履歴を開く
========================================*/

function openHistory() {

    if (
        typeof loadWikis !==
        "function"
    ) {

        showToast(
            "Wikiデータを読み込めません。",
            "error"
        );

        return;

    }


    loadWikis();


    const wikiId =
        localStorage.getItem(
            "wikihub_currentWiki"
        );


    const pageId =
        editMode && editPageId

            ? editPageId

            : localStorage.getItem(
                "wikihub_currentPage"
            );


    const wiki =
        wikis.find(
            w =>
                String(w.id) ===
                String(wikiId)
        );


    if (!wiki) {

        return;

    }


    const page =
        (
            wiki.pages || []
        ).find(
            p =>
                String(p.id) ===
                String(pageId)
        );


    if (!page) {

        return;

    }


    const history =
        Array.isArray(page.history)
            ? page.history
            : [];


    if (!history.length) {

        showToast(
            "まだ編集履歴がありません。",
            "info"
        );

        return;

    }


    console.table(
        history
    );

}


/*========================================
 Tab入力
========================================*/

function setupTabInput() {

    if (!editor) {

        return;

    }


    editor.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Tab"
            ) {

                return;

            }


            event.preventDefault();


            const start =
                editor.selectionStart;


            const end =
                editor.selectionEnd;


            /*
             * 4スペース挿入
             */

            editor.setRangeText(
                "    ",
                start,
                end,
                "end"
            );


            /*
             * プレビュー更新
             */

            updatePreview();

            updateInfo();

            saveHistory();

        }
    );

}


/*========================================
 履歴保存
========================================*/

function saveHistory() {

    if (!editor) {

        return;

    }


    /*
     * 同じ内容は保存しない
     */

    if (
        historyStack.length > 0 &&
        historyStack[
            historyStack.length - 1
        ] === editor.value
    ) {

        return;

    }


    /*
     * Undo後に入力した場合
     * 未来の履歴を削除
     */

    if (
        historyIndex <
        historyStack.length - 1
    ) {

        historyStack =
            historyStack.slice(
                0,
                historyIndex + 1
            );

    }


    /*
     * 履歴追加
     */

    historyStack.push(
        editor.value
    );


    historyIndex =
        historyStack.length - 1;


    /*
     * 最大100件
     */

    if (
        historyStack.length > 100
    ) {

        historyStack.shift();

        historyIndex--;

    }

}


/*========================================
 Ctrl + Z / Ctrl + Y
========================================*/

document.addEventListener(
    "keydown",
    event => {

        /*
         * Undo
         */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
                "z"
        ) {

            event.preventDefault();

            undo();

            return;

        }


        /*
         * Redo
         */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
                "y"
        ) {

            event.preventDefault();

            redo();

        }

    }
);


/*========================================
 Undo
========================================*/

function undo() {

    if (
        !editor ||
        historyIndex <= 0
    ) {

        return;

    }


    historyIndex--;


    editor.value =
        historyStack[
            historyIndex
        ];


    updatePreview();

    updateInfo();

}


/*========================================
 Redo
========================================*/

function redo() {

    if (
        !editor ||
        historyIndex >=
            historyStack.length - 1
    ) {

        return;

    }


    historyIndex++;


    editor.value =
        historyStack[
            historyIndex
        ];


    updatePreview();

    updateInfo();

}

/*========================================
 WikiHub
 editor.js
 Part 4 / 4
 画像・テンプレート・プレビュー・リカバリー
========================================*/


/*========================================
 画像ドラッグ＆ドロップ
========================================*/

function setupImageDrop() {

    if (!editor) {

        return;

    }


    /*
     * ドラッグ中
     */

    editor.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            editor.classList.add(
                "drag-over"
            );

        }
    );


    /*
     * ドラッグ終了
     */

    editor.addEventListener(
        "dragleave",
        () => {

            editor.classList.remove(
                "drag-over"
            );

        }
    );


    /*
     * ドロップ
     */

    editor.addEventListener(
        "drop",
        event => {

            event.preventDefault();


            editor.classList.remove(
                "drag-over"
            );


            const file =
                event.dataTransfer.files[0];


            if (!file) {

                return;

            }


            /*
             * 画像チェック
             */

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showToast(
                    "画像ファイルのみ追加できます。",
                    "warning"
                );

                return;

            }


            /*
             * FileReader
             */

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    /*
                     * Wiki本文にFileタグ
                     */

                    insertText(
                        "\n[[File:" +
                        file.name +
                        "]]\n"
                    );


                    /*
                     * LocalStorage保存
                     */

                    saveLocalImage(
                        file.name,
                        event.target.result
                    );


                    updatePreview();

                };


            reader.onerror =
                () => {

                    showToast(
                        "画像の読み込みに失敗しました。",
                        "error"
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/*========================================
 ローカル画像保存
========================================*/

function saveLocalImage(
    name,
    data
) {

    let files = [];


    try {

        files =
            JSON.parse(
                localStorage.getItem(
                    "wikihub_files"
                )
            ) || [];

    } catch (error) {

        files = [];

    }


    /*
     * 同名画像がある場合は更新
     */

    const existing =
        files.find(
            file =>
                file.name === name
        );


    if (existing) {

        existing.data =
            data;

        existing.updated =
            new Date().toISOString();

    } else {

        files.push({

            id:
                crypto.randomUUID(),

            name:
                name,

            type:
                "image",

            data:
                data,

            created:
                new Date().toISOString()

        });

    }


    localStorage.setItem(
        "wikihub_files",
        JSON.stringify(files)
    );

}


/*========================================
 テンプレート
========================================*/

function setupTemplateButtons() {

    const templates = {

        /*
         * Infobox
         */

        infobox:
`{{Infobox
|タイトル=
|画像=
|説明=
}}`,


        /*
         * 引用
         */

        quote:
`> 引用文`,


        /*
         * コード
         */

        code:
`\\\`\\\`\\\`javascript

\\\`\\\`\\\``,


        /*
         * 表
         */

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


    /*
     * グローバル関数
     *
     * HTML側から
     * insertTemplate("quote")
     * のように呼び出せる
     */

    window.insertTemplate =
        function(type) {

            if (
                !templates[type]
            ) {

                return;

            }


            insertText(
                templates[type]
            );

        };

}


/*========================================
 テキスト挿入
========================================*/

function insertText(text) {

    if (!editor) {

        return;

    }


    const start =
        editor.selectionStart;


    const end =
        editor.selectionEnd;


    editor.setRangeText(
        text,
        start,
        end,
        "end"
    );


    editor.focus();


    updatePreview();

    updateInfo();

    saveHistory();

}


/*========================================
 プレビュー切替
========================================*/

function setupPreviewButton() {

    const button =
        document.getElementById(
            "previewButton"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            if (!preview) {

                return;

            }


            const hidden =
                preview.hidden;


            preview.hidden =
                !hidden;


            /*
             * ボタン表示
             */

            button.textContent =
                preview.hidden
                    ? "👁️ プレビュー"
                    : "✖️ プレビューを閉じる";

        }
    );

}


/*========================================
 Fileタグを画像へ変換
========================================*/

function parseFiles(html) {

    let files = [];


    try {

        files =
            JSON.parse(
                localStorage.getItem(
                    "wikihub_files"
                )
            ) || [];

    } catch (error) {

        files = [];

    }


    /*
     * 画像タグ変換
     */

    files.forEach(
        file => {

            const tag =
                "[[File:" +
                file.name +
                "]]";


            const image =
                `<img
                    src="${file.data}"
                    alt="${escapeHTML(file.name)}"
                    style="
                        max-width:100%;
                        height:auto;
                        border-radius:8px;
                        margin:10px 0;
                    "
                >`;


            html =
                html.replaceAll(
                    tag,
                    image
                );

        }
    );


    return html;

}


/*========================================
 Ctrl + S以外のキーボード補助
========================================*/

document.addEventListener(
    "keydown",
    event => {

        /*
         * Ctrl + Shift + P
         *
         * プレビュー切替
         */

        if (
            event.ctrlKey &&
            event.shiftKey &&
            event.key.toLowerCase() ===
                "p"
        ) {

            event.preventDefault();


            const button =
                document.getElementById(
                    "previewButton"
                );


            if (button) {

                button.click();

            }

        }

    }
);


/*========================================
 リカバリー保存
========================================*/

window.addEventListener(
    "beforeunload",
    () => {

        if (!editor) {

            return;

        }


        /*
         * 空の記事は保存しない
         */

        if (
            editor.value.trim() === ""
        ) {

            return;

        }


        localStorage.setItem(
            "wikihub_recovery",
            editor.value
        );

    }
);


/*========================================
 リカバリー復元
========================================*/

function restoreRecovery() {

    const draft =
        localStorage.getItem(
            "wikihub_recovery"
        );


    if (!draft) {

        return;

    }


    const confirmed =
        window.confirm(
            "前回の編集内容を復元しますか？"
        );


    if (!confirmed) {

        localStorage.removeItem(
            "wikihub_recovery"
        );

        return;

    }


    if (!editor) {

        return;

    }


    editor.value =
        draft;


    updatePreview();

    updateInfo();

    saveHistory();


    showToast(
        "編集内容を復元しました。",
        "success"
    );

}


/*========================================
 編集モードの最終チェック
========================================*/

function checkEditorMode() {

    console.log(
        "===== WikiHub Editor ====="
    );


    console.log(
        "editMode:",
        editMode
    );


    console.log(
        "editPageId:",
        editPageId
    );


    console.log(
        "currentWiki:",
        localStorage.getItem(
            "wikihub_currentWiki"
        )
    );


    console.log(
        "currentPage:",
        localStorage.getItem(
            "wikihub_currentPage"
        )
    );


    console.log(
        "deleteCurrentPage:",
        typeof deleteCurrentPage
    );


    console.log(
        "savePage:",
        typeof savePage
    );


    console.log(
        "loadWikis:",
        typeof loadWikis
    );


    console.log(
        "saveWikis:",
        typeof saveWikis
    );

}


/*========================================
 最終初期化確認
========================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkEditorMode();

    }
);
