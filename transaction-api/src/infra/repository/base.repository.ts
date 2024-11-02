import {Database, open} from 'sqlite'
import sqlite3 from 'sqlite3'

export abstract class BaseRepository {
    protected db: Database | undefined
    protected readonly dbName: string

    constructor(dbName: string) {
        this.dbName = dbName
    }

    async openDb(): Promise<void> {
        this.db = await open({
            filename: this.dbName,
            driver: sqlite3.Database
        })
    }

    async closeDb(): Promise<void> {
        await this.db?.close()
    }
}