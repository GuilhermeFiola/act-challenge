import {v7 as uuidv7} from 'uuid'
import {BaseEntity} from './base.entity'
import {TransactionType} from "../utils/constants";

export class ConsolidationEntity extends BaseEntity {
    private _inflow: number
    private _outflow: number
    private _netValue: number
    private readonly _date: Date

    constructor(inflow: number, outflow: number, netValue: number, date: Date, id?: string) {
        super(id ?? uuidv7())
        this._inflow = inflow
        this._outflow = outflow
        this._netValue = netValue
        this._date = date
    }

    get id(): string {
        return this._id
    }

    get inflow(): number {
        return this._inflow
    }

    get outflow(): number {
        return this._outflow
    }

    get netValue(): number {
        return this._netValue
    }

    get date(): Date {
        return this._date
    }

    updateCashFlow(type: string, amount: number): void {
        if (type === TransactionType.Credit) this._inflow += amount
        if (type === TransactionType.Debt) this._outflow += amount
        this._netValue = this._inflow - this._outflow
    }
}