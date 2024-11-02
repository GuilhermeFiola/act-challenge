import {v7 as uuidv7} from 'uuid'
import {BaseEntity} from './base.entity'

export class TransactionEntity extends BaseEntity {
    private readonly _type: string
    private readonly _description: string
    private readonly _amount: number
    private readonly _date: Date

    constructor(type: string, description: string, amount: number, date: Date) {
        super(uuidv7())
        this._type = type
        this._description = description
        this._amount = amount
        this._date = date
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
}