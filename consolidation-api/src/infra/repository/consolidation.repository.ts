import {ConsolidationEntity} from '../../core/entity/consolidation.entity'
import {IWrite} from '../../core/interface/repository/write.interface'
import {BaseRepository} from './base.repository'
import {DateUtils} from '../../core/utils/date.utils'
import {ErrorHandler} from '../../core/utils/error.handler'

export class ConsolidationRepository extends BaseRepository implements IWrite<ConsolidationEntity> {

    private readonly tableName: string = 'consolidation'

    constructor(dbName: string) {
        super(dbName)
    }

    async createTableStructure(): Promise<void> {
        try {
            await this.connect()
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                    id VARCHAR(30) NOT NULL PRIMARY KEY,
                    date DATE NOT NULL UNIQUE,
                    inflow FLOAT NOT NULL DEFAULT 0.0,
                    outflow FLOAT NOT NULL DEFAULT 0.0,
                    net_value FLOAT NOT NULL  DEFAULT 0.0
                )`

            await this.db?.exec(createTableQuery)
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error executing creating table for consolidation')
            throw new Error(errorMessage)
        }
    }

    async upsert(item: ConsolidationEntity): Promise<boolean> {
        try {
            await this.connect()
            await this.db?.run(
                `INSERT INTO ${this.tableName} (id, date, inflow, outflow, net_value) 
                 VALUES (:id, :date, :inflow, :outflow, :net_value)
                 ON CONFLICT(id) DO UPDATE 
                 SET inflow=:inflow, outflow=:outflow, net_value=:net_value`,
                {
                    ':id': item.id,
                    ':date': DateUtils.DateToDatabase(item.date),
                    ':inflow': item.inflow,
                    ':outflow': item.outflow,
                    ':net_value': item.netValue
                }
            )
            return true
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error creating or updating a consolidation')
            throw new Error(errorMessage)
        }
    }

    async findByDate(date: Date): Promise<any> {
        try {
            await this.connect()
            return await this.db?.get(
                `SELECT id, date, inflow, outflow, net_value AS netValue 
                 FROM ${this.tableName}
                 WHERE date=?`,
                DateUtils.DateToDatabase(date)
            )
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error returning consolidation by date')
            throw new Error(errorMessage)
        }
    }
}