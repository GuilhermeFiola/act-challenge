import { expect } from 'chai'
import sinon from 'sinon'
import proxyquire from 'proxyquire'
import {ErrorHandler} from '../../../../src/core/utils/error.handler'

const MessageBrokerStub = sinon.stub()
const TransactionRepositoryStub = sinon.stub()

const { TransactionService } = proxyquire('../../../../src/application/service/transaction.service', {
    '../../infra/broker/message.broker': { MessageBroker: MessageBrokerStub },
    '../../infra/repository/transaction.repository': { TransactionRepository: TransactionRepositoryStub }
})

describe('TransactionService', () => {
    let transactionService: any
    let transactionRepository: any
    let messageBroker: any

    beforeEach(() => {
        transactionRepository = {
            create: sinon.stub().resolves(),
            findAll: sinon.stub().resolves([])
        }

        messageBroker = {
            connect: sinon.stub().resolves(),
            sendToQueue: sinon.stub().resolves(),
            close: sinon.stub().resolves()
        }

        MessageBrokerStub.returns(messageBroker)
        TransactionRepositoryStub.returns(transactionRepository)

        transactionService = new TransactionService()
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('createTransaction', () => {
        it('Should create a transaction and return it', async () => {
            const transaction = { id: '1', type: 'C', description: 'Test', amount: 100.5, date: new Date() }

            const result = await transactionService.createTransaction(transaction)
            expect(result).to.deep.equal(transaction)
            expect(transactionRepository.create.calledOnceWith(transaction)).to.be.equal(true)
        })

        it('Should throw an error if transaction creation fails', async () => {
            const transaction = { id: '1', type: 'C', description: 'Test', amount: 100.5, date: new Date() }
            transactionRepository.create.rejects(new Error('Database error'))

            try {
                await transactionService.createTransaction(transaction)
            } catch (error) {
                const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Database error')
                expect(errorMessage).to.include('Error creating transaction: Database error')
                expect(transactionRepository.create.calledOnceWith(transaction)).to.be.equal(true)
            }
        })
    })

    describe('getAllTransactions', () => {
        it('Should return an array of transactions', async () => {
            const transactions = [{ id: '1', type: 'C', description: 'Test', amount: 100.5, date: new Date() }]
            transactionRepository.findAll.resolves(transactions)

            const result = await transactionService.getAllTransactions()
            expect(result).to.deep.equal(transactions)
            expect(transactionRepository.findAll.calledOnce).to.be.equal(true)
        })

        it('Should throw an error if retrieving transactions fails', async () => {
            transactionRepository.findAll.rejects(new Error('Database error'))

            try {
                await transactionService.getAllTransactions()
            } catch (error) {
                const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Database error')
                expect(errorMessage).to.include('Error getting all transactions: Database error')
                expect(transactionRepository.findAll.calledOnce).to.be.equal(true)
            }
        })
    })

    describe('sendTransactionMessage', () => {
        it('Should send a transaction message to the message broker', async () => {
            const transactionMessage = { id: '1', type: 'C', description: 'Test', amount: 100.5, date: new Date() }

            await transactionService.sendTransactionMessage(transactionMessage)

            expect(messageBroker.connect.calledOnce).to.be.equal(true)
            expect(messageBroker.sendToQueue.calledOnceWith(transactionMessage)).to.be.equal(true)
            expect(messageBroker.close.calledOnce).to.be.equal(true)
        })

        it('Should throw an error if sending a transaction message fails', async () => {
            const transactionMessage = { id: '1', type: 'C', description: 'Test', amount: 100.5, date: new Date() }
            messageBroker.sendToQueue.rejects(new Error('Broker error'))

            try {
                await transactionService.sendTransactionMessage(transactionMessage)
            } catch (error) {
                const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Broker error')
                expect(errorMessage).to.include('Error sending transaction to queue transactions: Broker error')
                expect(messageBroker.connect.calledOnce).to.be.equal(true)
                expect(messageBroker.sendToQueue.calledOnceWith(transactionMessage)).to.be.equal(true)
                expect(messageBroker.close.calledOnce).to.be.equal(true)
            }
        })
    })
})
