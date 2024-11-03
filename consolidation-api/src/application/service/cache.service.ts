import NodeCache from 'node-cache'
import {decorators} from 'tsyringe'
const {singleton} = decorators

@singleton()
export class CacheService {
    private cache: NodeCache

    constructor() {
        this.cache = new NodeCache({ stdTTL: 100 })
    }

    setCache(key: string, value: any): boolean {
        try {
            return this.cache.set(key, value)
        } catch (error) {
            let errorMessage = 'Error setting cache'
            if (error instanceof Error) {
                errorMessage += `: ${error.message}`
            }
            console.error(errorMessage)
            return false
        }
    }

    getCache(key: string): any {
        try {
            return this.cache.get(key)
        } catch (error) {
            let errorMessage = 'Error getting cache'
            if (error instanceof Error) {
                errorMessage += `: ${error.message}`
            }
            console.error(errorMessage)
            return false
        }
    }
}