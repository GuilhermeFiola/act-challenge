import { expect } from 'chai'
import sinon from 'sinon'
import proxyquire from 'proxyquire'

const MessageBrokerStub = sinon.stub()
const ConsolidationServiceStub = sinon.stub()

const { TransactionService } = proxyquire('../../../../src/application/service/transaction.service', {
    '../../infra/broker/message.broker': { MessageBroker: MessageBrokerStub },
    './consolidation.service': { ConsolidationService: ConsolidationServiceStub }
})

describe('TransactionService', () => {
    let transactionService: any
    let messageBroker: any
    let consolidationService: any


    beforeEach(() => {
        consolidationService = {
            updateConsolidation: sinon.stub().resolves(true)
        }

        messageBroker = {
            connect: sinon.stub().resolves(),
            consumeMessages: sinon.stub()
        }

        MessageBrokerStub.returns(messageBroker)
        ConsolidationServiceStub.returns(consolidationService)

        transactionService = new TransactionService()
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('transactionBroker', () => {
        it('Should connect to the message broker and consume messages', async () => {
            const msg = { content: Buffer.from(JSON.stringify({ type: 'C', amount: 100, date: '2024-11-04T00:00:00Z' })) }
            messageBroker.consumeMessages.callsFake(async (callback: any) => {
                await callback(msg)
            })

            await transactionService.transactionBroker()

            expect(messageBroker.connect.calledOnce).to.be.equal(true)
            expect(messageBroker.consumeMessages.calledOnce).to.be.equal(true)
            expect(consolidationService.updateConsolidation.calledOnce).to.be.equal(true)
        })

        it('Should handle errors during message processing', async () => {
            consolidationService.updateConsolidation.rejects(new Error('Update failed'))
            const consoleErrorStub = sinon.stub(console, 'error')
            const msg = { content: Buffer.from(JSON.stringify({ type: 'C', amount: 100,  date: '2024-11-04T00:00:00Z' })) }
            messageBroker.consumeMessages.callsFake(async (callback: any) => {
                await callback(msg)
            })

            await transactionService.transactionBroker()

            expect(consoleErrorStub.calledWith(sinon.match(/Error on message received/))).to.be.equal(true)
        })

        it('Should log an error if JSON parsing fails', async () => {
            const consoleErrorStub = sinon.stub(console, 'error')
            const msg = { content: Buffer.from('{ invalid json }') }
            messageBroker.consumeMessages.callsFake(async (callback: any) => {
                await callback(msg)
            })

            await transactionService.transactionBroker()

            expect(consoleErrorStub.calledWith(sinon.match(/Error on message received/))).to.be.equal(true)
        })
    })
})
