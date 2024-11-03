import * as dotenv from 'dotenv'
import {TransactionRepository} from '../../infra/repository/transaction.repository'
import {TransactionEntity} from '../../core/entity/transaction.entity'
import {MessageBroker} from '../../infra/broker/message.broker'
import {TransactionMessageDto} from '../dto/transaction.message.dto'
import {ErrorHandler} from '../../core/utils/error.handler'

dotenv.config()

export class TransactionService {
    private TRANSACTION_QUEUE = 'transactions'
    private DATABASE: string = process.env.DATABASE ?? ''
    private BROKER_URL: string = process.env.BROKER_URL ?? ''

    private transactionRepository: TransactionRepository
    private messageBroker: MessageBroker

    constructor() {
        this.transactionRepository = new TransactionRepository(this.DATABASE)
        this.messageBroker = new MessageBroker(this.BROKER_URL, this.TRANSACTION_QUEUE)
    }

    async createTransaction(transaction: TransactionEntity): Promise<TransactionEntity> {
        try {
            await this.transactionRepository.create(transaction)
            return transaction
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error creating transaction')
            throw new Error(errorMessage)
        }
    }

    async getAllTransactions(): Promise<Array<TransactionEntity>> {
        try {
            return await this.transactionRepository.findAll()
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error getting all transactions')
            throw new Error(errorMessage)
        }
    }

    async sendTransactionMessage(transaction: TransactionMessageDto) {
        try {
            await this.messageBroker.connect()
            await this.messageBroker.sendToQueue(transaction)
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, `Error sending transaction to queue ${this.TRANSACTION_QUEUE}`)
            throw new Error(errorMessage)
        } finally {
            await this.messageBroker.close()
        }
    }
}