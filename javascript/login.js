function login() {
	var username = $("#username").val();
	var password = md5($("#password").val());
	$.post("./backend/API.php",{"type":12,"username":username,"password":password},function(res) {
		if(res["success"] == 1) {
			writeRecord("username",username);
			writeRecord("password",password);
			location.replace("./profile.html")
		}else{
			alert("Error code " + res["success"] + ": " + res["message"]);
		}
	});
}