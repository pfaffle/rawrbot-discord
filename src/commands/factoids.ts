import { Command } from "./types"
import { SlashCommandBuilder } from "@discordjs/builders"
import { logger } from "../logger"
import { KeyValueTable } from "../lib/db"

export const command: Command = {
  def: new SlashCommandBuilder()
    .setName("factoid")
    .addStringOption((option) =>
      option
        .setName("subject")
        .setDescription("Enter a subject")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("fact")
        .setDescription("Enter an (optional) fact to teach rawrbot")
    )
    .setDescription("Teach rawrbot a factoid, or learn what it knows!"),
  exec: async (interaction) => {
    const subject = interaction.options.getString("subject")
    const fact = interaction.options.getString("fact")
    const db = new KeyValueTable("factoid")
    await db.init()
    if (subject && fact) {
      const existingFact = await db.get(subject)
      if (existingFact) {
        await db.set(subject, `${existingFact} and ${fact}`)
      } else {
        await db.set(subject, fact)
      }
      await interaction.reply("Ok, I'll remember!")
      logger.info(`Remembering fact about '${subject}'`)
    } else {
      const existingFact = await db.get(subject!)
      if (existingFact) {
        await interaction.reply(`${subject} is ${existingFact}`)
      } else {
        await interaction.reply(`I don't know anything about ${subject}`)
      }
      logger.info(`Reporting known facts about '${subject}'`)
    }
  },
}
