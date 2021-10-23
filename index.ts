require("dotenv").config()
const token = process.env.TOKEN
if (!token) {
  throw new Error("TOKEN must be provided as an environment variable")
}
import { Client, Intents } from "discord.js"

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.on("ready", () => {
  console.log(`Logged in as ${client.user!.tag}!`)
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

client.login(token)
// todo check out https://www.npmjs.com/package/discord.js.test
