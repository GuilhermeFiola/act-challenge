import * as dotenv from 'dotenv'
import {ConsolidationRepository} from '../../infra/repository/consolidation.repository'
import {ConsolidationEntity} from '../../core/entity/consolidation.entity'
import {TransactionMessageDto} from '../dto/transaction.message.dto'
import {container} from 'tsyringe'
import {CacheService} from './cache.service'
import {DateUtils} from "../../core/utils/date.utils";
import {ErrorHandler} from "../../core/utils/error.handler";

dotenv.config()

export class ConsolidationService {
    private DATABASE: string = process.env.DATABASE ?? '/src/infra/database/db.sqlite'

    private consolidationRepository: ConsolidationRepository
    private cacheService: CacheService

    constructor() {
        this.consolidationRepository = new ConsolidationRepository(this.DATABASE)
        this.cacheService = container.resolve(CacheService)
    }

    async updateConsolidation(transactionDto: TransactionMessageDto): Promise<boolean> {
        try {
            let consolidation: ConsolidationEntity
            const transactionDate = new Date(transactionDto.date)

            const consolidationDb = await this.getConsolidationByDate(transactionDate)
            if (!consolidationDb) {
                consolidation = new ConsolidationEntity(0, 0, 0, transactionDate)
            } else {
                consolidation = new ConsolidationEntity(consolidationDb.inflow, consolidationDb.outflow, consolidationDb.netValue, new Date(consolidationDb.date), consolidationDb.id)
            }

            consolidation.updateCashFlow(transactionDto.type, transactionDto.amount)

            await this.consolidationRepository.upsert(consolidation)

            this.cacheService.setCache(DateUtils.DateToDatabase(consolidation.date), consolidation)

            return true
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error updating consolidation')
            throw new Error(errorMessage)
        }
    }

    async getConsolidationByDate(date: Date): Promise<ConsolidationEntity> {
        try {
            const consolidationCache = this.cacheService.getCache(DateUtils.DateToDatabase(date))
            if (consolidationCache) return consolidationCache

            let consolidation: ConsolidationEntity
            const consolidationDb = await this.consolidationRepository.findByDate(date)
            if (!consolidationDb) {
                consolidation = new ConsolidationEntity(0, 0, 0, date)
            } else {
                consolidation = new ConsolidationEntity(consolidationDb.inflow, consolidationDb.outflow, consolidationDb.netValue, new Date(consolidationDb.date), consolidationDb.id)
            }

            this.cacheService.setCache(DateUtils.DateToDatabase(consolidation.date), consolidation)
            return consolidation
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error getting consolidation by date')
            throw new Error(errorMessage)
        }
    }
}