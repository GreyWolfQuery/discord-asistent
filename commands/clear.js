const { SlashCommandBuilder, codeBlock } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Vymaže určený počet zpráv.")
    .addIntegerOption(option =>
      option.setName("messages")
        .setDescription("Počet zpráv (max 100)")
        .setMaxValue(100)
        .setMinValue(1)
        .setRequired(true)),

  async execute(ia)
  {
    const paramMessages = ia.options.get("messages");


    const channel = ia.channel;
    channel.messages.fetch({ limit: paramMessages.value }).then(async messages =>
    {
      const msgCount = messages.size;
      const message = `> **Mažu ${msgCount} zpráv**\n`;
      await ia.reply({ content: message, ephemeral: true });

      var now = 1;
      let percent = 100, progress = 5, progressBar = "=====";
      messages.forEach(msg =>
      {
        msg.delete(1000);

        percent = Math.floor((now / msgCount) * 100);
        progress = Math.floor((percent / 100) * 5);
        progressBar = "=".repeat(progress) + " ".repeat(5 - progress);
        ia.editReply(message + codeBlock(`[${progressBar}] ${percent}% | Smazáno ${now}/${msgCount} zpráv`));
        ++now;
      });
      ia.editReply(message + codeBlock(`[${progressBar}] ${percent}% | Hotovo!`));
    });
  }
};