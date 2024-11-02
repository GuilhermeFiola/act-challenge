import * as dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'

import { transactionRouter } from './application/router/transaction.router'
import {TransactionRepository} from './infra/repository/transaction.repository'

dotenv.config()

function main() {
    // Variables
    console.log(process.cwd())
    if (!process.env.PORT) {
        process.exit(1)
    }

    const PORT: number = parseInt(process.env.PORT as string, 10)
    const DATABASE: string = process.env.DATABASE ?? './src/infra/database/db.sqlite'

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

            app.use('/api/v1/transaction', transactionRouter)

            // Server start
            app.listen(PORT, () => {
                console.log(`Listening on port ${PORT}`)
            })
        })
}

main()