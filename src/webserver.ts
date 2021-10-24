import express from "express"
import { Server } from "http"
import { AddressInfo } from "net"

const web = express()
let server: Server

web.get("/", function (req, res) {
  res.send("")
})

function start(port: number): Promise<AddressInfo> {
  if (server) {
    throw new Error("Server already started")
  }
  server = web.listen(port)
  return new Promise<AddressInfo>((resolve, reject) => {
    const address = server.address() as AddressInfo
    server.on("listening", () => {
      console.log(`HTTP server listening on port ${address.port}`)
      resolve(address)
    })
    server.on("error", (err) => {
      reject(err)
    })
  })
}

function stop() {
  if (server) {
    server.removeAllListeners()
    server.close()
  }
}

export const webserver = {
  start,
  stop,
}
