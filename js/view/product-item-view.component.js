import { AbstractComponent } from "../../framework/abstract-component.js";
import { PRIORITY_ICONS, PRIORITY_COLORS } from "../const.js";

export default class ProductItemView extends AbstractComponent {
    constructor(product, stores) {
        super();
        this.product = product;
        this.stores = stores;
    }

    get template() {
        const priceInfo = Object.entries(this.product.prices)
            .map(([storeId, unitPrice]) => {
                const store = this.stores.find(s => s.id === storeId);
                const totalPrice = unitPrice * this.product.quantity;
                return `
                    <div class="store-price">
                        <span class="store-name">${store?.name || 'Магазин'}:</span>
                        <span class="price-value">${unitPrice} ₽ × ${this.product.quantity} = <strong>${totalPrice.toFixed(2)} ₽</strong></span>
                    </div>
                `;
            })
            .join('');

        const prices = Object.values(this.product.prices);
        const bestUnitPrice = prices.length > 0 ? Math.min(...prices) : null;
        const bestTotalPrice = bestUnitPrice ? bestUnitPrice * this.product.quantity : null;
        const bestPriceStore = bestUnitPrice ? 
            this.stores.find(s => this.product.prices[s.id] === bestUnitPrice) : null;

        return `
            <div class="product-item ${this.product.completed ? 'completed' : ''}" data-id="${this.product.id}">
                <div class="product-main">
                    <div class="product-check">
                        <input type="checkbox" ${this.product.completed ? 'checked' : ''} 
                               class="product-checkbox">
                    </div>
                    <div class="product-info">
                        <div class="product-header">
                            <span class="product-name ${this.product.completed ? 'completed' : ''}">${this.product.name}</span>
                            <span class="product-priority ${PRIORITY_COLORS[this.product.priority] || ''}">
                                ${PRIORITY_ICONS[this.product.priority] || '➡️'}
                            </span>
                        </div>
                        <div class="product-details">
                            <span class="product-category">${this.product.category}</span>
                            <span class="product-quantity">${this.product.quantity} шт.</span>
                        </div>
                        ${priceInfo ? `
                            <div class="product-prices">
                                ${priceInfo}
                                ${bestUnitPrice && bestPriceStore ? `
                                    <div class="best-price">
                                        <span class="best-price-label">Лучшая цена:</span>
                                        <span class="best-price-value">${bestUnitPrice} ₽</span>
                                        <span class="best-price-store">(${bestPriceStore.name})</span>
                                        <div class="best-total">Итого: <strong>${bestTotalPrice.toFixed(2)} ₽</strong></div>
                                    </div>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="no-prices">
                                <span class="no-prices-text">Цены не указаны</span>
                            </div>
                        `}
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn-small edit-prices" title="Изменить цены">
                        <i>💰</i> Цены
                    </button>
                    <button class="btn-small btn-danger delete-product" title="Удалить">
                        <i>🗑️</i>
                    </button>
                </div>
            </div>
        `;
    }
}