import * as dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../swagger.json'

import { transactionRouter } from './application/router/transaction.router'
import {TransactionRepository} from './infra/repository/transaction.repository'

dotenv.config()

function main() {
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

    // Database

    const transactionRepository = new TransactionRepository(DATABASE)
    const promises: Array<Promise<any>> = []
    promises.push(transactionRepository.createTableStructure())

    // Configuration
    Promise.all(promises)
        .then(() => {
            app.use(helmet())
            app.use(express.json())

            app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
            app.use('/api/v1/transaction', transactionRouter)

            // Server start
            app.listen(PORT, () => {
                console.log(`Listening on port ${PORT}`)
            })
        })
}

main()