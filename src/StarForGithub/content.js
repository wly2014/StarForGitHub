var star={
	// author:"author",
	// repo:"repo",
	// tag:"tag",
	// time:"time"
	//desc:""d
};


// <form class="js-toggler-form unstarred js-star-button" //starred js-toggler-form js-unstar-button
//       <button class="btn btn-sm btn-with-count js-toggler-target" aria-label="Star this repository" title="Star andrewrk/node-multiparty" data-ga-click="Repository, click star button, action:files#disambiguate; text:Star">


var star_button=document.getElementsByClassName("js-toggler-form unstarred js-star-button")[0];
console.log(star_button);
if (star_button) {
	star_button.addEventListener("submit",function(){
		console.log("submit_click");

		var url =window.location.href;
		var url_divide=url.split("/");
		console.log(url_divide);

		star.author=url_divide[3];
		star.repo=url_divide[4];
		var date=new Date();
		star.time=date.getFullYear()+"-"+(date.getMonth() + 1)+"-"+date.getDate();
		star.desc=$(".repository-description").text().trim();
		console.log(star);

		var tags=prompt("请添加TAG：",star.repo);
		console.log(tags);
		if (tags==null) {
			star.tag="auto";
			chrome.extension.sendMessage({cmd:"addTAG","star":star});
		}else{
			var tags_div=tags.split(" ");
			for (var i = tags_div.length - 1; i >= 0; i--) {
				star.tag=tags_div[i];
				chrome.extension.sendMessage({cmd:"addTAG","star":star});
				// console.log(star);
			};	
		};
	},false);
};