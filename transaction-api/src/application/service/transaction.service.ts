import * as dotenv from 'dotenv'
import {TransactionRepository} from '../../infra/repository/transaction.repository'
import {TransactionEntity} from '../../core/entity/transaction.entity'

dotenv.config()

export class TransactionService {
    private DATABASE: string = process.env.DATABASE ?? '/src/infra/database/db.sqlite'
    private transactionRepository: TransactionRepository

    constructor() {
        this.transactionRepository = new TransactionRepository(this.DATABASE)
    }

    async createTransaction(transaction: TransactionEntity): Promise<TransactionEntity> {
        try {
            await this.transactionRepository.create(transaction)
            return transaction
        } catch (error) {
            let errorMessage = 'Error creating transaction'
            if (error instanceof Error) {
                errorMessage = error.message
            }
            throw new Error(errorMessage)
        }
    }

    async getAllTransactions(): Promise<Array<TransactionEntity>> {
        try {
            return  await this.transactionRepository.findAll()
        } catch (error) {
            let errorMessage = 'Error getting all transactions'
            if (error instanceof Error) {
                errorMessage = error.message
            }
            throw new Error(errorMessage)
        }
    }

}