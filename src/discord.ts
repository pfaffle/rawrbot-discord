import { Client, Intents } from "discord.js"
import { logger } from "./logger"

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
client.on("ready", () => {
  logger.info(`Logged in as ${client.user!.tag}!`)
})
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return

  const { commandName } = interaction

  if (commandName === "ping") {
    await interaction.reply("Pong!")
  } else if (commandName === "server") {
    await interaction.reply(
      `Server name: ${interaction.guild!.name}\nTotal members: ${
        interaction.guild!.memberCount
      }`
    )
  } else if (commandName === "user") {
    await interaction.reply(
      `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
    )
  }
})
