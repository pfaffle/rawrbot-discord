require("dotenv").config()
const token = process.env.TOKEN
if (!token) {
  throw new Error("TOKEN must be provided as an environment variable")
}
import { Client, Intents } from "discord.js"

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.on("ready", () => {
  console.log(`Logged in as ${client!.user!.tag}!`)
})

client.login(token)
