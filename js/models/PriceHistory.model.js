export default class PriceHistory {
    constructor(productId, storeId, price, date = new Date()) {
        this.id = `hist-${Date.now()}`;
        this.productId = productId;
        this.storeId = storeId;
        this.price = price;
        this.date = date;
    }
}