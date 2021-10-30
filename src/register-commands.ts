import { Command } from "./commands/types"
import fs from "fs"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import { logger } from "./logger"

export function loadCommands(dir?: string): Command[] {
  const commandsDir = dir || `${__dirname}/commands`
  return fs
    .readdirSync(commandsDir)
    .map((fileName) => `${commandsDir}/${fileName}`)
    .filter((fileName) => fileName.endsWith(".js") || fileName.endsWith(".ts"))
    .map((file) => require(file)?.command as Command)
    .filter((cmd) => !!cmd)
}

// TODO switch to global commands
export function registerCommands() {
  const clientId = process.env.CLIENT_ID
  const guildId = process.env.GUILD_ID
  const token = process.env.TOKEN
  if (!(clientId && guildId && token)) {
    throw new Error(
      "CLIENT_ID, GUILD_ID and TOKEN must be provided as an environment variable"
    )
  }
  const rest = new REST({ version: "9" }).setToken(token!)
  const commands = loadCommands().map((command) => command.def.toJSON())
  rest
    .put(Routes.applicationGuildCommands(clientId!, guildId!), {
      body: commands,
    })
    .then(() => logger.info("Successfully registered application commands."))
    .catch((err) => logger.error(err))
}
