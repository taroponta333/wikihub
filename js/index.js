/*
====================================
 WikiHub
 index.js
 Version 0.2
====================================
*/

"use strict";

/*====================================
 初期化
====================================*/

document.addEventListener("DOMContentLoaded", initIndex);

function initIndex(){

    loadDashboard();

    loadUserCard();

    loadFeaturedWiki();

    loadMyWiki();

    loadRecentWiki();

    loadStatistics();

    loadRecentUpdates();

    loadPopularPages();

    loadFavorites();

    loadRanking();

    loadStorage();

    loadNews();

    loadNewWiki();

    loadDarkMode();

    setupSearch();

    welcomeUser();

    loadPinnedWiki();

    loadTrendWiki();

    loadToday();

    loadActivity();

    loadRecentPages();

    saveQuickAccess();

    firstLaunch();

    loadTagCloud();

    loadRecentEditedWiki();

    updateBackupStatus();

    loadMemo();

    loadTheme();

    loadSimpleStats();

    loadTip();
    
    buildSearchIndex();

    loadNotifications();

    registerShortcuts();

    showStartupTime();

    loadSearchHistory();

    loadPlugins();

    loadWidgets();

    loadSystemInfo();

    debugInfo();
}
/*====================================
 Dashboard
====================================*/

function loadDashboard(){

    loadWikis();

    loadUsers();

    const files = JSON.parse(
        localStorage.getItem("wikihub_files")
    ) || [];

    let pageCount = 0;

    wikis.forEach(function(w){

        pageCount += w.pages.length;

    });

    document.getElementById(
        "dashboardWiki"
    ).textContent = wikis.length;

    document.getElementById(
        "dashboardPages"
    ).textContent = pageCount;

    document.getElementById(
        "dashboardUsers"
    ).textContent = users.length;

    document.getElementById(
        "dashboardFiles"
    ).textContent = files.length;

}

/*====================================
 User
====================================*/

function loadUserCard(){

    const session = getSession();

    if(!session) return;

    const user = findUser(
        session.username
    );

    if(!user) return;

    document.getElementById(
        "sideUsername"
    ).textContent =
    user.displayName || user.username;

    document.getElementById(
        "sideRole"
    ).textContent =
    user.role || "User";

    if(user.icon){

        document.getElementById(
            "sideUserIcon"
        ).src = user.icon;

    }

}

/*====================================
 Featured Wiki
====================================*/

function loadFeaturedWiki(){

    const box =
    document.getElementById(
        "featuredWiki"
    );

    if(!box) return;

    box.innerHTML = "";

    loadWikis();

    const list =

    [...wikis]

    .sort(function(a,b){

        return b.statistics.pages -

               a.statistics.pages;

    })

    .slice(0,6);

    list.forEach(function(wiki){

        box.appendChild(

            createWikiCard(wiki)

        );

    });

}

/*====================================
 My Wiki
====================================*/

function loadMyWiki(){

    const box =

    document.getElementById(
        "myWikiList"
    );

    if(!box) return;

    box.innerHTML = "";

    const session = getSession();

    if(!session){

        box.innerHTML =

        "<p>ログインしてください。</p>";

        return;

    }

    loadWikis();

    wikis.forEach(function(wiki){

        if(wiki.owner===session.username){

            box.appendChild(

                createWikiCard(wiki)

            );

        }

    });

}

/*====================================
 Recent Wiki
====================================*/

function loadRecentWiki(){

    const box =

    document.getElementById(
        "recentWikiList"
    );

    if(!box) return;

    box.innerHTML = "";

    const recent =

    JSON.parse(

        localStorage.getItem(

            "wikihub_recent"

        )

    ) || [];

    if(recent.length===0){

        box.innerHTML =

        "<p>まだありません</p>";

        return;

    }

    recent.forEach(function(id){

        const wiki =

        wikis.find(

            w=>w.id===id

        );

        if(!wiki) return;

        const div =

        document.createElement("div");

        div.className="recentItem";

        div.textContent=wiki.name;

        div.onclick=function(){

            localStorage.setItem(

                "wikihub_currentWiki",

                wiki.id

            );

            location.href="wiki.html";

        };

        box.appendChild(div);

    });

}

/*====================================
 Statistics
====================================*/

