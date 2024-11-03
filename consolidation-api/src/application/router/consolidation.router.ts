import * as dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import {ConsolidationService} from '../service/consolidation.service'
import {ErrorHandler} from '../../core/utils/error.handler'
import {ConsolidationMapper} from '../../infra/mapper/consolidation.mapper'

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
        const consolidation = await consolidationService.getConsolidationByDate(new Date(date))

        if (!consolidation) {
            res.status(204).send('')
            return
        }

        const response = ConsolidationMapper.MapEntityToResponseDto(consolidation)
        res.status(200).send(response)
    } catch (error) {
        const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error getting consolidation values on specific date')
        res.status(500).send(errorMessage)
    }
})