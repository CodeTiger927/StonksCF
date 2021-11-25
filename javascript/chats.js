var username = readRecord("username");
var password = readRecord("password");

users = [];

function postComment() {
	validateUser(username,password);
	if(username == undefined) {
		alert("You have not logged in yet!")
		return;
	}
	var content = $("#chats-post-msg").val();
	if(content.length == 0 || content.length > 255) {
		alert("Sorry but your message is nonexistent or too long!");
		return;
	}
	$.post("./backend/API.php",{type:9,"username":username,"password":password,"content":content},function(res) {
		if(res["success"] == 1) {
			alert("Success!");
			location.reload();
		}else{
			alert("Error code " + res["success"] + ": " + res["message"]);
			return;
		}
	});
	return;
}

function displayComment(id,name,time,content) {
	$("#comments").append(`<div class="card comment-post">
					<div class="card-body">
						<div class="row">
							<div class="col-3 chats-avatar">
								<img src=""  id="com-img-` + id + `">
								<div class="chats-username" id="com-name-` + id + `"></div>
							</div>
							<div class="col-9">
								<div class="chats-date">` + time + `</div>
								<div class="chats-content" id="com-` + id + `">
								</div>
							</div>
						</div>
					</div>
				</div>`);
	$("#com-" + id).text(content);
}

function init() {
	$.post("./backend/API.php",{type:7},function(res) {
		for(var i = 0;i < res.length;++i) {
			displayComment(i,res[i]["name"],res[i]["time"],res[i]["content"]);
			users.push(res[i]["name"]);
		}
		$.get("https://codeforces.com/api/user.info?handles=" + users.join(";"),function(res) {
			for(var i = 0;i < users.length;++i) {
				$("#com-name-" + i).html(nameToCode(users[i],res["result"][i]["rating"]));
				$("#com-img-" + i).attr("src",res["result"][i]["avatar"]);
			}
		});
	})
}

$(init);
