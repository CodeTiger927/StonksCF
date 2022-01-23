const { MessageEmbed } = require('discord.js');
const axios = require("axios");
const md5 = require("md5");
const users = require("../users.json");
const APIURL = "https://codetiger.me/project/StonksCF/backend/API.php";
const fs = require('fs');

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

module.exports = {
    name: 'verify',
    description: 'Link your StonksCF account',
    execute(client, msg, params) {
        let userID = msg.author.id;
        // Verify and authenticate account
        if (users[userID] != undefined) {
            msg.reply("You have already been verified as " + users[userID][0] + "!");
            return;
        }
        if (msg.channel.type != 'DM') {
            msg.reply("In order to protect your passwords, please do not verify in public channels. Private message me instead!");
            return;
        }
        if (params.length != 3 && params.length != 4) {
            msg.reply("Please use either\n```+verify [username] [password]```or\n```+verify [username] [encrypted password] md5```to verify your StonksCF account!");
            return;
        }

        let username = params[1];
        let password = params[2];

        if (params.length != 4 || params[4] != "md5") {
            password = md5(password);
        }

        axios.get(APIURL, {
            "params": {
                "type": 12,
                "username": username,
                "password": password
            }
        }).then((res) => {
            if (res.data.success == 1) {
                users[userID] = [username, password];
                saveUsers();
                axios.get(APIURL, {
                    "params": {
                        "type": 5,
                        "username":username
                    }
                }).then((pro) => {
                    const userInfo = new MessageEmbed()
                        .setColor("#0099FF")
                        .setTitle("Account Verification")
                        .setURL("https://codetiger.me/project/StonksCF")
                        .setDescription("You have been successfully verified as " + nameToCode(username) + "!")
                        .addFields(
                            {name:'User', value:msg.author.username},
                            {name:'Handle', value:username},
                            {name:'Networth', value:"$" + pro.data.networth},
                            {name:'Rank', value:pro.data.rank + " / " + pro.data.total},
                            {name:'Cash', value:"$" + reformNum(pro.data.cash)}
                        );

                    msg.reply({ embeds: [userInfo] });
                });

            } else {
                msg.reply("Error code " + res.data.success + ": " + res.data.message);
            }
        });
    },
};