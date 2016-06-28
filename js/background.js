var allData={};
var remainNum=0;

document.addEventListener('DOMContentLoaded', function(){
	chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.job == "update"){
			console.log('updating');
			fetchAll();
		}
	});
});


function isValid(str) {
    try {
        JSON.parse(str);
    } catch (e) {
		console.log("invalid String");
        return false;
    }
    return true;
}

function fetchBp(id){
	var url='http://www.bilibili.com/widget/ajaxGetBP?aid='+id.slice(2);
	$.ajax({url:url}).done(function(data){
		var bp=data.bp;
		allData[id].bp=bp;
		remainNum--;
		check();
	}).fail(function(){
		remainNum--;
		check();
	});
}

function fetchAV(id){
	var url='http://api.bilibili.com/x/stat?aid='+id.slice(2);
	$.ajax({
		url: url}).done(function(data){
			var result=data.data;
			allData[id]={
				views:result.in_play+result.out_play,
				danmu:result.dm,
				coins:result.coin,
				comments:result.reply,
				fav:result.fav,
				nums:1
			};
			fetchBp(id);
			check();
		}).fail(function(t){
			remainNum--;
			check();
		});
}

function fetchArray(id){
	allData[id[0]]={views:0,danmu:0,chengbao:0,coins:0,comments:0,bp:0,fans:0,fav:0,nums:id.length-1};
	for(var i=1;i<id.length;i++){
		var tempI=i;
		if(String(id[tempI]).indexOf('av')==-1){
			var url='http://bangumi.bilibili.com/anime/'+id[tempI];
			$.ajax({
				url: url}).done(function(data){
					var views=$('.info-count-item-play',data);
					views=$('em',views).text();
					views=parseBB(views);
					var danmu=$('.info-count-item-review',data);
					danmu=$('em',danmu).text();
					danmu=parseBB(danmu);
					var fans=$('.info-count-item-fans',data);
					fans=$('em',fans).text();
					fans=parseBB(fans);
					allData[id[0]].views+=parseInt(views);
					allData[id[0]].danmu+=parseInt(danmu);
					allData[id[0]].fans+=parseInt(fans);
					var url2='http://bangumi.bilibili.com/sponsor/rankweb/get_sponsor_total?page=1&pagesize=7&season_id='+id[tempI];
					$.ajax({
						url: url2}).done(function(data2){
							var chengbao=data2.result.users;
							allData[id[0]].chengbao+=parseInt(chengbao);
							remainNum--;
							check();
						}).fail(function(){
							console.log("Disconnect?");
							remainNum--;
							check();
						});
				}).fail(function(t){
					remainNum--;
					check();
				});
		}
		else{
			var url='http://api.bilibili.com/x/stat?aid='+id[i].slice(2);
			var url2='http://www.bilibili.com/widget/ajaxGetBP?aid='+id[i].slice(2);
			$.ajax({
				url: url}).done(function(data){
					var result=data.data;
					allData[id[0]].views+=result.in_play+result.out_play;
					allData[id[0]].danmu+=result.dm;
					allData[id[0]].coins+=result.coin;
					allData[id[0]].comments+=result.reply;					
					allData[id[0]].fav+=result.fav;
					$.ajax({
						url: url2}).done(function(data2){
							var bp=data2.bp;
							if(data2.bp!=null){
								bp=parseFloat(bp);
								bp=bp+parseFloat(allData[id[0]].bp);
								bp=bp.toFixed(2);
								allData[id[0]].bp=bp;
							}
							else{
								console.log(data2);
							}
							remainNum--;
							check();
						}).fail(function(){
							console.log("Disconnect?");
							remainNum--;
							check();
					});
				}).fail(function(t){
					remainNum--;
					check();
				});
		}
	}
}

function fetchBig(id){
	var url='http://bangumi.bilibili.com/anime/'+id;
	$.ajax({
		url: url}).done(function(data){
			var views=$('.info-count-item-play',data);
			views=$('em',views).text();
			views=parseBB(views);
			var danmu=$('.info-count-item-review',data);
			danmu=$('em',danmu).text();
			danmu=parseBB(danmu);
			var fans=$('.info-count-item-fans',data);
			fans=$('em',fans).text();
			fans=parseBB(fans);
			allData[id]={views:views,danmu:danmu,fans:fans,nums:1};
			fetchChengbao(id);
		}).fail(function(t){
			remainNum--;
			check();
		});
}

function fetchChengbao(id){
	var url='http://bangumi.bilibili.com/sponsor/rankweb/get_sponsor_total?page=1&pagesize=7&season_id='+id;
	$.ajax({
		url: url}).done(function(data){
			var chengbao=data.result.users;
			allData[id].chengbao=String(chengbao);
			remainNum--;
			check();
		}).fail(function(){
			console.log("Disconnect?");
			remainNum--;
			check();
		});
}

function check(){
	console.log('remaining: '+remainNum);
	if(remainNum==0){
		localStorage.setItem('updateTime',new Date());
		localStorage.setItem('result',JSON.stringify(allData));
		chrome.runtime.sendMessage({job: "done"}, function() {});
	}
	else{
		chrome.runtime.sendMessage({job: "remaining:"+remainNum}, function() {});
	}
}

function parseBB(data){
	data=data.replace('万','0000');
	data=data.replace('千','000');
	if(data.indexOf('.')!=-1){
		data=data.replace('.','');
		data=data.substr(0,data.length-1);
	}
	return parseInt(data);
}

function fetchAll(){
	remainNum=0;
	var list;
	if(isValid(localStorage.getItem("list")))
		list=JSON.parse(localStorage.getItem("list"));
	else{
		return;
	}
	if(list==null){
		console.log("No such data");
		list=[];
	}
	allData={};
	for(var i=0;i<list.length;i++){
		var id=list[i];
		if(Object.prototype.toString.call(id)==='[object Array]'){
			remainNum+=id.length-1;
			fetchArray(id);
		}
		else{
			remainNum++;
			if(String(id).indexOf('av')==-1){
				fetchBig(id);
			}
			else{
				fetchAV(id);
			}
		}
	}
	chrome.runtime.sendMessage({job: "remaining:"+remainNum}, function() {});
}

function isOn(t){
	return localStorage.getItem(t)!='-1';
}
