var background=chrome.extension.getBackgroundPage();
var tags=$("#tags");
var repos=$("#repos");
var more=$("#more");

chrome.extension.sendMessage({cmd:"getArticleList"},function (response){
	var articals=response.list;
	for (var i = 0; i < articals.length; i++) {

		var d=document.createElement("div");
		d.innerHTML=articals[i];
		document.body.appendChild(document.createElement("br"));
		document.body.appendChild(d);
	};
});

chrome.extension.onMessage.addListener(
	function(request,sender,sendResponse){
		
	});

more.click(function(){
	window.open("home.html");
	// window.open("https://github.com/stars");
});

function getToday(){
	var today=new Date();
	console.log(today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate());
	return today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
};

background.getDataByTime(getToday(),function(result){
	console.log(result);
	var p=$("<p/>");
	var a_author=$("<a/>");
	var a_repo=$("<a/>");
	// p.text(result.author+"/"+result.repo);
	a_author.text(result.author);
	a_author.attr('href',"https://github.com/"+result.author).attr('target',"_blank");
	a_repo.text(result.repo);

	a_repo.attr('href',"https://github.com/"+result.author+"/"+result.repo).attr('target',"_blank");
	p.append(a_author);
	p.append("/")
	p.append(a_repo);
	repos.append(p);
});