import * as dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../swagger.json'

import { consolidationRouter } from './application/router/consolidation.router'
import {ConsolidationRepository} from './infra/repository/consolidation.repository'
import {TransactionService} from './application/service/transaction.service'

dotenv.config()

async function main() {
    // Variables

    if (!process.env.PORT) {
        console.error('API port is required')
        process.exit(1)
    }

    if (!process.env.DATABASE) {
        console.error('Database path is required')
        process.exit(1)
    }

    if (!process.env.BROKER_URL) {
        console.error('Broker URL is required')
        process.exit(1)
    }

    const PORT: number = parseInt(process.env.PORT as string, 10)
    const DATABASE: string = process.env.DATABASE ?? ''

    const app = express()

    // Queue process
    const transactionService = new TransactionService()
    await transactionService.transactionBroker()

    // Database

    const consolidationRepository = new ConsolidationRepository(DATABASE)
    const promises: Array<Promise<any>> = []
    promises.push(consolidationRepository.createTableStructure())

    // Configuration

    Promise.all(promises)
        .then(() => {
            app.use(helmet())
            app.use(express.json())

            app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
            app.use('/api/v1/consolidation', consolidationRouter)

            // Server start
            app.listen(PORT, () => {
                console.log(`Listening on port ${PORT}`)
            })
        })
}

main()
