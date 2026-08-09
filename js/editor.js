/*
========================================
 WikiHub
 editor.js
 Part3-7a ～ Part3-7c
 編集・保存対応版
========================================
*/

"use strict";

let editor;
let preview;
let info;
let autoSaveTimer=null;
let historyStack=[];
let historyIndex=-1;

const editorParams=new URLSearchParams(location.search);
const editMode=editorParams.get("edit")==="1";
const editPageId=editorParams.get("id");

document.addEventListener("DOMContentLoaded",init);

function init(){
    editor=document.getElementById("editor");
    preview=document.getElementById("preview");
    info=document.getElementById("editorInfo");
    if(!editor)return;

    if(editMode && editPageId) loadPageForEdit();
    else loadCurrentPage();

    setupEditor();
    setupImageDrop();
    setupTemplateButtons();
    setupPreviewButton();
    setupTabInput();
    updatePreview();
    updateInfo();
}

/*========================================
 編集対象取得
========================================*/
function getPageForEdit(){
    if(!editMode || !editPageId)return null;

    let wikis=[];
    try{wikis=JSON.parse(localStorage.getItem("wikihub_wikis"))||[];}
    catch(e){console.error("Wikiデータ読み込み失敗",e);return null;}

    const currentWikiId=localStorage.getItem("wikihub_currentWiki");
    let wiki=wikis.find(w=>String(w.id)===String(currentWikiId));

    if(!wiki){
        for(const w of wikis){
            if(!Array.isArray(w.pages))continue;
            if(w.pages.some(p=>String(p.id)===String(editPageId))){
                wiki=w;
                break;
            }
        }
    }

    if(!wiki || !Array.isArray(wiki.pages))return null;

    const page=wiki.pages.find(p=>String(p.id)===String(editPageId));
    if(!page)return null;

    return {wiki,page};
}

function loadPageForEdit(){
    const result=getPageForEdit();
    if(!result){
        alert("編集する記事が見つかりません。");
        return;
    }

    const {wiki,page}=result;
    localStorage.setItem("wikihub_currentWiki",String(wiki.id));
    localStorage.setItem("wikihub_currentPage",String(page.id));

    const title=document.getElementById("pageTitleInput");
    const category=document.getElementById("pageCategory");
    const tags=document.getElementById("pageTags");
    const heading=document.getElementById("editorTitle");

    if(title)title.value=page.title||"";
    if(editor)editor.value=page.content||"";
    if(category)category.value=page.category||"";
    if(tags)tags.value=Array.isArray(page.tags)?page.tags.join(", "):page.tags||"";
    if(heading)heading.textContent="✏️ 記事を編集";
}

/*========================================
 セッション
========================================*/
function getSession(){
    const keys=["wikihub_session","wikihub_currentUser","currentUser","session"];
    for(const key of keys){
        try{
            const raw=localStorage.getItem(key);
            if(!raw)continue;
            const data=JSON.parse(raw);
            if(data)return data;
        }catch(e){console.warn("セッション解析失敗:",key,e);}
    }
    return null;
}

function getSessionUsername(){
    const s=getSession();
    if(!s)return "guest";
    return s.username||s.userName||s.name||s.displayName||"guest";
}

function getSessionUserId(){
    const s=getSession();
    if(!s)return null;
    return s.id||s.userId||s.uid||null;
}

function checkSession(){
    const s=getSession();
    if(!s){
        alert("ログイン情報を取得できません。\nログインし直してください。");
        return false;
    }
    return true;
}

function getEditorUser(){
    const s=getSession();
    if(!s)return {id:null,username:"guest"};
    return {
        id:s.id||s.userId||s.uid||null,
        username:s.username||s.userName||s.name||s.displayName||"guest"
    };
}

