import {TransactionEntity} from '../../core/entity/transaction.entity'
import {IWrite} from '../../core/interface/repository/write.interface'
import {BaseRepository} from './base.repository'

export class TransactionRepository extends BaseRepository implements IWrite<TransactionEntity> {

    private readonly tableName: string = 'transactions'

    constructor(dbName: string) {
        super(dbName)
    }

    async createTableStructure(): Promise<void> {
        try {
            await this.openDb()
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                    id VARCHAR(30) NOT NULL PRIMARY KEY,
                    type VARCHAR(1) NOT NULL,
                    description VARCHAR(100) NOT NULL,
                    amount FLOAT NOT NULL,
                    date DATETIME NOT NULL
                )`

            const test = await this.db?.exec(createTableQuery)
            console.log(test)
        } catch (error) {
            let errorMessage = 'Error executing creating table for transaction'
            if (error instanceof Error) {
                errorMessage = error.message
            }
            throw new Error(errorMessage)
        } finally {
            await this.closeDb()
        }
    }

    async create(item: TransactionEntity): Promise<any> {
        try {
            await this.openDb()
            return await this.db?.run(
                `INSERT INTO ${this.tableName} (id, type, description, amount, date) VALUES (:id, :type, :description, :amount, :date)`,
                {
                    ':id': item.id,
                    ':type': item.type,
                    ':description': item.description,
                    ':amount': item.amount,
                    ':date': item.date.toISOString()
                }
            )
        } catch (error) {
            let errorMessage = 'Error creating new transaction'
            if (error instanceof Error) {
                errorMessage = error.message
            }
            throw new Error(errorMessage)
        } finally {
            await this.closeDb()
        }
    }

    async findAll(): Promise<any> {
        try {
            await this.openDb()
            return await this.db?.get(
                `SELECT id, type, description, amount, date FROM ${this.tableName}`
            )
        } catch (error) {
            let errorMessage = 'Error returning all transactions'
            if (error instanceof Error) {
                errorMessage = error.message
            }
            throw new Error(errorMessage)
        } finally {
            await this.closeDb()
        }
    }
}