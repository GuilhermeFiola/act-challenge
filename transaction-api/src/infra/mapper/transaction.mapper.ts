import {TransactionDto} from "../../application/dto/transaction.dto";
import {TransactionEntity} from "../../core/entity/transaction.entity";

export class TransactionMapper {
    static MapDtoToEntity(dto: TransactionDto): TransactionEntity {
        this.validateDto(dto)
        return new TransactionEntity(dto.type, dto.description, dto.amount, new Date(dto.date))
    }

    static validateDto(dto: TransactionDto): void {
        if(!dto) {
            throw new Error('Invalid transaction request object')
        }
        if(!dto.type) {
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