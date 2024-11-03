import * as dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import {ConsolidationService} from '../service/consolidation.service'
import {ErrorHandler} from "../../core/utils/error.handler";

export const consolidationRouter = express.Router()

dotenv.config()

consolidationRouter.get('/:date', async (req: Request, res: Response) => {
    try {
        const { date } = req.params

        const parameterDate = new Date(date)
        if (parameterDate.toString() === 'Invalid Date') {
            res.status(400).send('Incorrect date parameter')
            return
        }

        const consolidationService = new ConsolidationService()
        const result = await consolidationService.getConsolidationByDate(new Date(date))
        res.status(200).send(result)
    } catch (error) {
        const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error getting consolidation values on specific date')
        res.status(500).send(errorMessage)
    }
})