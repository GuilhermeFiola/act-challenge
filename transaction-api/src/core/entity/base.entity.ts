export class BaseEntity {
    protected _id: string

    constructor(id: string) {
        this._id = id
    }
}