export interface IWrite<T> {
    create(item: T): Promise<boolean>
}