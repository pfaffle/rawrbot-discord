import { Command } from "./types"
import { SlashCommandBuilder } from "@discordjs/builders"
import { logger } from "../logger"

export const command: Command = {
  def: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  exec: async (interaction) => {
    await interaction.reply("Pong!")
    logger.info("Responding to ping")
  },
}
