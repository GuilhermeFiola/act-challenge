import {TransactionRequestDto} from '../../application/dto/transaction.request.dto'
import {TransactionEntity} from '../../core/entity/transaction.entity'
import {TransactionMessageDto} from '../../application/dto/transaction.message.dto'
import {TransactionResponseDto} from '../../application/dto/transaction.response.dto'
import {TransactionType} from '../../core/utils/constants'

export class TransactionMapper {
    static MapRequestDtoToEntity(dto: TransactionRequestDto): TransactionEntity {
        this.validateRequestDto(dto)
        const type: TransactionType = dto.type === TransactionType.Credit ? TransactionType.Credit : TransactionType.Debt
        return new TransactionEntity(type, dto.description, dto.amount, new Date(dto.date))
    }

    static MapEntityToMessageDto(transaction: TransactionEntity): TransactionMessageDto {
        return <TransactionMessageDto> {
            type: transaction.type,
            date: transaction.date.toISOString(),
            amount: transaction.amount
        }
    }

    static MapEntityToResponseDto(transaction: TransactionEntity): TransactionResponseDto {
        return <TransactionResponseDto> {
            id: transaction.id,
            description: transaction.description,
            type: transaction.type,
            date: transaction.date.toISOString(),
            amount: transaction.amount
        }
    }

    static validateRequestDto(dto: TransactionRequestDto): void {
        if(!dto) {
            throw new Error('Invalid transaction request object')
        }
        if(!dto.type || (dto.type !== TransactionType.Credit && dto.type !== TransactionType.Debt)) {
            throw new Error('Invalid transaction type request object')
        }
        if(!dto.description) {
            throw new Error('Invalid transaction description request object')
        }
        if(!dto.amount) {
            throw new Error('Invalid transaction amount request object')
        }
        if(!dto.date) {
            throw new Error('Invalid transaction amount request object')
        }
    }
}