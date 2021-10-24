import assert from "assert"
import { webserver } from "../src/webserver"
import axios from "axios"

describe("webserver", function () {
  afterEach(() => {
    webserver.stop()
  })
  it("should start up", async function () {
    const address = await webserver.start(0)
    const resp = await axios.get(`http://localhost:${address.port}/`)
    assert.equal(resp.status, 200)
    assert.equal(resp.data, "")
  })
})
