import { AbstractComponent } from "../../framework/abstract-component.js";

export default class PriceComparisonView extends AbstractComponent {
    constructor(data, model) {
        super();
        this.data = data;
        this.model = model;
    }

    get template() {
        if (!this.data || this.data.products.length === 0) {
            return this.getEmptyState();
        }

        return `
            <div class="card">
                <h2><i>🏪</i> Сравнение цен по магазинам</h2>
                ${this.renderComparisonTable()}
            </div>
        `;
    }

    getEmptyState() {
        return `
            <div class="card">
                <div class="empty-state">
                    <i>🏪</i>
                    <p>Добавьте товары, чтобы сравнить цены</p>
                    <p>Перейдите в "Список покупок" и добавьте товары с ценами</p>
                </div>
            </div>
        `;
    }

    renderComparisonTable() {
        let tableHTML = `
            <div class="comparison-table-container">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th class="product-column">Товар</th>
                            ${this.data.stores.map(store => `<th class="store-column">${store.name}</th>`).join('')}
                            <th>Лучшая цена</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        this.data.products.forEach(product => {
            const prices = this.data.stores.map(store => {
                const unitPrice = product.prices[store.id];
                if (!unitPrice) return '<td class="price-cell no-price">-</td>';
                const totalPrice = unitPrice * product.quantity;
                return `
                    <td class="price-cell">
                        <div class="price-display">
                            <div class="unit-price">${unitPrice} ₽</div>
                            <div class="quantity-info">× ${product.quantity}</div>
                            <div class="total-price"><strong>= ${totalPrice.toFixed(2)} ₽</strong></div>
                        </div>
                    </td>
                `;
            });

            const validPrices = this.data.stores
                .map(store => product.prices[store.id])
                .filter(price => price !== undefined);
            
            const bestUnitPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
            const bestTotalPrice = bestUnitPrice ? bestUnitPrice * product.quantity : null;
            const bestPriceStore = bestUnitPrice ? 
                this.data.stores.find(store => product.prices[store.id] === bestUnitPrice) : null;

            tableHTML += `
                <tr>
                    <td class="product-cell">
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-details">
                                <span class="product-category">${product.category}</span>
                                <span class="product-quantity">${product.quantity} шт.</span>
                            </div>
                        </div>
                    </td>
                    ${prices.join('')}
                    <td class="best-price-cell">
                        ${bestTotalPrice ? `
                            <div class="best-price-info">
                                <div class="best-store">${bestPriceStore?.name || ''}</div>
                                <div class="best-price-details">
                                    ${bestUnitPrice} ₽ × ${product.quantity}
                                </div>
                                <div class="best-total-price"><strong>${bestTotalPrice.toFixed(2)} ₽</strong></div>
                            </div>
                        ` : '-'}
                    </td>
                </tr>
            `;
        });

        const totals = this.data.stores.map(store => {
            const total = this.model.getTotalPriceForStore(store.id);
            return total ? `<td><strong>${total.toFixed(2)} ₽</strong></td>` : '<td>-</td>';
        });

        const storeTotals = this.data.stores.map(store => ({
            store,
            total: this.model.getTotalPriceForStore(store.id)
        })).filter(item => item.total > 0);

        const cheapestStore = storeTotals.length > 0 ? 
            storeTotals.reduce((min, current) => current.total < min.total ? current : min) : null;

        tableHTML += `
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td><strong>Итого</strong></td>
                            ${totals.join('')}
                            <td class="cheapest-store">
                                ${cheapestStore ? `
                                    <div class="cheapest-info">
                                        <div class="cheapest-label">Выгоднее всего:</div>
                                        <div class="cheapest-name">${cheapestStore.store.name}</div>
                                        <div class="cheapest-total">${cheapestStore.total.toFixed(2)} ₽</div>
                                    </div>
                                ` : '-'}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        return tableHTML;
    }

    update(data) {
        this.data = data;
        const newElement = this.createElement(this.template);
        if (this._element && this._element.parentNode) {
            this._element.parentNode.replaceChild(newElement, this._element);
        }
        this._element = newElement;
    }
}