/*========================================
 現在ページ読込
========================================*/
function loadCurrentPage(){
    let page=null;
    try{page=JSON.parse(localStorage.getItem("wikihub_editPage"));}catch(e){}

    if(!page){
        const wikiId=localStorage.getItem("wikihub_currentWiki");
        const pageId=localStorage.getItem("wikihub_currentPage");
        try{
            const wikis=JSON.parse(localStorage.getItem("wikihub_wikis"))||[];
            const wiki=wikis.find(w=>String(w.id)===String(wikiId));
            if(wiki&&Array.isArray(wiki.pages))page=wiki.pages.find(p=>String(p.id)===String(pageId))||null;
        }catch(e){console.warn("現在ページの読み込み失敗",e);}
    }

    if(!page)return;

    const title=document.getElementById("pageTitleInput");
    const category=document.getElementById("pageCategory");
    const tags=document.getElementById("pageTags");
    if(title)title.value=page.title||"";
    if(editor)editor.value=page.content||"";
    if(category)category.value=page.category||"";
    if(tags)tags.value=Array.isArray(page.tags)?page.tags.join(", "):page.tags||"";
}

/*========================================
 Toast
========================================*/
function showToast(message,type="info",duration=2500){
    const old=document.getElementById("wikihub-toast");
    if(old)old.remove();
    const toast=document.createElement("div");
    toast.id="wikihub-toast";
    toast.textContent=message;
    Object.assign(toast.style,{
        position:"fixed",left:"50%",bottom:"30px",transform:"translateX(-50%)",
        zIndex:"99999",padding:"12px 22px",borderRadius:"10px",fontSize:"15px",
        fontWeight:"bold",boxShadow:"0 4px 15px rgba(0,0,0,.25)",color:"#fff"
    });
    toast.style.background=type==="success"?"#28a745":type==="error"?"#dc3545":type==="warning"?"#f0ad4e":"#2870d8";
    document.body.appendChild(toast);
    setTimeout(()=>{
        if(!toast.isConnected)return;
        toast.style.opacity="0";
        toast.style.transition="opacity .3s";
        setTimeout(()=>{if(toast.isConnected)toast.remove();},300);
    },duration);
}

/*========================================
 エディター
========================================*/
function setupEditor(){
    saveHistory();
    editor.addEventListener("input",()=>{
        updatePreview();
        updateInfo();
        autoSave();
        saveHistory();
    });
}

