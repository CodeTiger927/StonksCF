function register() {
	var username = $("#username").val();
	var password = $("#password").val();
	var confirm = $("#confirm").val();
	if(password.length > 255) {
		alert("Your password is a bit too long.");
		return;
	}
	if(password.length == 0) {
		alert("You can't have an empty password");
		return;
	}
	if(password != confirm) {
		alert("It seems like your passwords mismatched");
		return;
	}
	$.post("./backend/API.php",{"type":10,"username":username,"password":password},function(res) {
		if(res["success"] == 1) {
			writeRecord("username",username);
			writeRecord("password",md5(password));
			location.replace("./profile.html")
		}else{
			alert("Error code " + res["success"] + ": " + res["message"]);
		}
	});
}