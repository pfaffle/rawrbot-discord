import fs from "fs"
import os from "os"
import { loadCommands } from "../src/register-commands"
import assert from "assert"

const templateCommand = `
const { SlashCommandBuilder } = require('${__dirname}/../node_modules/@discordjs/builders')

module.exports = {
  command: {
    def: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with pong!"),
    exec: async (interaction) => {
      await interaction.reply("Pong!")
    }
  },
}
`

let baseDir: string

function writeTestFile(path: string, content: string) {
  fs.writeFileSync(path, content)
  return path
}

function createCommands(fileNames: string[], content: string) {
  return fileNames.map((file) => writeTestFile(`${baseDir}/${file}`, content))
}

describe("register-commands", () => {
  beforeEach(() => {
    baseDir = fs.mkdtempSync(`${os.tmpdir()}/`)
  })
  afterEach(() => {
    fs.rmdirSync(baseDir, { recursive: true })
  })
  it("loads commands", async () => {
    createCommands(["cmd1.js", "cmd2.js"], templateCommand)
    const commands = loadCommands(baseDir)
    let recordedReply: string
    const mockInteraction: any = {
      reply: (msg: string) => {
        recordedReply = msg
      },
    }
    assert.equal(commands.length, 2)
    await Promise.all(
      commands.map(async (command) => {
        assert.equal(command.def.name, "ping")
        assert.equal(command.def.description, "Replies with pong!")
        await command.exec(mockInteraction)
        assert.equal(recordedReply, "Pong!")
      })
    )
  })

  it("ignores malformed commands", async () => {
    createCommands(["command.js"], templateCommand)
    createCommands(["notCommand.js"], "const foo = 'bar'")
    const commands = loadCommands(baseDir)
    let recordedReply: string
    const mockInteraction: any = {
      reply: (msg: string) => {
        recordedReply = msg
      },
    }
    assert.equal(commands.length, 1)
    const command = commands[0]
    assert.equal(command.def.name, "ping")
    assert.equal(command.def.description, "Replies with pong!")
    await command.exec(mockInteraction)
    // @ts-ignore
    assert.equal(recordedReply, "Pong!")
  })
})