function loadStatistics(){

    loadWikis();

    loadUsers();

    const files=

    JSON.parse(

        localStorage.getItem(

            "wikihub_files"

        )

    )||[];

    let pages=0;

    wikis.forEach(function(w){

        pages+=w.pages.length;

    });

    document.getElementById(

        "totalWiki"

    ).textContent=wikis.length;

    document.getElementById(

        "totalPages"

    ).textContent=pages;

    document.getElementById(

        "totalUsers"

    ).textContent=users.length;

    document.getElementById(

        "totalFiles"

    ).textContent=files.length;

}

/*====================================
 Wiki Card
====================================*/

function createWikiCard(wiki){

    const card=

    document.createElement("div");

    card.className="wikiCard";

    card.innerHTML=`

        <h3>

            📚 ${wiki.name}

        </h3>

        <p>

            ${wiki.description || "説明なし"}

        </p>

        <small>

            記事数：

            ${wiki.pages.length}

        </small>

    `;

    card.onclick=function(){

        localStorage.setItem(

            "wikihub_currentWiki",

            wiki.id

        );

        location.href="wiki.html";

    };

    return card;

}
/*====================================
 Recent Updates
====================================*/

function loadRecentUpdates(){

    const box=document.getElementById(
        "recentUpdateList"
    );

    if(!box)return;

    box.innerHTML="";

    loadWikis();

    let pages=[];

    wikis.forEach(function(wiki){

        wiki.pages.forEach(function(page){

            pages.push({

                wiki:wiki,

                page:page

            });

        });

    });

    pages.sort(function(a,b){

        return new Date(b.page.updated)-
               new Date(a.page.updated);

    });

    pages.slice(0,10).forEach(function(item){

        const div=document.createElement("div");

        div.className="recentItem";

        div.innerHTML=`
        📄 <strong>${item.page.title}</strong>
        <br>
        <small>${item.wiki.name}</small>
        `;

        div.onclick=function(){

            localStorage.setItem(
                "wikihub_currentWiki",
                item.wiki.id
            );

            localStorage.setItem(
                "wikihub_currentPage",
                item.page.id
            );

            location.href="wiki.html";

        };

        box.appendChild(div);

    });

}

/*====================================
 Popular Pages
====================================*/

function loadPopularPages(){

    const box=document.getElementById(
        "popularPages"
    );

    if(!box)return;

    box.innerHTML="";

    let pages=[];

    wikis.forEach(function(wiki){

        wiki.pages.forEach(function(page){

            pages.push({

                wiki:wiki,

                page:page,

                views:page.views||0

            });

        });

    });

    pages.sort(function(a,b){

        return b.views-a.views;

    });

    pages.slice(0,5).forEach(function(item){

        const div=document.createElement("div");

        div.className="popularItem";

        div.textContent=
        "🔥 "+item.page.title;

        div.onclick=function(){

            localStorage.setItem(
                "wikihub_currentWiki",
                item.wiki.id
            );

            localStorage.setItem(
                "wikihub_currentPage",
                item.page.id
            );

            location.href="wiki.html";

        };

        box.appendChild(div);

    });

}

/*====================================
 Favorite Wiki
====================================*/

function loadFavorites(){

    const box=document.getElementById(
        "favoriteWikiList"
    );

    if(!box)return;

    box.innerHTML="";

    const favs=

    JSON.parse(

        localStorage.getItem(

            "wikihub_favorites"

        )

    )||[];

    if(favs.length===0){

        box.innerHTML="<p>お気に入りはありません</p>";

        return;

    }

    favs.forEach(function(id){

        const wiki=

        wikis.find(

            w=>w.id===id

        );

        if(!wiki)return;

        const div=document.createElement("div");

        div.className="favoriteItem";

        div.textContent="⭐ "+wiki.name;

        div.onclick=function(){

            localStorage.setItem(

                "wikihub_currentWiki",

                wiki.id

            );

            location.href="wiki.html";

        };

        box.appendChild(div);

    });

}

/*====================================
 Ranking
====================================*/

function loadRanking(){

    const list=document.getElementById(
        "rankingList"
    );

    if(!list)return;

    list.innerHTML="";

    loadUsers();

    users.sort(function(a,b){

        return (b.editCount||0)-

               (a.editCount||0);

    });

    users.slice(0,10).forEach(function(user){

        const li=document.createElement("li");

        li.textContent=

        user.username+

        " ("+

        (user.editCount||0)+

        ")";

        list.appendChild(li);

    });

}

/*====================================
 Storage
====================================*/

