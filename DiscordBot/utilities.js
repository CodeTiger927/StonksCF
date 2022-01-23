function saveUsers() {
	fs.writeFile("users.json",JSON.stringify(users),(err) => {
		if(err) console.log(err);
		console.log("Saving new user");
	});
}

function numberWithCommas(x) {
	var parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

function reformNum(number) {
	return numberWithCommas(Math.round(number * 100) / 100);
}

function nameToCode(name) {
	return "[" + name + "](https://codetiger.me/project/StonksCF/explore.html?username=" + name + ")"; 
}

module.exports = { saveUsers, numberWithCommas, reformNum, nameToCode };