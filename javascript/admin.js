function openMarket() {
	var adminPassword = $("#adminPassword").val();
	$.post("./backend/API.php",{"type":14,"action":1,"adminPassword":adminPassword},function(res) {
		if(res["success"]) {
			alert("Successfully opened the market!");
		}
	});
}

function closeMarket() {
	var adminPassword = $("#adminPassword").val();
	$.post("./backend/API.php",{"type":14,"action":0,"adminPassword":adminPassword},function(res) {
		if(res["success"]) {
			alert("Successfully closed the market!");
		}
	});
}

function updateAnnouncement() {
	var adminPassword = $("#adminPassword").val();
	var announcement = $("#announcementInput").val();
	$.post("./backend/API.php",{"type":13,"adminPassword":adminPassword,"announcement":announcement},function(res) {
		if(res["success"]) {
			alert("Successfully updated the announcement!");
		}
	});
}

function recalculate() {
	var adminPassword = $("#adminPassword").val();
	$.post("./backend/API.php",{"type":11,"adminPassword":adminPassword},function(res) {
		if(res["success"]) {
			alert("Successfully recalculated and updated everything!");
		}
	});
}