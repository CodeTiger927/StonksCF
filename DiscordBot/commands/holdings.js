const axios = require("axios");
const users = require("../users.json");
const APIURL = "https://codetiger.me/project/StonksCF/backend/API.php";

module.exports = {
    name: 'holdings',
    description: 'get a user\'s holdings',
    execute(client, msg, params) {
        // Holdings
        if (params.length != 2 && params.length != 1) {
            msg.reply("Please use the format\n```+holdings [username]```");
            return;
        }
        let username;
        if ( params.length == 2) {
            username = params[1];
        } else {
            if (users[msg.author.id] == undefined) {
                msg.reply("Please use the format\n```+holdings [username]```");
                return;
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
                results = "Name                      Price   Qt. \n------------------------- ------- ----";
                for (const [user,row] of Object.entries(pro.data["holdings"])) {
                    if(row["qty"] != 0) results += "\n" + user.padEnd(25,' ') + ' $' + reformNum(row["currentPrice"]).padEnd(7,' ') + row["qty"];
                }
                // const userInfo = new MessageEmbed()
                // .setColor("#0099FF")
                // .setTitle("Holdings Lookup")
                // .setURL("https://codetiger.me/project/StonksCF")
                // .setDescription("Looking up the holdings of " + nameToCode(username) + "!")
                // .addField("Holdings","```" + results + "```")
                // msg.reply({ embeds: [userInfo] });
                msg.reply("```" + results + "```");
            } else {
                msg.reply("Error code " + pro.data.success + ": " + pro.data.message);
            }
        });
    },
};