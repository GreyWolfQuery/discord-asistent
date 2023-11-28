const { Client, GatewayIntentBits, Events, REST, Routes, codeBlock } = require('discord.js');
const path = require('path');
const fs = require("fs");

require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, cl =>
{
  console.log(`Running as ${cl.user.tag}`);
});

const commandsHandlers = {};
const buttonsHandlers = {};

function reloadCommands()
{
  console.log("Updating application (/) commands...");
  const commandRegister = [];

  const commandsFolderPath = path.join(__dirname, "commands");
  const commandsFolder = fs.readdirSync(commandsFolderPath);

  for (const file of commandsFolder)
  {
    const filePath = path.join(commandsFolderPath, file);
    const command = require(filePath);

    if (typeof command.data === "object" && typeof command.data.name === "string" && typeof command.execute === "function")
    {
      commandsHandlers[command.data.name] = command;
      commandRegister.push(command.data.toJSON());
    }
    else
    {
      console.warn(`WARNING >> invalid command from file '${file}'`);
    }
  }
  console.log(`Successfully updated ${commandRegister.length} application (/) commands.`);


  console.log("Updating application (/) commands...");

  const buttonsFolderPath = path.join(__dirname, "buttons");
  const buttonsFolder = fs.readdirSync(buttonsFolderPath);

  for (const file of buttonsFolder)
  {
    const filePath = path.join(buttonsFolderPath, file);
    const command = require(filePath);

    if (typeof command.data === "object" && typeof command.data.name === "string" && typeof command.execute === "function")
    {
      buttonsHandlers[command.data.name] = command;
    }
    else
    {
      console.warn(`WARNING >> invalid command from file '${file}'`);
    }
  }
  console.log(`Successfully updated ${commandRegister.length} application (/) commands.`);

  console.log(commandRegister)

  const rest = new REST();

  rest.setToken(process.env.BOT_TOKEN);

  return (async () =>
  {
    try
    {
      console.log(`Refreshing ${commandRegister.length} application (/) commands...`);

      const data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commandRegister },
      );

      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error)
    {
      console.error(error);
    }
  })();
}



client.on(Events.InteractionCreate, async ia =>
{
  if (ia.user.bot || ia.guildId !== process.env.GUILD_ID)
    return;

  if (ia.isButton())
  {
    if (ia.customId.startsWith("get-role-permission-list"))
    {
      const id = ia.customId.split(":")[1];
      if (!id)
      {
        await ia.reply({ content: codeBlock("Chyba"), ephemeral: true });
        return;
      }

      const role = ia.guild.roles.cache.get(id);
      if (!role)
      {
        await ia.reply({ content: codeBlock("Role nenalezena"), ephemeral: true });
        return;
      }

      await ia.reply({ content: `> **Práva role ${role.name}:**\n${codeBlock(role.permissions.toArray().join("\n"))}`, ephemeral: true });
    }
    return;
  }

  if (!ia.isCommand())
    return;

  if (!ia.member.roles.cache.some(r => r.id === process.env.ALLOWED_ROLE_ID))
  {
    ia.reply({ content: "Bohužel nemáš oprávnění používat tohoto bota. :(", ephemeral: true });
    return;
  }

  const cmd = commandsHandlers[ia.commandName] ?? null;


  if (!cmd)
  {
    console.error(`ERROR >> command '${ia.commandName}' is not matching any saved commands`);
    await ia.reply({ content: `> **Chyba!**\n${codeBlock("Příkaz nenalezen.")}`, ephemeral: true });
    return;
  }

  try
  {
    await cmd.execute(ia);
  }
  catch (error)
  {
    console.error(error);
    if (ia.replied || ia.deferred)
    {
      await ia.editReply({ content: '> **Chyba!**', ephemeral: true });
    } else
    {
      await ia.reply({ content: '> **Chyba!**', ephemeral: true });
    }
    await ia.followUp({ content: '```\nNastala chyba během spouštění příkazu!\n```', ephemeral: true });
  }
});

(async function ()
{
  await reloadCommands();
  client.login(process.env.BOT_TOKEN);
})();

module.exports = {
  reloadCommands: reloadCommands
};