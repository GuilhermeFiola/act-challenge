import {TransactionMessageDto} from '../../application/dto/transaction.message.dto'

export class TransactionMapper {
    static MapMessageToDto(message: any): TransactionMessageDto {
        this.validateDto(message)
        return <TransactionMessageDto> {
            type: message.type,
            amount: message.amount,
            date: message.date
        }
    }

    static validateDto(message: any): void {
        if(!message) {
            throw new Error('Invalid transaction message object')
        }
        if(!message.type) {
            throw new Error('Invalid transaction type message object')
        }
        if(!message.amount) {
            throw new Error('Invalid transaction amount message object')
        }
        if(!message.date) {
            throw new Error('Invalid transaction amount message object')
        }
    }
}