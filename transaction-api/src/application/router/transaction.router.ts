import * as dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import {TransactionService} from '../service/transaction.service'
import {TransactionMapper} from '../../infra/mapper/transaction.mapper'
import {TransactionEntity} from '../../core/entity/transaction.entity'
import {ErrorHandler} from '../../core/utils/error.handler'

export const transactionRouter = express.Router()

dotenv.config()

transactionRouter.post('/', async (req: Request, res: Response) => {
    try {
        const transaction: TransactionEntity = TransactionMapper.MapRequestDtoToEntity(req.body)

        const transactionService = new TransactionService()
        const createdTransaction = await transactionService.createTransaction(transaction)

        const transactionMessage = TransactionMapper.MapEntityToMessageDto(createdTransaction)
        await transactionService.sendTransactionMessage(transactionMessage)

        const transactionResponse = TransactionMapper.MapEntityToResponseDto(createdTransaction)
        res.status(200).send(transactionResponse)
    } catch (error) {
        const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error inserting a new transaction')
        res.status(500).send(errorMessage)
    }
})

transactionRouter.get('/', async (_: Request, res: Response) => {
    try {
        const transactionService = new TransactionService()
        const result = await transactionService.getAllTransactions()

        if (!result) {
            res.status(204).send('')
            return
        }

        res.status(200).send(result)
    } catch (error) {
        const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error getting all transactions')
        res.status(500).send(errorMessage)
    }
})