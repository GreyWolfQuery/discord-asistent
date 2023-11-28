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
    await ia.deferReply({ ephemeral: true });
    const paramMessages = ia.options.get("messages");

    const channel = ia.channel;
    channel.messages.fetch({ limit: paramMessages.value }).then(async messages =>
    {
      const msgCount = messages.size;

      if (msgCount === 0)
      {
        ia.editReply("> **Není co smazat**")
        return;
      }

      const message = `> **Mazání ${msgCount} zpráv...**\n`;

      await ia.editReply({ content: message, ephemeral: true });
      ia.channel.send(`> **<@${ia.user.id}> nechal smazat ${msgCount} zpráv.**`);

      var now = 0;
      const progressStr = "█", progressMax = 7;
      let percent = 100, progress = progressMax, progressBar = progressStr.repeat(progress);

      await (new Promise((resolve) =>
      {
        messages.forEach(async msg =>
        {
          await msg.delete(100);
          ++now;

          percent = Math.floor((now / msgCount) * 100);
          progress = Math.floor((percent / 100) * progressMax);
          progressBar = progressStr.repeat(progress) + " ".repeat(progressMax - progress);
          ia.editReply(message + codeBlock(`${progressBar} ${percent}% | Smazáno ${now}/${msgCount} zpráv`));
          if (now >= msgCount)
            resolve();
        });
      }));

      ia.editReply(message + codeBlock(`${progressBar} ${percent}% | Hotovo`));
    });
  }
};