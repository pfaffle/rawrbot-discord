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

async function start() {
  registerCommands()
  await webserver.start(port)
  await client.login(token)
}
start()
