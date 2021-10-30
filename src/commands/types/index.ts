import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export type Command = {
  def: SlashCommandBuilder
  exec: (interaction: CommandInteraction) => Promise<void>
}
