const { ButtonBuilder, ActionRowBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, codeBlock } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clone_role")
    .setDescription("Tento příkaz naklonuje roli se všema právama.")
    .addRoleOption(option =>
      option.setName("zdroj")
        .setDescription("Role, která se má duplikovat")
        .setRequired(true))
    .addStringOption(option =>
      option.setName("jmeno")
        .setDescription("Jméno nově vytvořené role")
        .setRequired(true)),

  async execute(ia)
  {
    await ia.reply("> **Klonuji roli...**");

    const paramSrcRole = ia.options.get("zdroj");
    const paramName = ia.options.get("jmeno");
    if (!paramSrcRole || !paramName)
      throw "Příkaz nemá dostatek parametrů";

    const srcRole = paramSrcRole.role;
    const permissions = srcRole.permissions.toArray();

    const newRole = await ia.guild.roles.create({
      name: paramName.value,
      color: "#" + srcRole.color.toString(16),
      permissions: permissions
    });

    const button = new ButtonBuilder()
      .setCustomId(`get-role-permission-list:${newRole.id}`)
      .setLabel(`Zobrazit oprávnění role ${newRole.name}`)
      .setStyle(2);

    const row = new ActionRowBuilder()
      .addComponents(button);

    await ia.editReply({
      content: `> **Hotovo!**\n**Zdrojová role:**\n${codeBlock(`${srcRole.name}\n${srcRole.id}`)}\n**Nová role:**\n${codeBlock(`${newRole.name}\n${newRole.id}`)}`,
      components: [row]
    });
  }
};