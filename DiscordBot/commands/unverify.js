const fs = require("fs")
const users = require("../users.json");
const util = require("../utilities.js")

module.exports = {
    name: 'unverify',
    description: 'unlink your StonksCF account',
    execute(client, msg, params) {
        delete users[msg.author.id];
		msg.reply("You have been successfully unverified")
        util.saveUsers()
    },
};