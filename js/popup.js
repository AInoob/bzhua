var showDataUntil = 10;

function initEvents() {
	$("#update").click(function () {
		var data = $('#theData').val();
		data = convert(data, '\'', '"');
		data = convert(data, '【', '[');
		data = convert(data, '】', ']');
		data = convert(data, '”', '"');
		data = convert(data, '“', '"');
		data = convert(data, '，', ',');
		data = convert(data, '‘', '"');
		data = convert(data, '’', '"');
		console.log(data);
		localStorage.setItem('list', data);
		chrome.runtime.sendMessage({
			job: "update"
		}, function () {});
	});
	$("#reset").click(function () {
		localStorage.setItem('list', "null");
		localStorage.setItem('result', "null");
		display();
	});
	$("#averageBp").change(function () {
		if (this.checked) {
			localStorage.setItem('averageBp', '1');
		}
		else {
			localStorage.setItem('averageBp', '-1');
		}
		display();
	});
	$("#pureData").change(function () {
		if (this.checked) {
			localStorage.setItem('pureData', '1');
		}
		else {
			localStorage.setItem('pureData', '-1');
		}
		display();
	});
	$('#theData').change(function () {
		var data = $('#theData').val();
		data = convert(data, '\'', '"');
		data = convert(data, '【', '[');
		data = convert(data, '】', ']');
		data = convert(data, '”', '"');
		data = convert(data, '“', '"');
		data = convert(data, '，', ',');
		data = convert(data, '‘', '"');
		data = convert(data, '’', '"');
		console.log(data);
		localStorage.setItem('list', data);
	});
}

function convert(data, s, t) {
	while (data.indexOf(s) != -1) {
		data = data.replace(s, t);
	}
	return data;
}

function display() {
	var result;
	if (isValid(localStorage.getItem('result'))) result = JSON.parse(localStorage.getItem('result'));
	else {
		return;
	}
	var list;
	if (isValid(localStorage.getItem('list'))) {
		list = JSON.parse(localStorage.getItem('list'));
	}
	else {
		return;
	}
	if (list == null) {
		list = [];
	}
	if (result != null) {
		var output = "ID\tViews\tDanmu\tCoins\tfav\tComments\tBP\tFans\tSponsers\n";
		var tableOutput = "<tr><th>ID</th><th>Views</th><th>Danmu</th><th>Coins</th><th>fav</th><th>Comments</th><th>BP</th><th>Fans</th><th>Sponsers</th></tr>";
		for (var i = 0; i < list.length; i++) {
			if (Object.prototype.toString.call(list[i]) == '[object Array]') {
				output += list[i][0] + '\t';
			}
			else {
				output += list[i] + '\t';
			}
			output += getO('views', result, list, i);
			output += getO('danmu', result, list, i);
			output += getO('coins', result, list, i);
			output += getO('fav', result, list, i);
			output += getO('comments', result, list, i);
			output += getO('bp', result, list, i);
			output += getO('fans', result, list, i);
			output += getO('chengbao', result, list, i);
			output = output.substr(0, output.length - 1);
			if ((!result) || (!result[getId(list, i)]) || result[getId(list, i)].done == false) {
				output += "inaccurate!";
			}
			output += '\n';
		}
		for (var i = 0; i < list.length; i++) {
			tableOutput += '<tr>';
			if (Object.prototype.toString.call(list[i]) == '[object Array]') {
				tableOutput += '<td>' + list[i][0] + '</td>';
			}
			else {
				tableOutput += '<td>' + list[i] + '</td>';
			}
			tableOutput += getT('views', result, list, i);
			tableOutput += getT('danmu', result, list, i);
			tableOutput += getT('coins', result, list, i);
			tableOutput += getT('fav', result, list, i);
			tableOutput += getT('comments', result, list, i);
			tableOutput += getT('bp', result, list, i);
			tableOutput += getT('fans', result, list, i);
			tableOutput += getT('chengbao', result, list, i);
			if ((!result) || (!result[getId(list, i)]) || result[getId(list, i)].done == false) {
				tableOutput += "<td>inaccurate!</td>";
			}
		}
		tableOutput += '</tr>';
		$('#theResult').val(output);
		$('#theTable').html(tableOutput);
	}
	if (localStorage.getItem("pureData") == '1') {
		$('#theResult').show();
		$('#theTable').hide();
	}
	else {
		$('#theResult').hide();
		$('#theTable').show();
	}
	$('#updateTime').val(localStorage.getItem('updateTime'));
}

function getId(list, i) {
	if (Object.prototype.toString.call(list[i]) == '[object Array]') return list[i][0];
	return list[i];
}

function getT(s, result, list, i) {
	var r = '<td>';
	var x;
	if (Object.prototype.toString.call(list[i]) == '[object Array]') {
		if (result[list[i][0]] == null) return '';
		x = result[list[i][0]][s];
		if (isOn('averageBp') && s == 'bp' && x != null) {
			console.log(x);
			console.log(list[i]['nums']);
			x = parseFloat(x) / parseInt(result[list[i][0]]['nums']);
		}
	}
	else {
		if (result[list[i]] == null) return '';
		x = result[list[i]][s];
	}
	if (x == null) {
		x = "-1";
	}
	r += x;
	r += '</td>';
	return r;
}

function getO(s, result, list, i) {
	var r = '';
	var x;
	if (Object.prototype.toString.call(list[i]) == '[object Array]') {
		if (result[list[i][0]] == null) return '';
		x = result[list[i][0]][s];
		if (isOn('averageBp') && s == 'bp' && x != null) {
			console.log(x);
			console.log(list[i]['nums']);
			x = parseFloat(x) / parseInt(result[list[i][0]]['nums']);
		}
	}
	else {
		if (result[list[i]] == null) return '';
		x = result[list[i]][s];
	}
	if (x == null) {
		x = "-1";
	}
	r += x;
	r += '\t';
	return r;
}

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

function changeRemain(i) {
	$('#remainNumber').val(i);
}
document.addEventListener('DOMContentLoaded', function () {
	if (localStorage.getItem("pureData") == null) {
		localStorage.setItem("pureData", '-1');
	}
	if (localStorage.getItem("averageBp") == null) {
		localStorage.setItem("averageBp", '-1');
	}
	if (!isValid(localStorage.getItem('list')) || JSON.parse(localStorage.getItem('list')) == null) {
		$('#theData').val("");
	}
	else {
		$('#theData').val(localStorage.getItem('list'));
	}
	if (localStorage.getItem("pureData") == '1') {
		$("#pureData").prop("checked", true);
	}
	else {
		$("#pureData").prop("checked", false);
	}
	if (localStorage.getItem("averageBp") == '1') {
		$("#averageBp").prop("checked", true);
	}
	else {
		$("#averageBp").prop("checked", false);
	}
	display();
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.job == "done") {
			changeRemain(0);
			display();
		}
		else if (request.job.indexOf('remaining') != -1) {
			var temp = request.job.match(/remaining\:(\d+)/m)[1];
			changeRemain(temp);
			if (temp <= showDataUntil || showDataUntil < 0) {
				display();
			}
		}
	});
	initEvents();
});

function isOn(t) {
	return localStorage.getItem(t) != '-1';
}