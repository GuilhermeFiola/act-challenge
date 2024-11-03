import amqp, { Connection, Channel, Options } from 'amqplib'
import {ErrorHandler} from '../../core/utils/error.handler'

export class MessageBroker {
    private connection: Connection | null = null
    private channel: Channel | null = null
    private readonly url: string
    private readonly queueName: string

    constructor(url: string, queueName: string) {
        this.url = url
        this.queueName = queueName
    }

    async connect(): Promise<void> {
        if (this.connection) return

        try {
            this.connection = await amqp.connect(this.url)
            this.channel = await this.connection.createChannel()
        } catch (error) {
            const errorMessage = ErrorHandler.ReturnErrorMessage(error, 'Error connecting to message queue')
            throw new Error(errorMessage)
        }
    }

    async assertQueue(options?: Options.AssertQueue): Promise<void> {
        if (!this.channel) throw new Error('Channel is not created. Call connect() first.')

        await this.channel?.assertQueue(this.queueName, {
            durable: true,
            ...options
        })
    }

    async sendToQueue(message: object): Promise<void> {
        await this.assertQueue()
        const messageBuffer = Buffer.from(JSON.stringify(message))
        this.channel?.sendToQueue(this.queueName, messageBuffer, { persistent: true })
    }

    async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close()
        }
        if (this.connection) {
            await this.connection.close()
        }
    }
}
