import { SlashCommandBuilder } from "@discordjs/builders"
import { Command } from "./types"
import { logger } from "../logger"

export const command: Command = {
  def: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with user info!"),
  exec: async (interaction) => {
    await interaction.reply(
      `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
    )
    logger.info("Responding with user info")
  },
}
