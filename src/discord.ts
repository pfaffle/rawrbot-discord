import { Client, Intents } from "discord.js"
import { logger } from "./logger"
import { loadCommands } from "./register-commands"

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
client.on("ready", () => {
  logger.info(`Logged in as ${client.user!.tag}!`)
})
client.on("interactionCreate", async (interaction) => {
  const commands = loadCommands()
  if (!interaction.isCommand()) return
  const { commandName } = interaction
  const command = commands.find((command) => command.def.name === commandName)
  if (!command) {
    logger.info(`Ignoring unrecognized command ${commandName}`)
    return
  }
  await command.exec(interaction)
})