function loadStorage(){

    const bar=document.getElementById(
        "storageBar"
    );

    const text=document.getElementById(
        "storageText"
    );

    if(!bar||!text)return;

    const used=

    JSON.stringify(localStorage).length;

    const max=10*1024*1024;

    const percent=

    Math.min(

        100,

        used/max*100

    );

    bar.style.width=

    percent+"%";

    text.textContent=

    (used/1024/1024).toFixed(2)+

    " MB / 10 MB";

}

/*====================================
 News
====================================*/

function loadNews(){

    const box=document.getElementById(
        "newsArea"
    );

    if(!box)return;

    box.innerHTML=`

    <p>🎉 WikiHub v0.2へようこそ！</p>

    <p>📚 新しいWikiを作ってみましょう。</p>

    <p>📝 エディターがさらに高機能になりました。</p>

    <p>💾 オフラインでも完全動作します。</p>

    `;

}
/*====================================
 Part3
 Home Functions
====================================*/

/*====================================
 検索
====================================*/

function setupSearch(){

    const box=document.getElementById("searchBox");

    if(!box)return;

    box.addEventListener("input",function(){

        const word=this.value.toLowerCase();

        const cards=document.querySelectorAll(".wikiCard");

        cards.forEach(function(card){

            if(card.textContent.toLowerCase().includes(word)){

                card.style.display="block";

            }else{

                card.style.display="none";

            }

        });

    });

}

/*====================================
 カテゴリ検索
====================================*/

function filterCategory(category){

    const cards=document.querySelectorAll(".wikiCard");

    cards.forEach(function(card){

        const cat=

        card.dataset.category||"";

        if(category==="ALL"){

            card.style.display="block";

            return;

        }

        card.style.display=

        cat===category

        ?"block"

        :"none";

    });

}

/*====================================
 タグ検索
====================================*/

function searchTag(tag){

    const cards=document.querySelectorAll(".wikiCard");

    cards.forEach(function(card){

        const tags=

        (card.dataset.tags||"")

        .split(",");

        card.style.display=

        tags.includes(tag)

        ?"block"

        :"none";

    });

}

/*====================================
 新着Wiki
====================================*/

function loadNewWiki(){

    const box=

    document.getElementById(

        "newWikiList"

    );

    if(!box)return;

    box.innerHTML="";

    loadWikis();

    const list=[...wikis]

    .sort(function(a,b){

        return new Date(

            b.created

        )-

        new Date(

            a.created

        );

    })

    .slice(0,6);

    list.forEach(function(wiki){

        box.appendChild(

            createWikiCard(

                wiki

            )

        );

    });

}

/*====================================
 ダークモード
====================================*/

function toggleDarkMode(){

    document.body.classList.toggle(

        "dark"

    );

    localStorage.setItem(

        "wikihub_dark",

        document.body.classList.contains(

            "dark"

        )

    );

}

function loadDarkMode(){

    if(

        localStorage.getItem(

            "wikihub_dark"

        )==="true"

    ){

        document.body.classList.add(

            "dark"

        );

    }

}

/*====================================
 通知
====================================*/

function showNotification(text){

    const div=

    document.createElement(

        "div"

    );

    div.className=

    "notification";

    div.textContent=text;

    document.body.appendChild(div);

    setTimeout(function(){

        div.classList.add(

            "show"

        );

    },100);

    setTimeout(function(){

        div.classList.remove(

            "show"

        );

        setTimeout(function(){

            div.remove();

        },300);

    },3000);

}

/*====================================
 ようこそ
====================================*/

function welcomeUser(){

    const session=getSession();

    if(!session)return;

    const title=

    document.getElementById(

        "welcomeTitle"

    );

    if(title){

        title.textContent=

        "👋 おかえり、"

        +

        session.username

        +

        "さん！";

    }

}
/*====================================
 Part4
 Dashboard+
====================================*/

/*====================================
 ピン留めWiki
====================================*/

function loadPinnedWiki(){

    const box=document.getElementById("pinnedWikiList");

    if(!box)return;

    box.innerHTML="";

    const pinned=

    JSON.parse(

        localStorage.getItem(

            "wikihub_pinned"

        )

    )||[];

    if(pinned.length===0){

        box.innerHTML="<p>ピン留めされたWikiはありません。</p>";

        return;

    }

    pinned.forEach(function(id){

        const wiki=wikis.find(w=>w.id===id);

        if(!wiki)return;

        box.appendChild(createWikiCard(wiki));

    });

}

/*====================================
 トレンドWiki
====================================*/

