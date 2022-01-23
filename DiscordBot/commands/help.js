module.exports = {
    name: 'help',
    description: 'lists available commands',
    execute(client, msg, params) {
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
        helpMessage += "   " + "unverify".padEnd(14,' ') + "unlink your StonksCF account\n";
        helpMessage += "\nNon-categorized:\n"
        helpMessage += "   " + "help".padEnd(14,' ') + "shows this message\n";
        msg.reply("```" + helpMessage + "```")
    },
};