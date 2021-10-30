import { SlashCommandBuilder } from "@discordjs/builders"
import { Command } from "./types"
import { logger } from "../logger"

export const command: Command = {
  def: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Replies with server info!"),
  exec: async (interaction) => {
    await interaction.reply(
      `Server name: ${interaction.guild!.name}\nTotal members: ${
        interaction.guild!.memberCount
      }`
    )
    logger.info("Responding with server info")
  },
}
