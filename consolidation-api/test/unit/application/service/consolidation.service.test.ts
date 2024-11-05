import sinon from 'sinon'
import { expect } from 'chai'
import proxyquire from 'proxyquire'
import { TransactionMessageDto } from '../../../../src/application/dto/transaction.message.dto'
import { ConsolidationEntity } from '../../../../src/core/entity/consolidation.entity'
import { DateUtils } from '../../../../src/core/utils/date.utils'

const ConsolidationRepositoryStub = sinon.stub()
const CacheServiceStub = sinon.stub()

const { ConsolidationService } = proxyquire('../../../../src/application/service/consolidation.service', {
    '../../infra/repository/consolidation.repository': { ConsolidationRepository: ConsolidationRepositoryStub },
    './cache.service': { CacheService: CacheServiceStub }
})

describe('ConsolidationService', () => {
    let consolidationService: any
    let consolidationRepository: any
    let cacheService: any

    beforeEach(() => {
        consolidationRepository = {
            findByDate: sinon.stub(),
            upsert: sinon.stub(),
        }

        cacheService = {
            getCache: sinon.stub(),
            setCache: sinon.stub(),
        }

        ConsolidationRepositoryStub.returns(consolidationRepository)
        CacheServiceStub.returns(cacheService)

        consolidationService = new ConsolidationService()
    })

    afterEach(() => {
        sinon.restore()
    })

    it('Should update consolidation correctly', async () => {
        const transactionDto: TransactionMessageDto = {
            type: 'C',
            amount: 100,
            date: '2024-11-04T00:00:00.000Z'
        }

        const mockDate = new Date(transactionDto.date)

        consolidationRepository.findByDate.resolves(null)
        consolidationRepository.upsert.resolves()
        cacheService.setCache.returns(true)

        const result = await consolidationService.updateConsolidation(transactionDto)

        expect(result).to.be.equal(true)
        expect(consolidationRepository.upsert.calledWith(sinon.match.instanceOf(ConsolidationEntity))).to.be.equal(true)
        expect(cacheService.setCache.calledWith(DateUtils.DateToDatabase(mockDate), sinon.match.instanceOf(ConsolidationEntity))).to.be.equal(true)
    })

    it('Should retrieve consolidation from cache if available', async () => {
        const mockDate = new Date('2024-11-04T00:00:00.000Z')
        const cachedConsolidation = new ConsolidationEntity(200, 100, 100, mockDate)

        cacheService.getCache.returns(cachedConsolidation)

        const result = await consolidationService.getConsolidationByDate(mockDate)

        expect(result).to.equal(cachedConsolidation)
        expect(cacheService.getCache.calledWith(DateUtils.DateToDatabase(mockDate))).to.be.equal(true)
        expect(consolidationRepository.findByDate.notCalled).to.be.equal(true)
    })

    it('Should retrieve consolidation from repository if not in cache', async () => {
        const mockDate = new Date('2024-11-04T00:00:00.000Z')
        const dbConsolidation = new ConsolidationEntity(200, 100, 100, mockDate)

        cacheService.getCache.returns(null)
        consolidationRepository.findByDate.resolves(dbConsolidation)

        const result = await consolidationService.getConsolidationByDate(mockDate)

        expect(result).to.deep.equal(dbConsolidation)
        expect(consolidationRepository.findByDate.calledWith(mockDate)).to.be.equal(true)
        expect(cacheService.setCache.calledWith(DateUtils.DateToDatabase(mockDate), dbConsolidation)).to.be.equal(true)
    })
})
