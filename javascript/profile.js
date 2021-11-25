var username = readRecord("username");
var password = readRecord("password");
validateUser(username,password);

$("#usernameBold").text(username);

var labels = [];
var data = {
	labels: labels,
	datasets: [{
		label: 'Net worth',
		backgroundColor: 'rgb(0, 71, 171)',
		borderColor: 'rgb(0, 71, 171)',
		data: [],
		fill: false
	}]
};

var config = {
	type: 'line',
	data: data,
	options: {plugins: {
		legend: {
		display: false
		}
	}}
};

var marketOpen = false;

function init() {
	$.post("./backend/API.php",{"type":5,"username":username},function(res) {
		for(var i = 0;i < res["changes"].length;++i) {
			labels.push(res["changes"][i]["time"].split(" ")[0]);
			data.datasets[0].data.push(res["changes"][i]["value"]);
		}
		const changeChart = new Chart(document.getElementById('changeChart'),config);
		$("#networth").text("$" + reformNum(res["networth"]));
		var change = 0;
		if(res["changes"].length > 1) {
			change = (res["changes"][res["changes"].length - 1].value - res["changes"][res["changes"].length - 2].value) / res["changes"][res["changes"].length - 2].value * 100;
		}
		if(change >= 0) {
			$("#growth").text("+" + reformNum(change) + "%");
		}else{
			$("#growth").text(reformNum(change) + "%");
		}
		$("#cash").text("$" + reformNum(res["cash"]));
		$("#cfvalue").text("$" + reformNum(res["price"]));
		$("#rank").text("#" + res["rank"] + " / " + res["total"]);

		marketOpen = res["open"];
		if(marketOpen) {
			$("#openclose").addClass("alert-success");
			$("#openclose").html("The Market is <b>OPEN</b> right now!");
			$("#btnBuySell").removeAttr("disabled");
		}else{
			$("#openclose").addClass("alert-danger");
			$("#openclose").html("The Market is <b>CLOSED</b> right now!");
		}
		for(const [user,row] of Object.entries(res["holdings"])) {
            if(row["qty"] == 0) continue;
			$("#holdings").append("<tr><td>" + nameToCode(user,row["rating"]) + "</td><td>$" + reformNum(row["currentPrice"]) + "</td><td>$" + reformNum(row["purchasePrice"]) + "</td><td>" + Math.abs(row["qty"]) + "</td></tr>");
		}
		for(const [user,row] of Object.entries(res["owners"])) {
			if(row["qty"] == 0) continue;
			$("#owners").append("<tr><td>" + nameToCode(user,row["rating"]) + "</td><td>" + row["qty"] + "</td><td>$" + reformNum(row["qty"] * res["price"]) + "</td><td>" + reformNum(100 * row["qty"] / 1000) + "%</td></tr>");
		}

		for(var i = res["history"].length - 1;i >= 0;--i) {
			$("#history").append("<tr><td>" + nameToCode(res["history"][i]["stock"],res["history"][i]["rating"]) + "</td><td>" + shortenTime(res["history"][i]["tradeTime"]) + "</td><td>$" + reformNum(res["history"][i]["price"]) + "</td><td>" + Math.abs(res["history"][i]["qty"]) + "</td><td>" + buyOrSell(res["history"][i]["qty"]) + "</td></tr>")
		}
	});

}

function trade() {
	var stock = $("#usernameBuySell").val();
	var quantity = parseInt($("#quantityBuySell").val()) * $("#actionBuySell").val();
	$.post("./backend/API.php",{"type":8,"username":username,"password":password,"stock":stock,"qty":quantity},function(res) {
		if(res["success"] == 1) {
			alert("Success!");
			location.reload();
		}else{
			alert("Error code " + res["success"] + ": " + res["message"]);
		}
	});
}

$(init);