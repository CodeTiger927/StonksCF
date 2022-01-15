const fs = require("fs")
const users = require("../users.json");

function saveUsers() {
	fs.writeFile("users.json",JSON.stringify(users),(err) => {
		if(err) console.log(err);
		console.log("Saving new user");
	});
}

module.exports = {
    name: 'unverify',
    description: 'unlink your StonksCF account',
    execute(client, msg, params) {
        delete users[msg.author.id];
		msg.reply("You have been successfully unverified")
        saveUsers()
    },
};