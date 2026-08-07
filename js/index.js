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
