export class DateUtils {
    static DateToDatabase(date: Date): string {
        return date.toISOString().split('T')[0]
    }
}