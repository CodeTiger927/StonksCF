function ratingToColor(rating) {
	if(rating >= 2400) {
		return 'red';
	}else if(rating >= 2100) {
		return 'rgb(255,140,0)';
	}else if(rating >= 1900) {
		return 'rgb(170,0,170)';
	}else if(rating >= 1600) {
		return 'blue';
	}else if(rating >= 1400) {
		return 'rgb(3,168,158)';
	}else if(rating >= 1200) {
		return 'green';
	}else if(rating >= 1000) {
		return 'rgb(136,204,34)';
	}else{
		return 'gray';
	}
}

function nameToCode(name,rating) {
	return "<a style='text-decoration: none;font-weight: 550;color: " + ratingToColor(rating) + "' href='explore.html?username=" + name + "'>" + name + "</a>";
}

function numberWithCommas(x) {
	var parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

function reformNum(number) {
	return numberWithCommas(Math.round(number * 100) / 100);
}

function buyOrSell(qty) {
	if(qty > 0) return '<label class="badge badge-success">Buy</label>';
		return '<label class="badge badge-danger">Sell</label>';
}

function shortenTime(time) {
	return time.substr(2,time.length - 2 - 3);
}

function writeRecord(name,value) {
    window.localStorage.setItem(name,value);
}

function readRecord(name) {
    return window.localStorage.getItem(name);
}

function validateUser(username,password) {
	if(username == undefined || password == undefined) {
		alert("You need to login first!");
		writeRecord("username","");
		writeRecord("password","");
		location.replace("./login.html")
	}
	$.post("./backend/API.php",{"type":12,"username":username,"password":password},function(res) {
		if(res["success"] != 1) {
			alert("You need to login first!");
			writeRecord("username","");
			writeRecord("password","");
			location.replace("./login.html")
		}
	});
}

function getParam(name){
	if(name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search)) return decodeURIComponent(name[1]);
}