function loadTrendWiki(){

    const box=document.getElementById("trendWikiList");

    if(!box)return;

    box.innerHTML="";

    const trend=[...wikis]

    .sort(function(a,b){

        return (b.statistics.views||0)

        -(a.statistics.views||0);

    })

    .slice(0,5);

    trend.forEach(function(wiki){

        box.appendChild(

            createWikiCard(wiki)

        );

    });

}

/*====================================
 ランダム記事
====================================*/

function openRandomPage(){

    let pages=[];

    wikis.forEach(function(wiki){

        wiki.pages.forEach(function(page){

            pages.push({

                wiki:wiki,

                page:page

            });

        });

    });

    if(pages.length===0){

        alert("記事がありません。");

        return;

    }

    const random=

    pages[

        Math.floor(

            Math.random()*pages.length

        )

    ];

    localStorage.setItem(

        "wikihub_currentWiki",

        random.wiki.id

    );

    localStorage.setItem(

        "wikihub_currentPage",

        random.page.id

    );

    location.href="wiki.html";

}

/*====================================
 今日の出来事
====================================*/

function loadToday(){

    const area=document.getElementById(

        "todayArea"

    );

    if(!area)return;

    const d=new Date();

    area.innerHTML=

    `
    <h3>

    📅 ${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}

    </h3>

    <p>

    今日もWikiHubで記事を書こう！

    </p>

    `;

}

/*====================================
 編集アクティビティ
====================================*/

function loadActivity(){

    const area=document.getElementById(

        "activityList"

    );

    if(!area)return;

    area.innerHTML="";

    loadUsers();

    users

    .sort(function(a,b){

        return (b.editCount||0)

        -(a.editCount||0);

    })

    .slice(0,5)

    .forEach(function(user){

        const div=

        document.createElement("div");

        div.className="activityItem";

        div.innerHTML=

        `
        ✏

        ${user.username}

        <br>

        編集数：

        ${user.editCount||0}

        `;

        area.appendChild(div);

    });

}

/*====================================
 最近見た記事
====================================*/

function loadRecentPages(){

    const box=document.getElementById(

        "recentPageList"

    );

    if(!box)return;

    box.innerHTML="";

    const list=

    JSON.parse(

        localStorage.getItem(

            "wikihub_recentPages"

        )

    )||[];

    list.forEach(function(page){

        const div=document.createElement("div");

        div.className="recentItem";

        div.textContent=page.title;

        box.appendChild(div);

    });

}

/*====================================
 クイックアクセス
====================================*/

function saveQuickAccess(){

    const data=[

        "create",

        "editor",

        "explorer",

        "profile"

    ];

    localStorage.setItem(

        "wikihub_quick",

        JSON.stringify(data)

    );

}

/*====================================
 初回起動
====================================*/

function firstLaunch(){

    if(

        localStorage.getItem(

            "wikihub_first"

        )

    )return;

    localStorage.setItem(

        "wikihub_first",

        "true"

    );

    showNotification(

        "🎉 WikiHubへようこそ！"

    );

}
/*====================================
 Part5
 Widgets & Dashboard
====================================*/

/*====================================
 タグクラウド
====================================*/

function loadTagCloud(){

    const box=document.getElementById("tagCloud");

    if(!box)return;

    box.innerHTML="";

    const tags={};

    loadWikis();

    wikis.forEach(function(wiki){

        wiki.pages.forEach(function(page){

            (page.tags||[]).forEach(function(tag){

                tags[tag]=(tags[tag]||0)+1;

            });

        });

    });

    Object.keys(tags)

    .sort()

    .forEach(function(tag){

        const span=document.createElement("span");

        span.className="tagCloudItem";

        span.textContent=

        tag+" ("+tags[tag]+")";

        span.onclick=function(){

            searchTag(tag);

        };

        box.appendChild(span);

    });

}

/*====================================
 最近編集Wiki
====================================*/

function loadRecentEditedWiki(){

    const box=document.getElementById(

        "recentEditedWiki"

    );

    if(!box)return;

    box.innerHTML="";

    const list=[...wikis]

    .sort(function(a,b){

        return new Date(

            b.updated||0

        )-

        new Date(

            a.updated||0

        );

    })

    .slice(0,5);

    list.forEach(function(wiki){

        box.appendChild(

            createWikiCard(wiki)

        );

    });

}

/*====================================
 バックアップ状態
====================================*/

function updateBackupStatus(){

    const label=document.getElementById(

        "backupStatus"

    );

    if(!label)return;

    const last=

    localStorage.getItem(

        "wikihub_lastBackup"

    );

    if(!last){

        label.textContent=

        "バックアップ未作成";

        return;

    }

    label.textContent=

    "最終バックアップ："+last;

}

