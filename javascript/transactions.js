function init() {
	$.post("./backend/API.php",{"type":2,"num":100},function(res) {
		for(var i = 0;i < res.length;++i) {
			$("#transactions").append("<tr><td>" + nameToCode(res[i]["buyer"],res[i]["buyerRating"]) + "</td><td>" + nameToCode(res[i]["stock"],res[i]["stockRating"]) + "</td><td>$" + reformNum(res[i]["price"]) + "</td><td>" + Math.abs(res[i]["qty"]) + "</td><td>" + buyOrSell(res[i]["qty"]) + "</td></tr>")
		}
	});

}

$(init);