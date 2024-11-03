import {v7 as uuidv7} from 'uuid'
import {BaseEntity} from './base.entity'
import {TransactionType} from '../utils/constants'

export class TransactionEntity extends BaseEntity {
    private readonly _type: TransactionType
    private readonly _description: string
    private readonly _amount: number
    private readonly _date: Date

    constructor(type: TransactionType, description: string, amount: number, date: Date) {
        super(uuidv7())
        this._type = type
        this._description = description
        this._amount = amount
        this._date = date

        this.validate()
    }

    get id(): string {
        return this._id
    }

    get type(): string {
        return this._type
    }

    get description(): string {
        return this._description
    }

    get amount(): number {
        return this._amount
    }

    get date(): Date {
        return this._date
    }

    validate() {
        if (this._type !== TransactionType.Credit && this._type !== TransactionType.Debt) {
            throw new Error('Invalid transaction type')
        }

        if (!this._description || this._description === '') {
            throw new Error('Invalid description')
        }

        if (this._amount < 0) {
            throw new Error('Amount value should be greater than 0')
        }

        if(!this._date) {
            throw new Error('Invalid date')
        }
    }
}