/*====================================
 メモ
====================================*/

function loadMemo(){

    const memo=document.getElementById(

        "memoArea"

    );

    if(!memo)return;

    memo.value=

    localStorage.getItem(

        "wikihub_memo"

    )||"";

    memo.addEventListener(

        "input",

        function(){

            localStorage.setItem(

                "wikihub_memo",

                this.value

            );

        }

    );

}

/*====================================
 テーマ
====================================*/

function changeTheme(theme){

    document.body.dataset.theme=

    theme;

    localStorage.setItem(

        "wikihub_theme",

        theme

    );

}

function loadTheme(){

    const theme=

    localStorage.getItem(

        "wikihub_theme"

    )||"default";

    document.body.dataset.theme=

    theme;

}

/*====================================
 簡易統計
====================================*/

function loadSimpleStats(){

    const box=document.getElementById(

        "simpleStats"

    );

    if(!box)return;

    const pageCount=

    wikis.reduce(

        (sum,w)=>sum+w.pages.length,

        0

    );

    const fileCount=

    JSON.parse(

        localStorage.getItem(

            "wikihub_files"

        )

    )||[];

    box.innerHTML=`

📚 Wiki数：${wikis.length}<br>

📄 記事数：${pageCount}<br>

🖼 ファイル数：${fileCount.length}

`;

}

/*====================================
 今日のヒント
====================================*/

function loadTip(){

    const tips=[

"内部リンク [[ページ名]] を使って記事をつなげよう！",

"カテゴリを付けると検索しやすくなります。",

"テンプレートを使うと記事作成が楽になります。",

"バックアップを定期的に作成しましょう。",

"画像を追加すると記事が見やすくなります。"

    ];

    const tip=document.getElementById(

        "todayTip"

    );

    if(!tip)return;

    tip.textContent=

    tips[

        Math.floor(

            Math.random()*tips.length

        )

    ];

}
/*====================================
 Part6
 Advanced Features
====================================*/

/*====================================
 全文検索インデックス
====================================*/

function buildSearchIndex(){

    const index=[];

    loadWikis();

    wikis.forEach(function(wiki){

        wiki.pages.forEach(function(page){

            index.push({

                wikiId:wiki.id,

                pageId:page.id,

                title:page.title,

                text:page.content||"",

                tags:page.tags||[]

            });

        });

    });

    window.searchIndex=index;

}

/*====================================
 全文検索
====================================*/

function fullSearch(keyword){

    if(!window.searchIndex)return[];

    keyword=keyword.toLowerCase();

    return window.searchIndex.filter(function(item){

        return(

            item.title.toLowerCase().includes(keyword)||

            item.text.toLowerCase().includes(keyword)||

            item.tags.join(" ").toLowerCase().includes(keyword)

        );

    });

}

/*====================================
 通知
====================================*/

function loadNotifications(){

    const area=document.getElementById("notificationList");

    if(!area)return;

    area.innerHTML="";

    const list=

    JSON.parse(

        localStorage.getItem(

            "wikihub_notifications"

        )

    )||[];

    if(list.length===0){

        area.innerHTML="<p>通知はありません</p>";

        return;

    }

    list.forEach(function(item){

        const div=document.createElement("div");

        div.className="notificationItem";

        div.textContent=item.text;

        area.appendChild(div);

    });

}

/*====================================
 通知追加
====================================*/

function addNotification(text){

    const list=

    JSON.parse(

        localStorage.getItem(

            "wikihub_notifications"

        )

    )||[];

    list.unshift({

        text:text,

        time:Date.now()

    });

    while(list.length>30){

        list.pop();

    }

    localStorage.setItem(

        "wikihub_notifications",

        JSON.stringify(list)

    );

}

/*====================================
 キーボードショートカット
====================================*/

function registerShortcuts(){

    document.addEventListener(

        "keydown",

        function(e){

            if(e.ctrlKey && e.key==="k"){

                e.preventDefault();

                document.getElementById(

                    "searchBox"

                ).focus();

            }

            if(e.ctrlKey && e.key==="n"){

                e.preventDefault();

                location.href="create-wiki.html";

            }

            if(e.ctrlKey && e.key==="e"){

                e.preventDefault();

                location.href="editor.html";

            }

        }

    );

}

/*====================================
 起動時間表示
====================================*/

function showStartupTime(){

    const label=document.getElementById(

        "startupTime"

    );

    if(!label)return;

    const start=

    performance.now().toFixed(1);

    label.textContent=

    start+" ms";

}

