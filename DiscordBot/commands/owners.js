const axios = require("axios");
const users = require("../users.json");
const APIURL = "https://codetiger.me/project/StonksCF/backend/API.php";
const util = require("../utilities.js")

module.exports = {
    name: 'owners',
    description: 'get a user\'s owners',
    execute(client, msg, params) {
        // Owners
        if (params.length != 2 && params.length != 1) {
            msg.reply("Please use the format\n```+owners [username]```");
            return;
        }
        let username;
        if (params.length == 2) {
            username = params[1];
        }else{
            if (users[msg.author.id] == undefined) {
                msg.reply("Please use the format\n```+owners [username]```");
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
                results = "Name                      Qt.  %     \n------------------------- ---- ------";
                for(const [user,row] of Object.entries(pro.data["owners"])) {
                    if(row["qty"] != 0) results += "\n" + user.padEnd(26,' ') + util.reformNum(row["qty"]).padEnd(5,' ') + util.reformNum(row["qty"] / 10) + "%";
                }
                // const userInfo = new MessageEmbed()
                // .setColor("#0099FF")
                // .setTitle("Owners Lookup")
                // .setURL("https://codetiger.me/project/StonksCF")
                // .setDescription("Looking up the owners of " + nameToCode(username) + "!")
                // .addField("Holdings","```" + results + "```")
                // msg.reply({ embeds: [userInfo] });
                msg.reply("```" + results + "```");
            } else {
                msg.reply("Error code " + pro.data.success + ": " + pro.data.message);
            }
        });
    },
};