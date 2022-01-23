const { MessageEmbed } = require('discord.js');
const axios = require("axios");
const APIURL = "https://codetiger.me/project/StonksCF/backend/API.php";

module.exports = {
    name: 'leaderboard',
    description: 'get the current leaderobard',
    execute(client, msg, params) {
        // Leaderboard
        if (params.length != 1 && params.length != 2) {
            msg.reply("Please use either\n```+leaderboard```or\n```+leaderboard [number between 0-20]```!");
            return;
        }
        let num = 15;
        if (params.length == 2) {
            num = Math.min(20,Math.max(0,parseInt(params[1])));
        }
        axios.get(APIURL, {
            "params": {
                "type": 1,
                "num": num
            }
        }).then((res) => {
            results = "#   Name                      Networth\n--- ------------------------- -----------";
            for (let i = 0;i < res.data.length;++i) {
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
    },
};