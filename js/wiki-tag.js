/*
========================================
 WikiHub
 wiki-tag.js
 タグ一覧・タグ別記事一覧
========================================
*/

"use strict";


/*========================================
 初期化
========================================*/

document.addEventListener(
    "DOMContentLoaded",
    initTagPage
);


function initTagPage() {

    console.log(
        "WikiHub Tag Page: start"
    );


    /*
     * URLからタグを取得
     *
     * wiki-tag.html?tag=HTML
     */

    const params =
        new URLSearchParams(
            location.search
        );


    const selectedTag =
        params.get("tag");


    /*
     * タグ一覧を取得
     */

    const tags =
        collectTags();


    console.log(
        "取得したタグ:",
        tags
    );


    /*
     * 特定タグが指定されている場合
     */

    if (selectedTag) {

        showTagArticles(
            selectedTag,
            tags
        );

        return;

    }


    /*
     * タグ指定なし
     *
     * → 全タグ一覧
     */

    showAllTags(tags);

}


/*========================================
 Wikiデータ取得
========================================*/

function getWikiData() {

    let wikis = [];


    /*
     * WikiHubの共通データを取得
     */

    try {

        wikis =
            JSON.parse(
                localStorage.getItem(
                    "wikihub_wikis"
                )
            ) || [];

    } catch (error) {

        console.error(
            "Wikiデータの読み込みに失敗:",
            error
        );

        wikis = [];

    }


    return wikis;

}


/*========================================
 全記事取得
========================================*/

function getAllPages() {

    const wikis =
        getWikiData();


    const pages = [];


    /*
     * 全Wikiを確認
     */

    wikis.forEach(
        wiki => {

            if (
                !Array.isArray(
                    wiki.pages
                )
            ) {

                return;

            }


            wiki.pages.forEach(
                page => {

                    /*
                     * Wiki情報も保持
                     */

                    pages.push({

                        ...page,

                        wikiId:
                            wiki.id,

                        wikiName:
                            wiki.name ||
                            wiki.title ||
                            "Wiki"

                    });

                }
            );

        }
    );


    return pages;

}


/*========================================
 タグを集計
========================================*/

function collectTags() {

    const pages =
        getAllPages();


    const tagMap =
        new Map();


    pages.forEach(
        page => {

            /*
             * tagsが配列の場合
             */

            let tags =
                Array.isArray(page.tags)
                    ? page.tags
                    : [];


            /*
             * 万が一文字列で保存されていた場合
             */

            if (
                typeof page.tags ===
                "string"
            ) {

                tags =
                    page.tags
                        .split(",")
                        .map(
                            tag =>
                                tag.trim()
                        )
                        .filter(
                            Boolean
                        );

            }


            tags.forEach(
                tag => {

                    /*
                     * 空タグを無視
                     */

                    if (!tag) {

                        return;

                    }


                    /*
                     * 表示用にtrim
                     */

                    const cleanTag =
                        String(
                            tag
                        ).trim();


                    if (!cleanTag) {

                        return;

                    }


                    /*
                     * 大文字小文字を
                     * 区別しない集計キー
                     */

                    const key =
                        cleanTag.toLowerCase();


                    if (
                        !tagMap.has(key)
                    ) {

                        tagMap.set(
                            key,
                            {

                                name:
                                    cleanTag,

                                count:
                                    0

                            }
                        );

                    }


                    tagMap.get(
                        key
                    ).count++;

                }
            );

        }
    );


    /*
     * 配列へ変換
     */

    return Array.from(
        tagMap.values()
    ).sort(
        (a, b) =>
            a.name.localeCompare(
                b.name,
                "ja"
            )
    );

}


/*========================================
 全タグ一覧表示
========================================*/

function showAllTags(tags) {

    const title =
        document.getElementById(
            "tagTitle"
        );


    const description =
        document.getElementById(
            "tagDescription"
        );


    const list =
        document.getElementById(
            "tagList"
        );


    const articles =
        document.getElementById(
            "tagArticlesSection"
        );


    /*
     * タイトル
     */

    if (title) {

        title.textContent =
            "🏷️ タグ一覧";

    }


    if (description) {

        description.textContent =
            "WikiHubの記事をタグから探せます。";

    }


    /*
     * タグ記事エリアを隠す
     */

    if (articles) {

        articles.hidden = true;

    }


    if (!list) {

        return;

    }


    /*
     * タグが存在しない
     */

    if (tags.length === 0) {

        list.innerHTML = `

            <div class="wiki-empty">

                🏷️

                <h2>
                    タグがありません
                </h2>

                <p>
                    記事の「タグ」欄に
                    タグを追加するとここに表示されます。
                </p>

            </div>

        `;

        return;

    }


    /*
     * タグカード生成
     */

    list.innerHTML = "";


    tags.forEach(
        tag => {

            const link =
                document.createElement(
                    "a"
                );


            link.className =
                "wiki-tag-item";


            link.href =
                "wiki-tag.html?tag=" +
                encodeURIComponent(
                    tag.name
                );


            link.innerHTML = `

                <span class="wiki-tag-name">
                    🏷️ ${escapeTagHTML(tag.name)}
                </span>

                <span class="wiki-tag-count">
                    ${tag.count}記事
                </span>

            `;


            list.appendChild(
                link
            );

        }
    );

}


