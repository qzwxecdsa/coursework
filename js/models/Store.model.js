export default class Store {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.createdAt = new Date();
    }
}