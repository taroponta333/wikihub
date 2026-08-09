/*
====================================
 WikiHub
 auth.js
 共通認証・セッション管理 修正版
====================================
*/

"use strict";


/*==================================
 設定
==================================*/

const AUTH_SESSION_KEY =
    "wikihub_session";

const USERS_KEY =
    "wikihub_users";


/*==================================
 グローバル
==================================*/

let users = [];


/*==================================
 起動
==================================*/

document.addEventListener(
    "DOMContentLoaded",
    initAuth
);


function initAuth(){

    loadUsers();

    repairSession();

    setupIconPreview();

    setupRegister();

    setupLogin();

    setupProfileEditor();

    loadProfile();

    updateHeaderUser();

    setupEditProfileButton();

}


/*==================================
 ユーザー一覧
==================================*/

function loadUsers(){

    try{

        const data =
            localStorage.getItem(
                USERS_KEY
            );


        if(!data){

            users = [];

            return;

        }


        const parsed =
            JSON.parse(data);


        users =
            Array.isArray(parsed)
                ? parsed
                : [];


    }catch(error){

        console.error(
            "ユーザー情報読み込み失敗:",
            error
        );

        users = [];

    }

}


/*==================================
 ユーザー保存
==================================*/

function saveUsers(){

    localStorage.setItem(

        USERS_KEY,

        JSON.stringify(users)

    );

}


/*==================================
 ユーザー検索
==================================*/

function findUser(username){

    if(!username){

        return null;

    }


    return users.find(
        user =>
            String(user.username)
            .toLowerCase() ===
            String(username)
            .toLowerCase()
    ) || null;

}


/*==================================
 IDでユーザー検索
==================================*/

function findUserById(id){

    if(!id){

        return null;

    }


    return users.find(
        user =>
            String(user.id) ===
            String(id)
    ) || null;

}


/*==================================
 UUID
==================================*/

function createUUID(){

    if(
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ){

        return crypto.randomUUID();

    }


    return (
        "user_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2)
    );

}


/*==================================
 セッション取得
==================================*/

function getSession(){

    try{

        const raw =
            localStorage.getItem(
                AUTH_SESSION_KEY
            );


        if(!raw){

            return null;

        }


        const session =
            JSON.parse(raw);


        if(
            !session ||
            typeof session !== "object"
        ){

            return null;

        }


        return session;


    }catch(error){

        console.error(
            "セッション読み込み失敗:",
            error
        );


        return null;

    }

}


/*==================================
 セッション保存
==================================*/

function saveSession(session){

    if(!session){

        return;

    }


    localStorage.setItem(

        AUTH_SESSION_KEY,

        JSON.stringify(session)

    );

}


/*==================================
 現在のユーザー取得
==================================*/

function getCurrentUser(){

    const session =
        getSession();


    if(!session){

        return null;

    }


    /*
     最優先：ユーザーID
    */

    if(session.userId){

        const userById =
            findUserById(
                session.userId
            );


        if(userById){

            return userById;

        }

    }


    /*
     旧方式：id
    */

    if(session.id){

        const userById =
            findUserById(
                session.id
            );


        if(userById){

            return userById;

        }

    }


    /*
     旧方式：username
    */

    if(session.username){

        const userByName =
            findUser(
                session.username
            );


        if(userByName){

            return userByName;

        }

    }


    return null;

}


/*==================================
 セッション修復
==================================*/

function repairSession(){

    const session =
        getSession();


    if(!session){

        return null;

    }


    const user =
        getCurrentUser();


    if(!user){

        console.warn(
            "セッションのユーザーが見つかりません。"
        );

        return null;

    }


    /*
     現在のユーザー情報を
     セッションへ同期
    */

    const repairedSession = {

        loggedIn:true,

        userId:user.id,

        id:user.id,

        username:user.username,

        displayName:
            user.displayName ||
            user.username,

        icon:
            user.icon ||
            "images/default-user.png",

        role:
            user.role ||
            "user",

        login:
            session.login ||
            new Date().toISOString(),

        remember:
            session.remember !== false

    };


    saveSession(
        repairedSession
    );


    return repairedSession;

}


/*==================================
 ログイン状態
==================================*/

function isLogin(){

    return getCurrentUser() !== null;

}


/*==================================
 アイコンプレビュー
==================================*/

