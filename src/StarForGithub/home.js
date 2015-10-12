
var xmlhttp;
var url1="https://github.com/stars?direction=desc&page=";
var url2="&sort=created";
var background=chrome.extension.getBackgroundPage();
var star={};
var table_name="stars";
var tag=$("#tag");
var repos=$("#repos");
var h;
var a;
var current_page=0;//当前分页显示的页数
var page_count=10;//每页显示的个数
var current_uid_pre;//当前被点击的setting所对应的star.author+"/"+star.repo
var current_tag_count;//当前tag包含的repo数
var current_tag;
var max_pages;

function request(url,callback){
  // console.log(url);
  xmlhttp=new XMLHttpRequest();
  xmlhttp.onreadystatechange=function(){
    // 返回对象的具体状态
    // 0 = uninitialized  // 1 = loading  // 2 = loaded  // 3 = interactive:交互式的  // 4 = complete 
    // xmlhttp 加载完成
    if (xmlhttp.readyState==4)
    {
      //404-->not found  //200-->ok
      // 处理成功
      if (xmlhttp.status==200)
      {
        var doc=$.parseHTML(xmlhttp.responseText,false);
        callback(doc);
      }else{
        alert("处理失败:status-->" + xmlhttp.status);
        remove_loading();
      };
    }else{
      // alert("readyState-->" + xmlhttp.readyState);
    };
  };
  xmlhttp.open("GET",url,true);
  xmlhttp.send(null);

};

function show_loading(){
  $(".github_loading").removeClass("hidden");
};

function remove_loading(){
  $(".github_loading").addClass("hidden");
};

function show_blank()
{
  $(".blank_show").removeClass("hidden");
};

function remove_blank(){
  $(".blank_show").addClass("hidden");
};

function show_data(data_list,data){
  remove_blank();
  var data_item=$("<li class='repo-list-item'><div class='repo-list-setting'><button class='btn btn_setting'><span class='setting'></span>Setting</button></div><h3 class='repo-list-name'><a href='https://github.com/"+data.author+"/"+data.repo+"' target='_Blank'><span class='prefix'>"+data.author+"</span><span class='slash'>/</span>"+data.repo+"</a></h3><p class='repo-list-description'>"+data.desc+"</p><ul class='repo-list-tags'></ul></li>");
  data_list.append(data_item);
};

function refreshButton(){
  if (current_tag_count/page_count>1) {
    $(".paginate-container").removeClass("hidden");
  };
  if (current_page<=0) {
    $(".previous").addClass("disabled");
  }else{
    $(".previous").removeClass("disabled");
  };
  if (current_page>=Math.ceil(current_tag_count/page_count)-1) {
    $(".next").addClass("disabled");
  }else{
    $(".next").removeClass("disabled");
  };
};

function show_tags(_tag){
  var div=$("<div class='tag'>"+_tag+"</div>");
  $(".all_tags").append(div);
};

function check_repos(doc){
  $("#hide").empty();
  $("#hide").append(doc);

  // alert($('title').text());
  if ($('title').text().indexOf("Sign in")>=0) {
    alert("请下确保您的GitHub账户已登录^_^");
    remove_loading();
    return;
  };

  $(".repo-list-item").each(function(){
    var s=$(this).find("h3.repo-list-name > a").attr("href").split("/");
    star.author=s[1];
    star.repo=s[2];
    star.tag="auto";
    star.time="";
    // star.uid=star.author+"/"+star.repo+"_"+;//全局唯一标识符
    star.desc=$(this).find(".repo-list-description").text();
    // console.log(star.desc);
    background.addData(star);

    // console.log(star.author+"/"+star.repo);
  });
  $(".pagination").children().each(function(){
    a=$(this);
    var next=a.text();
    console.log(next);
    if (next=="Next") {
      h=a.attr("href");
      console.log(h);
      if (h) {
        request(h,function(doc){
          check_repos(doc)
        });
      }else{
        console.log("OVER");
        alert("检入成功");
        remove_loading();
      };
    };
  });
};

