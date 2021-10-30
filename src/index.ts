require("dotenv").config()
require("newrelic")
const token = process.env.TOKEN
const port = process.env.PORT ? parseInt(process.env.PORT) : 8080
if (!token) {
  throw new Error("TOKEN must be provided as an environment variable")
}
import { client } from "./discord"
import { webserver } from "./webserver"
import { registerCommands } from "./register-commands"

registerCommands()
webserver.start(port)
client.login(token)
// todo check out https://www.npmjs.com/package/discord.js.test
