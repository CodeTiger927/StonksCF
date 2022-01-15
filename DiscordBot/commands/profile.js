const { MessageEmbed } = require('discord.js');
const axios = require("axios");
const users = require("./users.json");
const APIURL = "https://codetiger.me/project/StonksCF/backend/API.php";

module.exports = {
    name: 'profile',
    description: 'get a user\'s profile',
    execute(client, msg, params) {
        if (params.length != 2 && params.length != 1) {
            msg.reply("Please use the format\n```+profile [username]```");
            return;
        }
        let username;
        if (params.length == 2) {
            username = params[1];
        } else {
            if(users[msg.author.id] == undefined) {
                msg.reply("Please use the format\n```+profile [username]```");
            }
            username = users[msg.author.id][0];
        }
        axios.get(APIURL, {
            "params": {
                "type": 5,
                "username": username
            }
        }).then((pro) => {
            if (pro.data.success == 1) {
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
            } else {
                msg.reply("Error code " + pro.data.success + ": " + pro.data.message);
            }
        });
    },
};