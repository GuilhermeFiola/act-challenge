import sinon from 'sinon'
import { expect } from 'chai'
import proxyquire from 'proxyquire'

describe('CacheService', () => {
    let CacheService: any
    let cacheService: any
    let nodeCacheStub: any

    beforeEach(() => {
        nodeCacheStub = {
            set: sinon.stub(),
            get: sinon.stub()
        }

        CacheService = proxyquire('../../../../src/application/service/cache.service', {
            'node-cache': function() {
                return nodeCacheStub
            }
        }).CacheService

        cacheService = new CacheService()
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('setCache', () => {
        it('Should set a value in the cache and return true', () => {
            nodeCacheStub.set.returns(true)

            const result = cacheService.setCache('testKey', 'testValue')

            expect(result).to.be.equal(true)
            expect(nodeCacheStub.set.calledOnceWith('testKey', 'testValue')).to.be.equal(true)
        })

        it('Should handle errors and return false if cache setting fails', () => {
            nodeCacheStub.set.throws(new Error('Cache set failed'))

            const result = cacheService.setCache('testKey', 'testValue')

            expect(result).to.be.equal(false)
            expect(nodeCacheStub.set.calledOnceWith('testKey', 'testValue')).to.be.equal(true)
        })
    })

    describe('getCache', () => {
        it('Should get a value from the cache', () => {
            nodeCacheStub.get.returns('cachedValue')

            const result = cacheService.getCache('testKey')

            expect(result).to.equal('cachedValue')
            expect(nodeCacheStub.get.calledOnceWith('testKey')).to.be.equal(true)
        })

        it('Should handle errors and return false if cache retrieval fails', () => {
            nodeCacheStub.get.throws(new Error('Cache get failed'))

            const result = cacheService.getCache('testKey')

            expect(result).to.be.equal(false)
            expect(nodeCacheStub.get.calledOnceWith('testKey')).to.be.equal(true)
        })
    })
})