$(document).ready(function(){
  //显示所有的tags
  background.getAllTags(function(all_tags){
    for (var i = 0; i < all_tags.length; i++) {
      var _tag=all_tags[i];
      // console.log(_tag);
      //向界面上添加tag
      $(".all_tags").removeClass("hidden");
      show_tags(_tag);
    };

  });

  //搜索框回车事件
  $(".filter_input").keydown(function(event){
    if (event.keyCode==13) {
      //界面处理
      $(".repo-list").empty();
      $(".blank_show").addClass("hidden");
      //逻辑处理
      current_tag = $(this).val();
      current_page=0;
      current_tag_count=0;
      
      background.getDataCountOfTag(current_tag,function(max){
        current_tag_count=max;
        max_pages=Math.ceil(current_tag_count/page_count)-1;
        background.getDataByTagBetween(current_tag,current_page*page_count,(current_page+1)*page_count,function(result,index){
          // alert(result.repo);
          //界面处理
          show_data($(".repo-list"),result);
          refreshButton();
        });
        return;
      });
      //未找到时
      refreshButton();
    };
  });

  //检入按钮被点击时
  $("#check").click(function(){
    //逻辑操作
    request(url1+"1"+url2,function(doc){
      check_repos(doc);
    });

    //界面操作
    show_loading();
  });

  //当显示的tags中的tag被点击时
  $(document).on("click",".all_tags .tag",function(){
    //逻辑操作
    // alert($(this).text());
    current_tag=$(this).text();
    current_page=0;
    current_tag_count=0;
    $(".repo-list").empty();
    background.getDataCountOfTag(current_tag,function(max){
      current_tag_count=max;
      max_pages=Math.ceil(current_tag_count/page_count)-1;
      background.getDataByTagBetween(current_tag,current_page*page_count,(current_page+1)*page_count,function(result,index){
        // alert(result.repo);
        //界面处理
        show_data($(".repo-list"),result);
        refreshButton();
      });
    });
  });

  //上翻页点击事件
  $(".previous").click(function(){
    if (current_page==0) {
      return;
    }else{
      //逻辑处理
      current_page=current_page-1;
      $(".repo-list").empty();
      background.getDataByTagBetween(current_tag,current_page*page_count,(current_page+1)*page_count,function(result,index){
          // alert(result.repo);
          //界面处理
          show_data($(".repo-list"),result);
          refreshButton();
      });
      //界面处理
      refreshButton();
    };
  });
  //下翻页点击事件
  $(".next").click(function(){
    if (current_page>=Math.ceil(current_tag_count/page_count)-1) {
      return;
    }else{
      current_page=current_page+1;
      $(".repo-list").empty();
      background.getDataByTagBetween(current_tag,current_page*page_count,(current_page+1)*page_count,function(result,index){
          // alert(result.repo);
          //界面处理
          show_data($(".repo-list"),result);
          refreshButton();
      });
      //界面操作
      refreshButton();
    };
  });
  
  //点击setting
  $(document).on("click",".btn_setting",function(){
    //逻辑处理
    current_uid_pre=$(this).parent().next().find("a").text().replace(/\s/g,"");
    
    // console.log(uid);
    //清空
    $(".main_dialog .tags ul").empty();
    $("#add_tag").val("");

    background.getDataByUidPre(current_uid_pre,function(stars){
        // alert(result);
        //界面操作-->增加TAG
        console.log(stars.length);
        for (var i = stars.length - 1; i >= 0; i--) {
          var new_li=$("<li><div class='tag'><span>"+stars[i].tag+"</span><div class='tag_delete'>X</div></div></li>");
          $(".main_dialog .tags ul").append(new_li);
        };
    });
    //界面处理
    $(".dialog").removeClass("hidden");
  });
  
  //dialog的背景被点击时
  $(".dialog_back").click(function(){
    $(".dialog").addClass("hidden");
  });

  //弹出窗口TAG标签的删除事件
  $(document).on("click",".tag_delete",function(){
    //逻辑处理
    var tag_del=$(this).parent().find("span").text();
    background.deleteDataByUid(current_uid_pre+"_"+tag_del);
    //界面处理    
    $(this).parent().parent().remove();
  });
  
  //OK被点击时
  $(".btn_ok").click(function(){
    //逻辑处理
    var new_tags=$("#add_tag").val();
    if (new_tags.trim()!='') {//判断是否为空
      var tags_div=new_tags.split(" ");

      var star ={};
      background.getDataByUidPre(current_uid_pre,function(stars){
        if (stars.length!=0) {
          star=stars[0];
          var date=new Date();
          star.time=date.getFullYear()+"-"+(date.getMonth() + 1)+"-"+date.getDate();
          for (var i = tags_div.length - 1; i >= 0; i--) {
            // alert(tags_div[i]);
            star.tag=tags_div[i];
            background.addData(star);
          };
        };
      });
    };
    //界面处理
    $(".dialog").addClass("hidden");
  });
});
