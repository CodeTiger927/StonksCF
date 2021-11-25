function init() {
	$.post("./backend/API.php",{"type":1,"num":100},function(res) {
		for(var i = 0;i < res.length;++i) {
			$("#leaderboard").append("<tr><td>" + (i + 1) + "</td><td>" + nameToCode(res[i]["name"],res[i]["rating"]) + "</td><td>$" + reformNum(res[i]["networth"]) + "</td></tr>")
		}
	});
}

$(init);