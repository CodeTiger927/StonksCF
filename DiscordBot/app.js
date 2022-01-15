require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({partials: ["CHANNEL"], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
const fs = require('fs');

client.on("ready",() => {
	fs.readdir('./commands/', (_err, files) => {
		files.forEach((file) => {
			if (!file.endsWith('.js')) return;
			let command = require(`./commands/${file}`); // access all details though this variable
			client.commands.set(command.name, command);
			// console.log(`👌 Command loaded: ${command.name}`);
		});
	});
	console.log(`Logged in as ${client.user.tag}!`)
})

client.on("messageCreate", (msg) => {
	if (msg.content.charAt(0) == '+') {
		let params = msg.content.split(" ");
		let commandName = params[0].toLowerCase();
		let cmd = client.commands.get(commandName);

		if (cmd) {
			cmd.execute(client, msg, params);
		} else {
			msg.reply("Unknown command! Type +help to get the list of all available commands");
		}
	}
});

// Verify Buy Sell Profile Owners Holdings Leaderboard
client.login(process.env.TOKEN);