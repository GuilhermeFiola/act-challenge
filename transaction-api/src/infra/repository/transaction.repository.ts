import {TransactionEntity} from '../../core/entity/transaction.entity'
import {IWrite} from '../../core/interface/repository/write.interface'
import {BaseRepository} from './base.repository'
import {ErrorHandler} from '../../core/utils/error.handler'

export class TransactionRepository extends BaseRepository implements IWrite<TransactionEntity> {

    private readonly tableName: string = 'transactions'

    constructor(dbName: string) {
        super(dbName)
    }

    async createTableStructure(): Promise<void> {
        try {
            await this.connect()
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                    id VARCHAR(30) NOT NULL PRIMARY KEY,
                    type VARCHAR(1) NOT NULL,
                    description VARCHAR(100) NOT NULL,
                    amount FLOAT NOT NULL,
                    date DATETIME NOT NULL
                )`

            await this.db?.exec(createTableQuery)
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error executing creating table for transaction')
            throw new Error(errorMessage)
        } finally {
            await this.close()
        }
    }

    async create(item: TransactionEntity): Promise<boolean> {
        try {
            await this.connect()
            await this.db?.run(
                `INSERT INTO ${this.tableName} (id, type, description, amount, date) VALUES (:id, :type, :description, :amount, :date)`,
                {
                    ':id': item.id,
                    ':type': item.type,
                    ':description': item.description,
                    ':amount': item.amount,
                    ':date': item.date.toISOString()
                }
            )
            return true
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error creating new transaction')
            throw new Error(errorMessage)
        } finally {
            await this.close()
        }
    }

    async findAll(): Promise<any> {
        try {
            await this.connect()
            return await this.db?.all(
                `SELECT id, type, description, amount, date FROM ${this.tableName}`
            )
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error returning all transactions')
            throw new Error(errorMessage)
        } finally {
            await this.close()
        }
    }
}