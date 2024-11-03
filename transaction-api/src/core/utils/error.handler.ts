export class ErrorHandler {
    static ReturnErrorMessage(error: unknown, message: string){
        let errorMessage = message
        if (error instanceof Error) {
            errorMessage += `: ${error.message}`
        }
        return errorMessage
    }
}