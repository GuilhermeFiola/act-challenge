export interface IWrite<T> {
    upsert(item: T): Promise<boolean>
}