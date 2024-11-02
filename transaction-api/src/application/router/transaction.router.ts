import * as dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import {TransactionService} from "../service/transaction.service";
import {TransactionMapper} from "../../infra/mapper/transaction.mapper";

export const transactionRouter = express.Router()

dotenv.config()

transactionRouter.post('/', async (req: Request, res: Response) => {
    try {
        // Mapping DTO to Entity
        const transaction = TransactionMapper.MapDtoToEntity(req.body)

        const transactionService = new TransactionService()
        const result = await transactionService.createTransaction(transaction)
        res.status(200).send(result)
    } catch (error) {
        let errorMessage = 'Error inserting a new transaction'
        if (error instanceof Error) {
            errorMessage = error.message
        }
        res.status(500).send(errorMessage)
    }
})

transactionRouter.get('/', async (req: Request, res: Response) => {
    try {
        const transactionService = new TransactionService()
        const result = await transactionService.getAllTransactions()
        res.status(200).send(result)
    } catch (error) {
        let errorMessage = 'Error getting all transactions'
        if (error instanceof Error) {
            errorMessage = error.message
        }
        res.status(500).send(errorMessage)
    }
})