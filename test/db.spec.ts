require("dotenv").config()
import { KeyValueTable } from "../src/lib/db"
import { Pool } from "pg"
import assert from "assert/strict"

let pool: Pool
const tableName = "test"

describe("db code", () => {
  before(async () => {
    const connectionString = process.env.DATABASE_URL || ""
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL must be provided as an environment variable"
      )
    }
    pool = new Pool({ connectionString })
  })
  beforeEach(async () => {
    await pool.query(`DROP TABLE IF EXISTS ${tableName};`)
  })
  after(async () => {
    await pool.end()
  })

  describe("basic operations", () => {
    it("throws an error if not initialized", async () => {
      const db = new KeyValueTable(tableName)
      assert.rejects(() => db.get(""), Error, "init() must be called first!")
    })

    it("creates a table", async () => {
      const db = new KeyValueTable(tableName)
      await db.init()
      const res = await pool.query(`SELECT *
                                    from ${tableName};`)
      assert.equal(res.rowCount, 0)
      const fields = res.fields.map((field) => ({
        name: field.name,
        dataType: field.format,
      }))
      assert.deepEqual(fields, [
        { name: "key", dataType: "text" },
        { name: "value", dataType: "text" },
      ])
    })

    it("sets and gets a new value", async () => {
      const db = new KeyValueTable(tableName)
      await db.init()
      await db.set("foo", "bar")
      const value = await db.get("foo")
      assert.equal(value, "bar")
    })

    it("replaces an existing key", async () => {
      const db = new KeyValueTable(tableName)
      await db.init()
      await db.set("foo", "bar")
      await db.set("foo", "baz")
      const value = await db.get("foo")
      assert.equal(value, "baz")
    })

    it("returns undefined when getting a nonexistent key", async () => {
      const db = new KeyValueTable(tableName)
      await db.init()
      const value = await db.get("")
      assert.equal(value, undefined)
    })

    it("deletes a key", async () => {
      const db = new KeyValueTable(tableName)
      await db.init()
      await db.set("foo", "bar")
      let value = await db.get("foo")
      assert.equal(value, "bar")
      await db.del("foo")
      value = await db.get("foo")
      assert.equal(value, undefined)
    })
  })

  describe("grouped operations with withTransaction", () => {
    it("updates a series of keys", async () => {
      const db = new KeyValueTable(tableName)
      await db.init()
      await db.withTransaction(async (t) => {
        await t.set("foo1", "bar")
        await t.set("foo2", "baz")
      })
      const value1 = await db.get("foo1")
      assert.equal(value1, "bar")
      const value2 = await db.get("foo2")
      assert.equal(value2, "baz")
    })

    it("updates a key using its existing value", async () => {
      const db = new KeyValueTable(tableName)
      await db.init()
      await db.withTransaction(async (t) => {
        await t.set("foo", "bar")
        const current = await t.get("foo")
        await t.set("foo", `${current} and baz`)
      })
      const value = await db.get("foo")
      assert.equal(value, "bar and baz")
    })

    it("deletes a key", async () => {
      const db = new KeyValueTable(tableName)
      await db.init()
      await db.withTransaction(async (t) => {
        await t.set("foo", "bar")
      })
      let value = await db.get("foo")
      assert.equal(value, "bar")
      await db.withTransaction(async (t) => {
        await t.del("foo")
      })
      value = await db.get("foo")
      assert.equal(value, undefined)
    })
  })
})
