var g_articals=[];
var tag={};
var db;
var db_name="StarForGithub";
var table_name="stars";

var xmlhttp;

// indexedDB.deleteDatabase(db_name);

function openDB (name,version) {
	var request=window.indexedDB.open(name,version);
	request.onerror=function(e){
		console.log("error");
		console.log(e);
	};
	request.onsuccess=function(e){
		db=e.target.result;
		console.log("success!");

	};

	request.onupgradeneeded=function(event){ //onupgradeneeded本身就是一个事务
		db=event.target.result;
		// alert("upgradeneed");
		if(!db.objectStoreNames.contains(table_name)){
			var store=db.createObjectStore(table_name,{keyPath: "uid"});
			store.createIndex("uidIndex","uid",{unique:true});
			store.createIndex("tagIndex","tag",{unique:false});
			store.createIndex("authorIndex","author",{unique:false});
			store.createIndex("timeIndex","time",{unique:false});
		};
	};
};

function addData(star){
  var transaction=db.transaction(table_name,'readwrite'); 
  var store=transaction.objectStore(table_name); 
  star.uid=star.author+"/"+star.repo+"_"+star.tag;//全局唯一标识符uid
  store.add(star);

};

// function getData(callback){
//   console.log("getData");
//   var transaction=db.transaction(storeName,"readonly");
//   var store=transaction.objectStore(storeName);
//   var request=store.get(10);

// 	request.onsuccess=function(event){//异步
// 		var result=event.target.result;
// 		// result="hello";
// 		console.log(result);
// 		callback(result);
// 	};
// };

function getDataByTime(time,callback){
	var transaction=db.transaction(table_name,"readonly");
	var store=transaction.objectStore(table_name);
	var index=store.index("timeIndex");
	var request=index.openCursor(IDBKeyRange.only(time));
	request.onsuccess=function(event){
		var cursor=event.target.result;
		if (cursor) {
			var result=cursor.value;
			console.log(result);
			callback(result);
			cursor.continue();
		};
	};
	request.onerror=function(e){
		console.log(e);
	};
};

function getDataByTag(tag,callback){
	var transaction=db.transaction(table_name,"readonly");
	var store=transaction.objectStore(table_name);
	var index=store.index("tagIndex");
	var i=0;
	index.openCursor(IDBKeyRange.only(tag)).onsuccess=function(event){
		var cursor=event.target.result;
		if (cursor) {
			var result=cursor.value;
			console.log(result);
			callback(result,i);
			i=i+1;
			cursor.continue();
		};
	};
};

function getDataCountOfTag(tag,callback){
	var i=0;
	var transaction=db.transaction(table_name,"readonly");
	var store=transaction.objectStore(table_name);
	var index=store.index("tagIndex");
	index.openCursor(IDBKeyRange.only(tag)).onsuccess=function(event){
		var cursor=event.target.result;
		if (cursor) {
			i=i+1;
			cursor.continue();
		}else{
			callback(i);
	    };
	};
};

function getDataByTagBetween(tag,from,to,_callback){
  getDataByTag(tag,function (result,i){
    if (i>=from&&i<to) {  //[from,to)
      _callback(result);
    };
  });
};

function getDataByUidPre(uid_pre,callback){
	var stars=new Array();
	var transaction=db.transaction(table_name,"readonly");
	var store=transaction.objectStore(table_name);
	var index=store.index("uidIndex");
	var request=index.openCursor();
	request.onsuccess=function(e){
		var cursor=event.target.result;
		if (cursor) {
			var result=cursor.value;
			if (result.uid.indexOf(uid_pre)==0) {//开头
				stars.push(result);
			};
			cursor.continue();
		}else{
			callback(stars);
		};
	};
	request.onerror=function(){
		callback(stars);
	};
};

function deleteDataByUid(uid){
	var transaction=db.transaction(table_name,"readwrite");
	var store=transaction.objectStore(table_name);
	store.delete(uid); 
};

function getAllTags(callback){
	var all_tags=new Array();
	var transaction=db.transaction(table_name,"readonly");
	var store=transaction.objectStore(table_name);
	var index=store.index("tagIndex");
	var request=index.openCursor();
	request.onsuccess=function(event){
		var cursor=event.target.result;
		if (cursor) {
			var tag=cursor.value.tag;
			if (all_tags.indexOf(tag)==-1) {
				all_tags.push(tag);
			};
			cursor.continue();
		}else{
			callback(all_tags);
	    };
	};
	request.onerror=function(e){
		callback(all_tags);
	};
};


       /*----------------------------------------------------*/
       // window.indexedDB.deleteDatabase(db_name);
       openDB(db_name,1);

       chrome.extension.onMessage.addListener(
         function(request, sender, sendResponse) {
          if(request.cmd=='addTAG'){
           console.log("addTAG");
           addData(request.star);


         };
       });

       chrome.browserAction.onClicked.addListener(function() {
	// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	// 	lastTabId = tabs[0].id;
	// 	//chrome.tabs.executeScript(integer tabId, InjectDetails details)
	// 	chrome.tabs.executeScript(lastTabId	, {file: "content.js"}, function() {
		
	// 	});
	// });

     });

// chrome.tabs.onCreated.addListener(function(tab) {
// 		//chrome.tabs.executeScript(integer tabId, InjectDetails details)
// 		console.log(tab.id);

// 		chrome.tabs.executeScript(tab.id, {file: "content.js"});
// 		chrome.browserAction.click();
// 	});

// chrome.tabs.onUpdated.addListener(function(integer tabId, object changeInfo, Tab tab) {...});
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo, tab) {
	// console.log("update");
	if (changeInfo.status=="loading") {
		// console.log("content.js");
		chrome.tabs.executeScript(tabId, {file: 'jquery.min.js'});
		chrome.tabs.executeScript(tabId, {file: "content.js"});
	};

});