function setupIconPreview(){

    const input =
        document.getElementById(
            "iconInput"
        );


    if(!input){

        return;

    }


    input.addEventListener(
        "change",
        function(){

            const file =
                this.files[0];


            if(!file){

                return;

            }


            if(
                !file.type.startsWith(
                    "image/"
                )
            ){

                alert(
                    "画像ファイルを選択してください。"
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(e){

                    const preview =
                        document.getElementById(
                            "iconPreview"
                        );


                    if(preview){

                        preview.src =
                            e.target.result;

                    }

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/*==================================
 アカウント作成
==================================*/

function setupRegister(){

    const button =
        document.getElementById(
            "createAccount"
        );


    if(!button){

        return;

    }


    button.addEventListener(
        "click",
        createAccount
    );

}


/*==================================
 登録
==================================*/

function createAccount(){

    const username =
        document
            .getElementById(
                "username"
            )
            .value
            .trim();


    const displayName =
        document
            .getElementById(
                "displayName"
            )
            .value
            .trim();


    const email =
        document
            .getElementById(
                "email"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "password"
            )
            .value;


    const password2 =
        document
            .getElementById(
                "password2"
            )
            .value;


    const bio =
        document
            .getElementById(
                "bio"
            )
            .value
            .trim();


    const agree =
        document
            .getElementById(
                "agree"
            )
            .checked;


    const preview =
        document.getElementById(
            "iconPreview"
        );


    const icon =
        preview?.src ||
        "images/default-user.png";


    /*------------------------------
      入力チェック
    ------------------------------*/

    if(username === ""){

        alert(
            "ユーザー名を入力してください。"
        );

        return;

    }


    if(password.length < 8){

        alert(
            "パスワードは8文字以上です。"
        );

        return;

    }


    if(password !== password2){

        alert(
            "パスワードが一致しません。"
        );

        return;

    }


    if(!agree){

        alert(
            "利用規約に同意してください。"
        );

        return;

    }


    if(findUser(username)){

        alert(
            "そのユーザー名は使用されています。"
        );

        return;

    }


    /*------------------------------
      ユーザー作成
    ------------------------------*/

    const user = {

        id:
            createUUID(),

        username:
            username,

        displayName:
            displayName ||
            username,

        email:
            email,

        password:
            password,

        bio:
            bio,

        icon:
            icon,

        banner:
            "",

        created:
            new Date().toISOString(),

        role:
            users.length === 0
                ? "owner"
                : "user",

        editCount:
            0,

        articleCount:
            0,

        badges:
            [],

        favorites:
            [],

        settings:{

            theme:
                "light",

            language:
                "ja"

        }

    };


    users.push(
        user
    );


    saveUsers();


    alert(
        "アカウントを作成しました！"
    );


    location.href =
        "login.html";

}


/*==================================
 ログイン設定
==================================*/

function setupLogin(){

    const button =
        document.getElementById(
            "loginButton"
        );


    if(!button){

        return;

    }


    button.addEventListener(
        "click",
        login
    );


    /*
     Enterキーでもログイン
    */

    const password =
        document.getElementById(
            "loginPassword"
        );


    if(password){

        password.addEventListener(
            "keydown",
            function(e){

                if(e.key === "Enter"){

                    e.preventDefault();

                    login();

                }

            }
        );

    }

}


/*==================================
 ログイン
==================================*/

function login(){

    const username =
        document
            .getElementById(
                "loginUsername"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "loginPassword"
            )
            .value;


    const rememberElement =
        document.getElementById(
            "rememberLogin"
        );


    const remember =
        rememberElement
            ? rememberElement.checked
            : true;


    /*------------------------------
      ユーザー確認
    ------------------------------*/

    const user =
        findUser(
            username
        );


    if(!user){

        alert(
            "ユーザーが見つかりません。"
        );

        return;

    }


    /*------------------------------
      パスワード確認
    ------------------------------*/

    if(
        user.password !==
        password
    ){

        alert(
            "パスワードが違います。"
        );

        return;

    }


    /*------------------------------
      共通セッション
    ------------------------------*/

    const session = {

        loggedIn:
            true,

        userId:
            user.id,

        id:
            user.id,

        username:
            user.username,

        displayName:
            user.displayName ||
            user.username,

        icon:
            user.icon ||
            "images/default-user.png",

        role:
            user.role ||
            "user",

        login:
            new Date().toISOString(),

        remember:
            remember

    };


    saveSession(
        session
    );


    /*
     念のため現在ユーザーも保存
    */

    localStorage.setItem(
        "wikihub_currentUser",
        JSON.stringify(user)
    );


    alert(
        "ログインしました！"
    );


    location.href =
        "index.html";

}


/*==================================
 ログアウト
==================================*/

function logout(){

    localStorage.removeItem(
        AUTH_SESSION_KEY
    );


    localStorage.removeItem(
        "wikihub_currentUser"
    );


    location.href =
        "login.html";

}


/*==================================
 プロフィール読み込み
==================================*/

function loadProfile(){

    const user =
        getCurrentUser();


    if(!user){

        /*
         未ログインなら
         プロフィールページでも
         ゲスト表示
        */

        return;

    }


    const profileIcon =
        document.getElementById(
            "profileIcon"
        );


    const displayName =
        document.getElementById(
            "displayName"
        );


    const username =
        document.getElementById(
            "username"
        );


    const bio =
        document.getElementById(
            "bio"
        );


    const articleCount =
        document.getElementById(
            "articleCount"
        );


    const editCount =
        document.getElementById(
            "editCount"
        );


    const createdDate =
        document.getElementById(
            "createdDate"
        );


    const role =
        document.getElementById(
            "role"
        );


    if(profileIcon){

        profileIcon.src =
            user.icon ||
            "images/default-user.png";

    }


    if(displayName){

        displayName.textContent =
            user.displayName ||
            user.username;

    }


    if(username){

        username.textContent =
            "@" +
            user.username;

    }


    if(bio){

        bio.textContent =
            user.bio ||
            "自己紹介がありません。";

    }


    if(articleCount){

        articleCount.textContent =
            Number(
                user.articleCount
            ) || 0;

    }


    if(editCount){

        editCount.textContent =
            Number(
                user.editCount
            ) || 0;

    }


    if(createdDate){

        createdDate.textContent =
            formatDate(
                user.created
            );

    }


    if(role){

        role.textContent =
            user.role ||
            "user";

    }


    /*
     バッジ
    */

    const badgeArea =
        document.getElementById(
            "badgeArea"
        );


    if(badgeArea){

        badgeArea.innerHTML = "";


        const badges =
            Array.isArray(
                user.badges
            )
                ? user.badges
                : [];


        if(badges.length === 0){

            badgeArea.textContent =
                "まだバッジがありません。";

        }else{

            badges.forEach(
                badge => {

                    const div =
                        document.createElement(
                            "div"
                        );


                    div.textContent =
                        badge;


                    badgeArea.appendChild(
                        div
                    );

                }
            );

        }

    }

}


/*==================================
 ヘッダーのユーザー表示
==================================*/

function updateHeaderUser(){

    const session =
        getSession();


    const user =
        getCurrentUser();


    const guestArea =
        document.getElementById(
            "guestArea"
        );


    const userArea =
        document.getElementById(
            "userArea"
        );


    const headerIcon =
        document.getElementById(
            "headerIcon"
        );


    const headerUsername =
        document.getElementById(
            "headerUsername"
        );


    const headerRole =
        document.getElementById(
            "headerRole"
        );


    const sideUserIcon =
        document.getElementById(
            "sideUserIcon"
        );


    const sideUsername =
        document.getElementById(
            "sideUsername"
        );


    const sideRole =
        document.getElementById(
            "sideRole"
        );


    if(
        session &&
        user
    ){

        if(guestArea){

            guestArea.style.display =
                "none";

        }


        if(userArea){

            userArea.style.display =
                "flex";

        }


        if(headerIcon){

            headerIcon.src =
                user.icon ||
                "images/default-user.png";

        }


        if(headerUsername){

            headerUsername.textContent =
                user.displayName ||
                user.username;

        }


        if(headerRole){

            headerRole.textContent =
                user.role ||
                "User";

        }


        if(sideUserIcon){

            sideUserIcon.src =
                user.icon ||
                "images/default-user.png";

        }


        if(sideUsername){

            sideUsername.textContent =
                user.displayName ||
                user.username;

        }


        if(sideRole){

            sideRole.textContent =
                user.role ||
                "User";

        }


    }else{

        if(guestArea){

            guestArea.style.display =
                "block";

        }


        if(userArea){

            userArea.style.display =
                "none";

        }


        if(sideUserIcon){

            sideUserIcon.src =
                "images/default-user.png";

        }


        if(sideUsername){

            sideUsername.textContent =
                "ゲスト";

        }


        if(sideRole){

            sideRole.textContent =
                "Guest";

        }

    }


    setupHeaderMenu();

}


/*==================================
 ヘッダーメニュー
==================================*/

function setupHeaderMenu(){

    const button =
        document.getElementById(
            "headerMenuButton"
        );


    const menu =
        document.getElementById(
            "headerMenu"
        );


    if(
        !button ||
        !menu
    ){

        return;

    }


    /*
     二重登録防止
    */

    if(
        button.dataset.bound ===
        "1"
    ){

        return;

    }


    button.dataset.bound =
        "1";


    button.addEventListener(
        "click",
        function(e){

            e.stopPropagation();


            menu.style.display =
                menu.style.display ===
                "none"
                    ? "block"
                    : "none";

        }
    );


    document.addEventListener(
        "click",
        function(){

            menu.style.display =
                "none";

        }
    );


    menu.addEventListener(
        "click",
        function(e){

            e.stopPropagation();

        }
    );


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if(logoutButton){

        logoutButton.addEventListener(
            "click",
            logout
        );

    }

}


/*==================================
 プロフィール編集
==================================*/

function setupProfileEditor(){

    const saveButton =
        document.getElementById(
            "saveProfile"
        );


    if(!saveButton){

        return;

    }


    const user =
        getCurrentUser();


    if(!user){

        alert(
            "ログインしてください。"
        );

        return;

    }


    const iconPreview =
        document.getElementById(
            "iconPreview"
        );


    const displayName =
        document.getElementById(
            "displayName"
        );


    const email =
        document.getElementById(
            "email"
        );


    const bio =
        document.getElementById(
            "bio"
        );


    const theme =
        document.getElementById(
            "theme"
        );


    if(iconPreview){

        iconPreview.src =
            user.icon ||
            "images/default-user.png";

    }


    if(displayName){

        displayName.value =
            user.displayName ||
            user.username;

    }


    if(email){

        email.value =
            user.email ||
            "";

    }


    if(bio){

        bio.value =
            user.bio ||
            "";

    }


    if(
        theme &&
        user.settings
    ){

        theme.value =
            user.settings.theme ||
            "light";

    }


    saveButton.addEventListener(
        "click",
        function(){

            if(displayName){

                user.displayName =
                    displayName.value.trim() ||
                    user.username;

            }


            if(email){

                user.email =
                    email.value.trim();

            }


            if(bio){

                user.bio =
                    bio.value.trim();

            }


            if(iconPreview){

                user.icon =
                    iconPreview.src ||
                    "images/default-user.png";

            }


            if(theme){

                if(!user.settings){

                    user.settings = {};

                }


                user.settings.theme =
                    theme.value;

            }


            saveUsers();


            /*
             セッションも同期
            */

            const session =
                getSession();


            if(session){

                session.displayName =
                    user.displayName;

                session.icon =
                    user.icon;

                session.role =
                    user.role;

                session.username =
                    user.username;

                session.userId =
                    user.id;

                session.id =
                    user.id;


                saveSession(
                    session
                );

            }


            localStorage.setItem(
                "wikihub_currentUser",
                JSON.stringify(user)
            );


            alert(
                "プロフィールを保存しました！"
            );


            location.href =
                "profile.html";

        }
    );


    const cancelButton =
        document.getElementById(
            "cancelButton"
        );


    if(cancelButton){

        cancelButton.addEventListener(
            "click",
            function(){

                history.back();

            }
        );

    }

}


/*==================================
 日付
==================================*/

function formatDate(value){

    if(!value){

        return "----";

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


    return date.toLocaleDateString(
        "ja-JP"
    );

}

/*==================================
 プロフィール編集ボタン
==================================*/

function setupEditProfileButton(){

    const button =
        document.getElementById(
            "editProfile"
        );

    if(!button){

        return;

    }

    if(
        button.dataset.bound ===
        "1"
    ){

        return;

    }

    button.dataset.bound =
        "1";

    button.addEventListener(
        "click",
        function(){

            const user =
                getCurrentUser();

            if(!user){

                alert(
                    "ログインしてください。"
                );

                location.href =
                    "login.html";

                return;

            }

            /*
             * 編集ページへ移動
             */

            location.href =
                "profile-edit.html";

        }
    );

}

/*==================================
 外部から使えるAPI
==================================*/

window.WikiHubAuth = {

    getSession:
        getSession,

    getCurrentUser:
        getCurrentUser,

    findUserById:
        findUserById,

    isLogin:
        isLogin,

    logout:
        logout,

    repairSession:
        repairSession,

    updateHeaderUser:
        updateHeaderUser

};
