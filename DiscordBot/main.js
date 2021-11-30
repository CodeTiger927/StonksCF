require('dotenv').config();
const { Client, Intents, MessageEmbed } = require('discord.js');
const axios = require("axios");
const md5 = require("md5");
const fs = require("fs")
const client = new Client({partials: ["CHANNEL"], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
const users = require("./users.json");
const APIURL = "https://codetiger.me/project/StonksCF/backend/API.php";

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

client.on("ready",() => {
	console.log(`Logged in as ${client.user.tag}!`)
})

client.on("messageCreate",(msg) => {
	var userID = msg.author.id;
	if(msg.content.charAt(0) == '+') {
		let params = msg.content.split(" ");
		// console.log(params);
		if(params[0] == "+verify") {
			// Verify and authenticate account
			if(users[userID] != undefined) {
				msg.reply("You have already been verified as " + users[userID][0] + "!");
				return;
			}
			if(msg.channel.type != 'dm') {
				msg.reply("In order to protect your passwords, please do not verify in public channels. Private message me instead!");
				return;
			}
			if(params.length != 3 && params.length != 4) {
				msg.reply("Please use either\n```+verify [username] [password]```or\n```+verify [username] [encrypted password] md5```to verify your StonksCF account!");
				return;
			}
			var username = params[1];
			var password = params[2];
			if(params.length != 4 || params[4] != "md5") {
				password = md5(password);
			}
			axios.get(APIURL,{"params": {"type":12,"username":username,"password":password}})
			.then((res) => {
				if(res.data.success == 1) {
					users[userID] = [username,password];
					saveUsers();
					axios.get(APIURL,{"params":{"type":5,"username":username}})
					.then((pro) => {
						const userInfo = new MessageEmbed()
						.setColor("#0099FF")
						.setTitle("Account Verification")
						.setURL("https://codetiger.me/project/StonksCF")
						.setDescription("You have been successfully verified as " + nameToCode(username) + "!")
						.addFields(
						{name:'User',value:msg.author.username},
						{name:'Handle',value:username},
						{name:'Networth',value:"$" + pro.data.networth},
						{name:'Rank',value:pro.data.rank + " / " + pro.data.total},
						{name:'Cash',value:"$" + reformNum(pro.data.cash)}
						);
						msg.reply({ embeds: [userInfo] });
					});
				}else{
					msg.reply("Error code " + res.data.success + ": " + res.data.message);
				}
			});
		}else if(params[0] == '+profile') {
			if(params.length != 2 && params.length != 1) {
				msg.reply("Please use the format\n```+profile [username]```");
				return;
			}
			var username;
			if(params.length == 2) {
				username = params[1];
			}else{
				username = users[msg.author.id][0];
				if(username == undefined) {
					msg.reply("Please use the format\n```+profile [username]```");
					return;
				}
			}
			axios.get(APIURL,{"params":{"type":5,"username":username}})
			.then((pro) => {
				if(pro.data.success == 1) {
					const userInfo = new MessageEmbed()
					.setColor("#0099FF")
					.setTitle("Profile Lookup")
					.setURL("https://codetiger.me/project/StonksCF")
					.setDescription("Looking up the profile of " + nameToCode(username) + "!")
					.addFields(
					{name:'Stock price',value:"$" + reformNum(pro.data.price)},
					{name:'QTY Available',value:pro.data.available + ""},
					{name:'Handle',value:username},
					{name:'Networth',value:"$" + reformNum(pro.data.networth)},
					{name:'Rank',value:pro.data.rank + " / " + pro.data.total},
					{name:'Cash',value:"$" + reformNum(pro.data.cash)}
					);
					msg.reply({ embeds: [userInfo] });
				}else{
					msg.reply("Error code " + pro.data.success + ": " + pro.data.message);
				}
			});
		}else if(params[0] == '+holdings') {
			// Holdings
			if(params.length != 2 && params.length != 1) {
				msg.reply("Please use the format\n```+holdings [username]```");
				return;
			}
			var username;
			if(params.length == 2) {
				username = params[1];
			}else{
				username = users[msg.author.id][0];
				if(username == undefined) {
					msg.reply("Please use the format\n```+holdings [username]```");
					return;
				}
			}
			axios.get(APIURL,{"params":{"type":5,"username":username}})
			.then((pro) => {
				if(pro.data.success == 1) {
					results = "Name                      Price   Qt. \n------------------------- ------- ----";
					for(const [user,row] of Object.entries(pro.data["holdings"])) {
						if(row["qty"] != 0) results += "\n" + user.padEnd(25,' ') + ' $' + reformNum(row["currentPrice"]).padEnd(7,' ') + row["qty"];
					}
					const userInfo = new MessageEmbed()
					.setColor("#0099FF")
					.setTitle("Holdings Lookup")
					.setURL("https://codetiger.me/project/StonksCF")
					.setDescription("Looking up the holdings of " + nameToCode(username) + "!")
					.addField("Holdings","```" + results + "```")
					msg.reply({ embeds: [userInfo] });
				}else{
					msg.reply("Error code " + pro.data.success + ": " + pro.data.message);
				}
			});

		}else if(params[0] == '+owners') {
			// Owners
			if(params.length != 2 && params.length != 1) {
				msg.reply("Please use the format\n```+owners [username]```");
				return;
			}
			var username;
			if(params.length == 2) {
				username = params[1];
			}else{
				username = users[msg.author.id][0];
				if(username == undefined) {
					msg.reply("Please use the format\n```+owners [username]```");
					return;
				}
			}
			axios.get(APIURL,{"params":{"type":5,"username":username}})
			.then((pro) => {
				if(pro.data.success == 1) {
					results = "Name                      Qt.  %     \n------------------------- ---- ------";
					for(const [user,row] of Object.entries(pro.data["owners"])) {
						if(row["qty"] != 0) results += "\n" + user.padEnd(26,' ') + reformNum(row["qty"]).padEnd(5,' ') + reformNum(row["qty"] / 10) + "%";
					}
					const userInfo = new MessageEmbed()
					.setColor("#0099FF")
					.setTitle("Owners Lookup")
					.setURL("https://codetiger.me/project/StonksCF")
					.setDescription("Looking up the owners of " + nameToCode(username) + "!")
					.addField("Holdings","```" + results + "```")
					msg.reply({ embeds: [userInfo] });
				}else{
					msg.reply("Error code " + pro.data.success + ": " + pro.data.message);
				}
			});
		}else if(params[0] == '+leaderboard') {
			// Leaderboard
			if(params.length != 1 && params.length != 2) {
				msg.reply("Please use either\n```+leaderboard```or\n```+leaderboard [number between 0-20]```!");
				return;
			}
			var num = 15;
			if(params.length == 2) {
				num = Math.min(20,Math.max(0,parseInt(params[1])));
			}
			axios.get(APIURL,{"params":{"type":1,"num":num}})
			.then((res) => {
				results = "#   Name                      Networth\n--- ------------------------- -----------";
				for(var i = 0;i < res.data.length;++i) {
					results += "\n" + ("" + (i + 1)).padEnd(4,' ') + res.data[i]["name"].padEnd(26,' ') + "$" + reformNum(res.data[i]["networth"]);
				}
				const leaderboardInfo = new MessageEmbed()
				.setColor("#0099FF")
				.setTitle("Leaderboard")
				.setURL("https://codetiger.me/project/StonksCF")
				.setDescription("Looking up the networth leaderboard!")
				.addField("Holdings","```" + results + "```")
				msg.reply({ embeds: [leaderboardInfo] });
			});
		}else if(params[0] == "+buy") {
			// Buy
			if(params.length != 3) {
				msg.reply("Please use the format\n```+buy [stock] [quantity]```");	
				return;
			}
			if(users[msg.author.id] == undefined) {
				msg.reply("You need to be verified first! Use +verify");
				return;
			}
			var username = users[msg.author.id][0];
			var password = users[msg.author.id][1];
			var stock = params[1];
			var quantity = parseInt(params[2]);

			axios.get(APIURL,{"params":{"type":8,"username":username,"password":password,"stock":stock,"qty":quantity}})
			.then((pro) => {
				if(pro.data.success == 1) {
					msg.reply("Successful transaction!");
				}else{
					msg.reply("Error code " + pro.data.success + ": " + pro.data.message);
				}
			});
		}else if(params[0] == "+sell") {
			// Sell
			if(params.length != 3) {
				msg.reply("Please use the format\n```+sell [stock] [quantity]```");	
				return;
			}
			if(users[msg.author.id] == undefined) {
				msg.reply("You need to be verified first! Use +verify");
				return;
			}
			var username = users[msg.author.id][0];
			var password = users[msg.author.id][1];
			var stock = params[1];
			var quantity = -parseInt(params[2]);

			axios.get(APIURL,{"params":{"type":8,"username":username,"password":password,"stock":stock,"qty":quantity}})
			.then((pro) => {
				if(pro.data.success == 1) {
					msg.reply("Successful transaction!");
				}else{
					msg.reply("Error code " + pro.data.success + ": " + pro.data.message);
				}
			});
		}else if(params[0] == "+about") {
			msg.reply("This project is developped by CodeTiger, you can support him or give suggestions by going to the github page https://github.com/CodeTiger927/StonksCF.");
		}else if(params[0] == "+help") {
			// Help
			helpMessage = "A discord bot that helps you trade on StonksCF\n\nStonks:\n";
			helpMessage += "   " + "about".padEnd(14,' ') + "about this bot\n";
			helpMessage += "   " + "verify".padEnd(14,' ') + "link your StonksCF account\n";
			helpMessage += "   " + "profile".padEnd(14,' ') + "get a user's profile\n";
			helpMessage += "   " + "holdings".padEnd(14,' ') + "get a user's holdings\n";
			helpMessage += "   " + "owners".padEnd(14,' ') + "get a user's owners\n";
			helpMessage += "   " + "leaderboard".padEnd(14,' ') + "get the current leaderobard\n";
			helpMessage += "   " + "buy".padEnd(14,' ') + "buy stocks\n";
			helpMessage += "   " + "sell".padEnd(14,' ') + "sell stocks\n";
			helpMessage += "\nNon-categorized:\n"
			helpMessage += "   " + "help".padEnd(14,' ') + "shows this message\n";
			msg.reply("```" + helpMessage + "```")
		}else{
			msg.reply("Unknown command! Type +help to get the list of all available commands");
		}
	}
});

// Verify Buy Sell Profile Owners Holdings Leaderboard
client.login(process.env.TOKEN);