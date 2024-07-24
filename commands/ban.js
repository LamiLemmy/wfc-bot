const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { fcToPid, makeRequest, makeUrl, sendEmbedLog, validateFc } = require("../utils.js");


function p(count, str) {
    if (count == 1)
        return str;

    return str + "s";
};

module.exports = {
    modOnly: true,

    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user")
        .addStringOption(option => option.setName("friend-code")
            .setDescription("friend code to ban")
            .setRequired(true))
        .addStringOption(option => option.setName("reason")
            .setDescription("ban reason")
            .setRequired(true))
        .addStringOption(option => option.setName("hidden-reason")
            .setDescription("ban reason only visible to moderators"))
        .addNumberOption(option => option.setName("days")
            .setDescription("ban days length"))
        .addNumberOption(option => option.setName("hours")
            .setDescription("ban hours length"))
        .addNumberOption(option => option.setName("minutes")
            .setDescription("ban minutes length"))
        // .addBooleanOption(option =>
        //     option.setName("tos")
        //         .setDescription("tos violation (ban from entire service), default false"))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    exec: async function(interaction) {
        var fc = interaction.options.getString("friend-code", true);
        fc = fc.trim();

        if (!validateFc(fc)) {
            await interaction.reply({ content: `Error banning friend code "${fc}": Friend code is not in the correct format` });
            return;
        }

        var pid = fcToPid(fc);
        var reason = interaction.options.getString("reason", true);
        var reason_hidden = interaction.options.getString("hidden-reason") ?? null;
        var days = interaction.options.getNumber("days") ?? 0;
        var hours = interaction.options.getNumber("hours") ?? 0;
        var minutes = interaction.options.getNumber("minutes") ?? 0;

        var perm = false;
        if (hours + minutes + days == 0) {
            // Perm ban lol
            perm = true;
            // A normal person lives about 31000 days
            days = 100000;
        }

        var url = makeUrl("ban", `&pid=${pid}&reason=${reason}&reason_hidden=${reason_hidden}&days=${days}&hours=${hours}&minutes=${minutes}&tos=true`);

        if (makeRequest(interaction, fc, url)) {
            sendEmbedLog(interaction, "ban", fc, [
                { name: "Ban Length", value: perm ? "Permanent" : `${days} ${p(days, "day")}, ${hours} ${p(hours, "hour")}, ${minutes} ${p(minutes, "minute")}` },
                { name: "Reason", value: reason },
                { name: "Hidden Reason", value: reason_hidden ?? "None" }]
            );
        }
    }
};