import * as dotenv from 'dotenv'
import {MessageBroker} from '../../infra/broker/message.broker'
import {ConsolidationService} from './consolidation.service'
import {TransactionMapper} from '../../infra/mapper/transaction.mapper'

dotenv.config()

export class TransactionService {
    private TRANSACTION_QUEUE = 'transactions'
    private BROKER_URL: string = process.env.BROKER_URL ?? 'test'
    private messageBroker: MessageBroker
    private consolidationService: ConsolidationService

    constructor() {
        this.messageBroker = new MessageBroker(this.BROKER_URL, this.TRANSACTION_QUEUE)
        this.consolidationService = new ConsolidationService()
    }

    async transactionBroker(): Promise<void> {
        try {
            await this.messageBroker.connect()

            await this.messageBroker.consumeMessages((msg) => {
                if (msg) {
                    try {
                        const messageContent = JSON.parse(msg.content.toString())
                        const transactionDto = TransactionMapper.MapMessageToDto(messageContent)
                        this.consolidationService.updateConsolidation(transactionDto)
                    } catch (error) {
                        // At this point we should control incorrect messages and put in a poison queue or any other structure to be validated later
                        // Here I'm just logging the result to keep the queue going without finishing the app
                        console.error('Error on message received:', error)
                    }
                }
            })
        } catch (error) {
            console.error('Error consuming messages:', error)
        }
    }
}