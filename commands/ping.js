const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping Pong!"),

  async execute(ia)
  {
    await ia.reply({ content: 'Pong!', ephemeral: true })
  }
};