/*========================================
 タグの記事一覧
========================================*/

function showTagArticles(
    selectedTag,
    allTags
) {

    const title =
        document.getElementById(
            "tagTitle"
        );


    const description =
        document.getElementById(
            "tagDescription"
        );


    const tagListSection =
        document.getElementById(
            "tagListSection"
        );


    const articleSection =
        document.getElementById(
            "tagArticlesSection"
        );


    const articleContainer =
        document.getElementById(
            "tagArticles"
        );


    /*
     * タイトル
     */

    if (title) {

        title.innerHTML =
            "🏷️ " +
            escapeTagHTML(
                selectedTag
            );

    }


    if (description) {

        description.textContent =
            "このタグが付いている記事";

    }


    /*
     * タグ一覧を隠す
     */

    if (tagListSection) {

        tagListSection.hidden =
            true;

    }


    /*
     * 記事エリア表示
     */

    if (articleSection) {

        articleSection.hidden =
            false;

    }


    if (!articleContainer) {

        return;

    }


    /*
     * 全記事取得
     */

    const pages =
        getAllPages();


    /*
     * タグ比較用
     */

    const target =
        selectedTag
            .trim()
            .toLowerCase();


    /*
     * タグが一致する記事だけ取得
     */

    const matchedPages =
        pages.filter(
            page => {

                let tags =
                    Array.isArray(
                        page.tags
                    )
                        ? page.tags
                        : [];


                /*
                 * 文字列にも対応
                 */

                if (
                    typeof page.tags ===
                    "string"
                ) {

                    tags =
                        page.tags
                            .split(",")
                            .map(
                                tag =>
                                    tag.trim()
                            )
                            .filter(
                                Boolean
                            );

                }


                return tags.some(
                    tag =>
                        String(
                            tag
                        )
                            .trim()
                            .toLowerCase() ===
                        target
                );

            }
        );


    /*
     * 記事がない場合
     */

    if (
        matchedPages.length === 0
    ) {

        articleContainer.innerHTML = `

            <div class="wiki-empty">

                <h2>
                    記事がありません
                </h2>

                <p>
                    「${escapeTagHTML(selectedTag)}」
                    タグの記事は見つかりませんでした。
                </p>

                <a
                    href="wiki-tag.html"
                    class="wiki-button"
                >
                    ← タグ一覧へ
                </a>

            </div>

        `;

        return;

    }


    /*
     * 記事一覧
     */

    articleContainer.innerHTML = `

        <div class="tag-result-header">

            <strong>
                ${matchedPages.length}記事
            </strong>

            <a
                href="wiki-tag.html"
                class="wiki-button"
            >
                ← タグ一覧
            </a>

        </div>

        <div
            class="tag-article-list"
        ></div>

    `;


    const list =
        articleContainer.querySelector(
            ".tag-article-list"
        );


    /*
     * 記事カード
     */

    matchedPages.forEach(
        page => {

            const card =
                document.createElement(
                    "a"
                );


            card.className =
                "tag-article-card";


            card.href =
                "wiki.html?id=" +
                encodeURIComponent(
                    page.id
                );


            const title =
                page.title ||
                "無題の記事";


            const category =
                page.category ||
                "";


            let tags =
                Array.isArray(
                    page.tags
                )
                    ? page.tags
                    : [];


            if (
                typeof page.tags ===
                "string"
            ) {

                tags =
                    page.tags
                        .split(",")
                        .map(
                            tag =>
                                tag.trim()
                        )
                        .filter(
                            Boolean
                        );

            }


            const tagHTML =
                tags.map(
                    tag => `

                        <span
                            class="wiki-tag-small"
                        >
                            ${escapeTagHTML(tag)}
                        </span>

                    `
                ).join("");


            card.innerHTML = `

                <div class="tag-article-main">

                    <h2>
                        📄
                        ${escapeTagHTML(title)}
                    </h2>

                    ${
                        category
                            ? `
                                <div
                                    class="tag-article-category"
                                >
                                    📁
                                    ${escapeTagHTML(category)}
                                </div>
                              `
                            : ""
                    }

                </div>

                <div
                    class="tag-article-tags"
                >
                    ${tagHTML}
                </div>

            `;


            list.appendChild(
                card
            );

        }
    );

}


/*========================================
 HTMLエスケープ
========================================*/

function escapeTagHTML(value) {

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
 デバッグ
========================================*/

window.WikiHubTagDebug = {

    getPages:
        getAllPages,

    getTags:
        collectTags,

    showTag:
        showTagArticles

};


console.log(
    "WikiHub wiki-tag.js loaded"
);
