function init() {

	$.post("./backend/API.php",{"type":1,"num":10},function(res) {
		for(var i = 0;i < res.length;++i) {
			$("#leaderboard").append("<tr><td>" + (i + 1) + "</td><td>" + nameToCode(res[i]["name"],res[i]["rating"]) + "</td><td>$" + reformNum(res[i]["networth"]) + "</td></tr>")
		}
	});

	$.post("./backend/API.php",{"type":3,"num":5},function(res) {
		for(var i = 0;i < res.length;++i) {
			$("#hottest").append("<tr><td>" + nameToCode(res[i]["name"],res[i]["rating"]) + "</td><td>$" + reformNum(res[i]["price"]) + "</td><td>" + res[i]["hotness"] + "</td></tr>")
		}
	});

	$.post("./backend/API.php",{"type":2,"num":3},function(res) {
		for(var i = 0;i < res.length;++i) {
			$("#transactions").append("<tr><td>" + nameToCode(res[i]["buyer"],res[i]["buyerRating"]) + "</td><td>" + nameToCode(res[i]["stock"],res[i]["stockRating"]) + "</td><td>$" + reformNum(res[i]["price"]) + "</td><td>" + Math.abs(res[i]["qty"]) + "</td><td>" + buyOrSell(res[i]["qty"]) + "</td></tr>")
		}
	});

	$.post("./backend/API.php",{"type":4},function(res) {
		$("#announcements").append(res[0])
	});
}

$(init);