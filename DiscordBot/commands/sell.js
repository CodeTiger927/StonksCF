const axios = require("axios");
const users = require("../users.json");
const APIURL = "https://codetiger.me/project/StonksCF/backend/API.php";

module.exports = {
    name: 'sell',
    description: 'sell stocks',
    execute(client, msg, params) {
        // Sell
        if (params.length != 3) {
            msg.reply("Please use the format\n```+sell [stock] [quantity]```");	
            return;
        }
        if (users[msg.author.id] == undefined) {
            msg.reply("You need to be verified first! Use +verify");
            return;
        }
        let username = users[msg.author.id][0];
        let password = users[msg.author.id][1];
        let stock = params[1];
        let quantity = -parseInt(params[2]);

        axios.get(APIURL, {
            "params": {
                "type": 8,
                "username": username,
                "password": password,
                "stock": stock,
                "qty": quantity
            }
        }).then((pro) => {
            if (pro.data.success == 1) {
                msg.reply("Successful transaction!");
            } else {
                msg.reply("Error code " + pro.data.success + ": " + pro.data.message);
            }
        });
    },
};