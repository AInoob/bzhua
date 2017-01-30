var allData = {};
var remainNum = 0;
var trialTime = 4;
document.addEventListener('DOMContentLoaded', function () {
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.job == "update") {
			console.log('updating');
			fetchAll();
		}
	});
});

function isValid(str) {
	try {
		JSON.parse(str);
	}
	catch (e) {
		console.log("invalid String");
		return false;
	}
	return true;
}

function fetchBp(id) {
	var url = 'http://www.bilibili.com/widget/ajaxGetBP?aid=' + id.slice(2);
	$.ajax({
		url: url
	}).done(function (data) {
		var bp = data.bp;
		allData[id].bp = bp;
		remainNum--;
		check();
	}).fail(function () {
		allData[id].done = false;
		remainNum--;
		check();
	});
}

function fetchAV(id, trial) {
	var url = 'http://api.bilibili.com/archive_stat/stat?aid=' + id.slice(2);
	$.ajax({
		url: url
	}).done(function (data) {
		if (data == null) {
			if (trial < trialTime) {
				fetchAV(id, trial + 1);
			}
			else {
				allData[id] = {
					done: false
				};
			}
		}
		else {
			var result = data.data;
			allData[id] = {
				views: result.view
				, danmu: result.danmaku
				, coins: result.coin
				, comments: result.reply
				, fav: result.favorite
				, nums: 1
			};
			fetchBp(id);
			check();
		}
	}).fail(function (t) {
		remainNum--;
		allData[id] = {
			done: false
		};
		check();
	});
}

function fetchListAV(id, aid, trial) {
	var url = 'http://api.bilibili.com/archive_stat/stat?aid=' + aid;
	$.ajax({
		url: url
	}).done(function (data) {
		if (data == null) {
			if (trial < trialTime) {
				fetchListAV(id, aid, trial + 1);
			}
			else {
				allData[id] = {
					done: false
				};
			}
		}
		else {
			var result = data.data;
			allData[id].views += result.view;
			allData[id].danmu += result.danmaku;
			allData[id].coins += result.coin;
			allData[id].comments += result.reply;
			allData[id].fav += result.favorite;
			fetchListBp(id, aid, 0);
			check();
		}
	}).fail(function (t) {
		remainNum--;
		allData[id] = {
			done: false
		};
		check();
	});
}

function fetchListBp(id, aid, trial) {
	var url = 'http://www.bilibili.com/widget/ajaxGetBP?aid=' + aid;
	$.ajax({
		url: url
	}).done(function (data) {
		if (data == null) {
			if (trial < trailTime) {
				fetchListAV(id, aid, trial + 1);
			}
			else {
				allData[id] = {
					done: false
				};
			}
		}
		else {
			var bp = data.bp;
			if (bp != null) {
				bp = parseFloat(bp);
				bp = bp + parseFloat(allData[id].bp);
				bp = bp.toFixed(2);
				allData[id].bp = bp;
			}
			else {
				console.log(data);
			}
			remainNum--;
			check();
		}
	}).fail(function (t) {
		remainNum--;
		allData[id] = {
			done: false
		};
		check();
	});
}

function fetchArray(id) {
	allData[id[0]] = {
		views: 0
		, danmu: 0
		, chengbao: 0
		, coins: 0
		, comments: 0
		, bp: 0
		, fans: 0
		, fav: 0
		, nums: id.length - 1
	};
	for (var i = 1; i < id.length; i++) {
		var tempI = i;
		if (String(id[tempI]).indexOf('av') == -1) {
			var url = 'http://bangumi.bilibili.com/anime/' + id[tempI];
			$.ajax({
				url: url
			}).done(function (data) {
				var views = $('.info-count-item-play', data);
				views = $('em', views).text();
				views = parseBB(views);
				var danmu = $('.info-count-item-review', data);
				danmu = $('em', danmu).text();
				danmu = parseBB(danmu);
				var fans = $('.info-count-item-fans', data);
				fans = $('em', fans).text();
				fans = parseBB(fans);
				allData[id[0]].views += parseInt(views);
				allData[id[0]].danmu += parseInt(danmu);
				allData[id[0]].fans += parseInt(fans);
				var url2 = 'http://bangumi.bilibili.com/sponsor/rankweb/get_sponsor_total?page=1&pagesize=7&season_id=' + id[tempI];
				$.ajax({
					url: url2
				}).done(function (data2) {
					var chengbao = data2.result.users;
					allData[id[0]].chengbao += parseInt(chengbao);
					remainNum--;
					check();
				}).fail(function () {
					console.log("Disconnect?");
					allData[id[0]].done = false;
					remainNum--;
					check();
				});
			}).fail(function (t) {
				allData[id[0]].done = false;
				remainNum--;
				check();
			});
		}
		else {
			fetchListAV(id[0], id[i].slice(2), 0);
		}
	}
}

function fetchBig(id) {
	var url = 'http://bangumi.bilibili.com/anime/' + id;
	$.ajax({
		url: url
	}).done(function (data) {
		var views = $('.info-count-item-play', data);
		views = $('em', views).text();
		views = parseBB(views);
		var danmu = $('.info-count-item-review', data);
		danmu = $('em', danmu).text();
		danmu = parseBB(danmu);
		var fans = $('.info-count-item-fans', data);
		fans = $('em', fans).text();
		fans = parseBB(fans);
		allData[id] = {
			views: views
			, danmu: danmu
			, fans: fans
			, nums: 1
		};
		fetchChengbao(id);
	}).fail(function (t) {
		remainNum--;
		allData[id] = {
			done: false
		};
		check();
	});
}

function fetchChengbao(id) {
	var url = 'http://bangumi.bilibili.com/sponsor/rankweb/get_sponsor_total?page=1&pagesize=7&season_id=' + id;
	$.ajax({
		url: url
	}).done(function (data) {
		var chengbao = data.result.users;
		allData[id].chengbao = String(chengbao);
		remainNum--;
		check();
	}).fail(function () {
		console.log("Disconnect?");
		remainNum--;
		allData[id].done = false;
		check();
	});
}

function check() {
	console.log('remaining: ' + remainNum);
	if (remainNum == 0) {
		localStorage.setItem('updateTime', new Date());
		localStorage.setItem('result', JSON.stringify(allData));
		chrome.runtime.sendMessage({
			job: "done"
		}, function () {});
	}
	else {
		localStorage.setItem('result', JSON.stringify(allData));
		chrome.runtime.sendMessage({
			job: "remaining:" + remainNum
		}, function () {});
	}
}

function parseBB(data) {
	data = data.replace('亿', '00000000');
	data = data.replace('万', '0000');
	data = data.replace('千', '000');
	if (data.indexOf('.') != -1) {
		data = data.replace('.', '');
		data = data.substr(0, data.length - 1);
	}
	return parseInt(data);
}

function fetchAll() {
	remainNum = 0;
	var list;
	if (isValid(localStorage.getItem("list"))) list = JSON.parse(localStorage.getItem("list"));
	else {
		return;
	}
	if (list == null) {
		console.log("No such data");
		list = [];
	}
	allData = {};
	for (var i = 0; i < list.length; i++) {
		var id = list[i];
		if (Object.prototype.toString.call(id) === '[object Array]') {
			remainNum += id.length - 1;
			fetchArray(id);
		}
		else {
			remainNum++;
			if (String(id).indexOf('av') == -1) {
				fetchBig(id);
			}
			else {
				fetchAV(id, 0);
			}
		}
	}
	chrome.runtime.sendMessage({
		job: "remaining:" + remainNum
	}, function () {});
}

function isOn(t) {
	return localStorage.getItem(t) != '-1';
}