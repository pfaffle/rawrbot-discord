require("dotenv").config()

import { Pool, PoolClient } from "pg"
import { logger } from "../logger"

type WithPoolCallback = (client: PoolClient) => Promise<any>
type WithTransactionCallback = (t: TableTransaction) => Promise<any>

class TableTransaction {
  private readonly table: string
  private readonly client: PoolClient

  constructor(table: string, client: PoolClient) {
    this.table = table
    this.client = client
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.query(
      `INSERT INTO ${this.table} (key, value) VALUES ($1::TEXT, $2::TEXT) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
      [key, value]
    )
  }

  async get(key: string): Promise<string | undefined> {
    const resp = await this.client.query(
      `SELECT value FROM ${this.table} WHERE key=$1::TEXT;`,
      [key]
    )
    return resp.rows[0]?.value
  }

  async del(key: string): Promise<void> {
    await this.client.query(`DELETE FROM ${this.table} WHERE key=$1::TEXT;`, [
      key,
    ])
  }

  async begin() {
    await this.client.query(`BEGIN TRANSACTION;`)
  }
  async commit() {
    await this.client.query(`COMMIT;`)
  }
  async rollback() {
    await this.client.query(`ROLLBACK;`)
  }
}

export class KeyValueTable {
  private readonly table: string
  private pool: Pool | null

  constructor(table: string) {
    this.table = table
    this.pool = null
  }

  async init(): Promise<void> {
    const connectionString = process.env.DATABASE_URL || ""
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL must be provided as an environment variable"
      )
    }
    this.pool = new Pool({ connectionString })
    this.pool.on("error", (err: Error) => {
      logger.error("Unexpected error from postgres client", err)
      process.exit(-1)
    })
    await this.withClient(async (client) => {
      await client.query(
        `CREATE TABLE IF NOT EXISTS ${this.table}
           (key TEXT PRIMARY KEY, value TEXT);`
      )
    })
  }

  async set(key: string, value: string): Promise<void> {
    await this.withClient(async (client) => {
      const t = new TableTransaction(this.table, client)
      return await t.set(key, value)
    })
  }

  async get(key: string): Promise<string | undefined> {
    return await this.withClient(async (client) => {
      const t = new TableTransaction(this.table, client)
      return await t.get(key)
    })
  }

  async del(key: string): Promise<void> {
    await this.withClient(async (client) => {
      const t = new TableTransaction(this.table, client)
      await t.del(key)
    })
  }

  async withTransaction(callback: WithTransactionCallback) {
    return await this.withClient(async (client) => {
      const t = new TableTransaction(this.table, client)
      try {
        await t.begin()
        const resp = await callback(t)
        await t.commit()
        return resp
      } catch (err) {
        await t.rollback()
        throw err
      }
    })
  }

  private async withClient(callback: WithPoolCallback) {
    if (!this.pool) {
      throw new Error("init() must be called first!")
    }
    const client = await this.pool.connect()
    try {
      return await callback(client)
    } catch (err) {
      logger.error(err, "Failed to perform db operation")
    } finally {
      client.release()
    }
  }
}