/*====================================
 最近の検索
====================================*/

function saveSearchHistory(word){

    let history=

    JSON.parse(

        localStorage.getItem(

            "wikihub_searchHistory"

        )

    )||[];

    history.unshift(word);

    history=[...new Set(history)];

    history=history.slice(0,20);

    localStorage.setItem(

        "wikihub_searchHistory",

        JSON.stringify(history)

    );

}

/*====================================
 最近の検索表示
====================================*/

function loadSearchHistory(){

    const box=document.getElementById(

        "searchHistory"

    );

    if(!box)return;

    box.innerHTML="";

    const history=

    JSON.parse(

        localStorage.getItem(

            "wikihub_searchHistory"

        )

    )||[];

    history.forEach(function(word){

        const btn=document.createElement("button");

        btn.textContent=word;

        btn.onclick=function(){

            document.getElementById(

                "searchBox"

            ).value=word;

        };

        box.appendChild(btn);

    });

}

/*====================================
 自動保存
====================================*/

function autoSave(){

    localStorage.setItem(

        "wikihub_lastOpen",

        new Date().toISOString()

    );

}

setInterval(autoSave,30000);
/*====================================
 Part7
 System Core
====================================*/

/*====================================
 プラグイン
====================================*/

function loadPlugins(){

    const plugins=

    JSON.parse(

        localStorage.getItem(

            "wikihub_plugins"

        )

    )||[];

    window.plugins=plugins;

}

function registerPlugin(plugin){

    loadPlugins();

    plugins.push(plugin);

    localStorage.setItem(

        "wikihub_plugins",

        JSON.stringify(plugins)

    );

}

/*====================================
 ウィジェット
====================================*/

function loadWidgets(){

    const widgets=

    JSON.parse(

        localStorage.getItem(

            "wikihub_widgets"

        )

    )||[];

    window.widgets=widgets;

}

function addWidget(widget){

    loadWidgets();

    widgets.push(widget);

    localStorage.setItem(

        "wikihub_widgets",

        JSON.stringify(widgets)

    );

}

/*====================================
 権限
====================================*/

function hasPermission(permission){

    const session=getSession();

    if(!session)return false;

    const user=findUser(

        session.username

    );

    if(!user)return false;

    if(user.role==="admin"){

        return true;

    }

    return(

        user.permissions||[]

    ).includes(permission);

}

/*====================================
 下書き
====================================*/

function saveDraft(page){

    const drafts=

    JSON.parse(

        localStorage.getItem(

            "wikihub_drafts"

        )

    )||[];

    drafts.push(page);

    localStorage.setItem(

        "wikihub_drafts",

        JSON.stringify(drafts)

    );

}

function loadDrafts(){

    return JSON.parse(

        localStorage.getItem(

            "wikihub_drafts"

        )

    )||[];

}

/*====================================
 バージョン履歴
====================================*/

function addHistory(pageId,data){

    const history=

    JSON.parse(

        localStorage.getItem(

            "wikihub_history"

        )

    )||[];

    history.push({

        pageId:pageId,

        data:data,

        time:new Date().toISOString()

    });

    localStorage.setItem(

        "wikihub_history",

        JSON.stringify(history)

    );

}

function getHistory(pageId){

    return(

        JSON.parse(

            localStorage.getItem(

                "wikihub_history"

            )

        )||[]

    ).filter(function(item){

        return item.pageId===pageId;

    });

}

/*====================================
 システム情報
====================================*/

function loadSystemInfo(){

    const box=document.getElementById(

        "systemInfo"

    );

    if(!box)return;

    box.innerHTML=

    `
    Version : 0.2<br>
    Storage : localStorage<br>
    Engine : WikiHub Core<br>
    JavaScript : Enabled
    `;

}

/*====================================
 セッション時間
====================================*/

let sessionStart=Date.now();

function updateSessionTime(){

    const label=document.getElementById(

        "sessionTime"

    );

    if(!label)return;

    const sec=Math.floor(

        (Date.now()-sessionStart)/1000

    );

    label.textContent=

    sec+" 秒";

}

setInterval(

    updateSessionTime,

    1000

);

/*====================================
 デバッグ
====================================*/

function debugInfo(){

    console.log(

        "WikiHub Debug"

    );

    console.log(

        "Users",

        users

    );

    console.log(

        "Wikis",

        wikis

    );

    console.log(

        "Plugins",

        window.plugins

    );

}
