import express from "express"

const web = express()
web.get("/", function (req, res) {
  res.send("")
})

function start(port: number) {
  web.listen(port)
  console.log(`HTTP server listening on port ${port}`)
}

export const webserver = {
  start,
}