function updatePreview(){
    if(!preview||!editor)return;
    let html="";
    try{html=parseWiki(editor.value);}catch(e){html=editor.value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
    preview.innerHTML=parseFiles(html);
}

function updateInfo(){
    if(!info||!editor)return;
    const text=editor.value;
    info.innerHTML=`文字数：${text.length}<br>行数：${text.split("\n").length}`;
}

function autoSave(){
    clearTimeout(autoSaveTimer);
    autoSaveTimer=setTimeout(()=>{
        localStorage.setItem("wikihub_draft",editor.value);
        console.log("Draft Saved");
    },1000);
}

/*========================================
 保存
========================================*/
document.addEventListener("keydown",e=>{
    if(e.ctrlKey&&e.key.toLowerCase()==="s"){
        e.preventDefault();
        savePage();
    }
});

document.addEventListener("DOMContentLoaded",()=>{
    const save=document.getElementById("savePage");
    if(save)save.addEventListener("click",savePage);
});

function savePage(){
    if(!checkSession())return;

    if(typeof loadWikis!=="function"||typeof saveWikis!=="function"){
        showToast("Wiki保存システムが読み込まれていません。","error");
        return;
    }

    loadWikis();

    const wikiID=localStorage.getItem("wikihub_currentWiki");
    const pageID=editMode&&editPageId?String(editPageId):String(localStorage.getItem("wikihub_currentPage")||"");
    const wiki=wikis.find(w=>String(w.id)===String(wikiID));

    if(!wiki){
        showToast("Wikiが見つかりません。","error");
        return;
    }

    if(!Array.isArray(wiki.pages))wiki.pages=[];

    let page=wiki.pages.find(p=>String(p.id)===String(pageID));

    if(editMode&&!page){
        showToast("編集する記事が見つかりません。","error");
        return;
    }

    if(!page){
        page={
            id:typeof createPageID==="function"?createPageID():crypto.randomUUID(),
            title:"新しいページ",content:"",
            created:new Date().toISOString(),updated:new Date().toISOString(),
            category:"",tags:[],history:[]
        };
        wiki.pages.push(page);
    }

    const titleInput=document.getElementById("pageTitleInput");
    const categoryInput=document.getElementById("pageCategory");
    const tagsInput=document.getElementById("pageTags");
    const title=titleInput?titleInput.value.trim():"";
    const content=editor?editor.value:"";
    const category=categoryInput?categoryInput.value.trim():"";
    const tagsText=tagsInput?tagsInput.value:"";

    if(!title){
        showToast("タイトルを入力してください。","warning");
        if(titleInput)titleInput.focus();
        return;
    }

    const tags=tagsText.split(",").map(t=>t.trim()).filter(Boolean);

    if(!Array.isArray(page.history))page.history=[];
    page.history.push({
        date:new Date().toISOString(),
        content:content,
        title:title,
        editor:getSessionUsername()
    });

    page.title=title;
    page.content=content;
    page.category=category;
    page.tags=tags;
    page.updated=new Date().toISOString();
    if(!page.author)page.author=getSessionUsername();

    if(!wiki.statistics)wiki.statistics={pages:0,files:0,edits:0,members:1};
    wiki.statistics.pages=wiki.pages.length;
    wiki.statistics.edits=Number(wiki.statistics.edits||0)+1;

    saveWikis();

    localStorage.setItem("wikihub_currentPage",String(page.id));
    localStorage.setItem("wikihub_currentWiki",String(wiki.id));
    localStorage.setItem("wikihub_editPage",JSON.stringify(page));
    localStorage.removeItem("wikihub_draft");

    showToast(editMode?"記事を更新しました！":"記事を保存しました！","success");

    setTimeout(()=>{
        location.href="wiki.html?id="+encodeURIComponent(page.id);
    },700);
}

/*========================================
 新しいページ
========================================*/
function createNewPage(){
    loadWikis();
    const wiki=wikis.find(w=>String(w.id)===String(localStorage.getItem("wikihub_currentWiki")));
    if(!wiki){showToast("Wikiが見つかりません。","error");return;}
    if(!Array.isArray(wiki.pages))wiki.pages=[];

    const page={
        id:typeof createPageID==="function"?createPageID():crypto.randomUUID(),
        title:"新しいページ",content:"",
        created:new Date().toISOString(),updated:new Date().toISOString(),
        category:"",tags:[],history:[]
    };
    wiki.pages.push(page);
    saveWikis();
    localStorage.setItem("wikihub_currentPage",String(page.id));
    location.reload();
}

/*========================================
 削除
========================================*/
function deleteCurrentPage(){
    if(!confirm("このページを削除しますか？"))return;
    loadWikis();
    const wiki=wikis.find(w=>String(w.id)===String(localStorage.getItem("wikihub_currentWiki")));
    if(!wiki)return;
    const id=localStorage.getItem("wikihub_currentPage");
    wiki.pages=(wiki.pages||[]).filter(p=>String(p.id)!==String(id));
    if(!wiki.statistics)wiki.statistics={pages:0,files:0,edits:0,members:1};
    wiki.statistics.pages=wiki.pages.length;
    saveWikis();
    localStorage.removeItem("wikihub_currentPage");
    location.href="wiki.html";
}

/*========================================
 履歴
========================================*/
function openHistory(){
    loadWikis();
    const wiki=wikis.find(w=>String(w.id)===String(localStorage.getItem("wikihub_currentWiki")));
    if(!wiki)return;
    const page=(wiki.pages||[]).find(p=>String(p.id)===String(localStorage.getItem("wikihub_currentPage")));
    if(!page)return;
    console.table(page.history||[]);
}

/*========================================
 Tab / Undo / Redo
========================================*/
function setupTabInput(){
    if(!editor)return;
    editor.addEventListener("keydown",function(e){
        if(e.key!=="Tab")return;
        e.preventDefault();
        const start=this.selectionStart,end=this.selectionEnd;
        this.value=this.value.substring(0,start)+"    "+this.value.substring(end);
        this.selectionStart=this.selectionEnd=start+4;
    });
}

function saveHistory(){
    if(!editor)return;
    if(historyStack[historyStack.length-1]===editor.value)return;
    if(historyIndex<historyStack.length-1)historyStack=historyStack.slice(0,historyIndex+1);
    historyStack.push(editor.value);
    historyIndex=historyStack.length-1;
    if(historyStack.length>100){historyStack.shift();historyIndex--;}
}

document.addEventListener("keydown",e=>{
    if(e.ctrlKey&&e.key.toLowerCase()==="z"){e.preventDefault();undo();}
    if(e.ctrlKey&&e.key.toLowerCase()==="y"){e.preventDefault();redo();}
});

function undo(){
    if(historyIndex<=0)return;
    historyIndex--;
    editor.value=historyStack[historyIndex];
    updatePreview();updateInfo();
}

function redo(){
    if(historyIndex>=historyStack.length-1)return;
    historyIndex++;
    editor.value=historyStack[historyIndex];
    updatePreview();updateInfo();
}

/*========================================
 画像ドラッグ＆ドロップ
========================================*/
function setupImageDrop(){
    if(!editor)return;
    editor.addEventListener("dragover",e=>e.preventDefault());
    editor.addEventListener("drop",e=>{
        e.preventDefault();
        const file=e.dataTransfer.files[0];
        if(!file)return;
        if(!file.type.startsWith("image/")){alert("画像のみ追加できます。");return;}
        const reader=new FileReader();
        reader.onload=event=>{
            insertText("\n[[File:"+file.name+"]]\n");
            saveLocalImage(file.name,event.target.result);
        };
        reader.readAsDataURL(file);
    });
}

function saveLocalImage(name,data){
    let files=[];
    try{files=JSON.parse(localStorage.getItem("wikihub_files"))||[];}catch(e){}
    const existing=files.find(file=>file.name===name);
    if(existing){existing.data=data;existing.created=new Date().toISOString();}
    else files.push({id:crypto.randomUUID(),name,type:"image",data,created:new Date().toISOString()});
    localStorage.setItem("wikihub_files",JSON.stringify(files));
}

/*========================================
 テンプレート
========================================*/
function setupTemplateButtons(){
    const templates={
        infobox:`{{Infobox\n|タイトル=\n|画像=\n|説明=\n}}`,
        quote:`> 引用文`,
        code:"```javascript\n\n```",
        table:`{| class="wikitable"\n|-\n!項目\n!内容\n|-\n|A\n|B\n|}`
    };
    window.insertTemplate=function(type){
        if(templates[type])insertText(templates[type]);
    };
}

function insertText(text){
    if(!editor)return;
    const start=editor.selectionStart,end=editor.selectionEnd;
    editor.setRangeText(text,start,end,"end");
    editor.focus();
    updatePreview();updateInfo();
}

/*========================================
 プレビュー切替
========================================*/
function setupPreviewButton(){
    const button=document.getElementById("previewButton");
    if(!button)return;
    button.onclick=()=>{preview.hidden=!preview.hidden;};
}

/*========================================
 Fileタグ
========================================*/
function parseFiles(html){
    let files=[];
    try{files=JSON.parse(localStorage.getItem("wikihub_files"))||[];}catch(e){}
    files.forEach(file=>{
        html=html.replaceAll(
            "[[File:"+file.name+"]]",
            `<img src="${file.data}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:10px 0;">`
        );
    });
    return html;
}

/*========================================
 オートリカバリー
========================================*/
window.addEventListener("beforeunload",()=>{
    if(editor)localStorage.setItem("wikihub_recovery",editor.value);
});

function restoreRecovery(){
    const draft=localStorage.getItem("wikihub_recovery");
    if(!draft)return;
    if(confirm("前回の編集内容を復元しますか？")){
        editor.value=draft;
        updatePreview();updateInfo();
    }
}
