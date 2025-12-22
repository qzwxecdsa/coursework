import { AbstractComponent } from "../../framework/abstract-component.js";

export default class AnalyticsView extends AbstractComponent {
    constructor(analytics, priceHistory) {
        super();
        this.analytics = analytics;
        this.priceHistory = priceHistory;
    }

    get template() {
        if (!this.analytics) {
            return this.getEmptyState();
        }

        const completionPercentage = this.analytics.totalProducts > 0 
            ? Math.round((this.analytics.completedProducts / this.analytics.totalProducts) * 100)
            : 0;

        return `
            <div class="card">
                <div class="tabs" id="analytics-tabs">
                    <div class="tab active" data-tab="analytics">Аналитика</div>
                    <div class="tab" data-tab="history">История цен</div>
                    <div class="tab" data-tab="economy">Экономия</div>
                </div>
                
                <div class="tab-content active" id="analytics-tab-content">
                    ${this.renderAnalyticsTab(completionPercentage)}
                </div>
                
                <div class="tab-content" id="history-tab-content">
                    ${this.renderHistoryTab()}
                </div>

                <div class="tab-content" id="economy-tab-content">
                    ${this.renderEconomyTab()}
                </div>
            </div>
        `;
    }

    getEmptyState() {
        return `
            <div class="card">
                <div class="empty-state">
                    <i>📊</i>
                    <p>Нет данных для аналитики</p>
                    <p>Выберите список покупок</p>
                </div>
            </div>
        `;
    }

    renderAnalyticsTab(completionPercentage) {
        return `
            <h2><i>📊</i> Аналитика корзины</h2>
            <div class="analytics-grid">
                <div class="stat-card">
                    <div class="stat-value">${this.analytics.totalProducts}</div>
                    <div class="stat-title">Всего товаров</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.analytics.completedProducts}</div>
                    <div class="stat-title">Куплено</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${completionPercentage}%</div>
                    <div class="stat-title">Выполнено</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.analytics.totalCost.toFixed(2)} ₽</div>
                    <div class="stat-title">Общая стоимость</div>
                </div>
            </div>
            
            <h3>Товары по категориям</h3>
            <div class="categories-list">
                ${Object.entries(this.analytics.byCategory).map(([category, count]) => `
                    <div class="category-item">
                        <span class="category-name">${category}</span>
                        <span class="category-count">${count}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderHistoryTab() {
        if (this.priceHistory.length === 0) {
            return `
                <h2><i>📈</i> История цен</h2>
                <div class="empty-state">
                    <i>📈</i>
                    <p>История цен пуста</p>
                    <p>Обновите цены на товары, чтобы увидеть изменения</p>
                </div>
            `;
        }

        return `
            <h2><i>📈</i> История цен</h2>
            <div class="price-history-list">
                ${this.priceHistory.slice(0, 10).map(record => `
                    <div class="price-history-item">
                        <div class="price-history-header">
                            <span class="product-name">${record.productName}</span>
                            <span class="price-history-store">${record.storeName}</span>
                        </div>
                        <div class="price-history-details">
                            <span class="old-price">${record.oldPrice} ₽</span>
                            <span class="price-change-arrow">→</span>
                            <span class="new-price">${record.newPrice} ₽</span>
                            <span class="price-change ${record.change >= 0 ? 'increase' : 'decrease'}">
                                ${record.change >= 0 ? '+' : ''}${record.change.toFixed(2)} ₽
                                (${record.change >= 0 ? '+' : ''}${record.percentageChange}%)
                            </span>
                        </div>
                        <div class="price-history-date">${record.date}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEconomyTab() {
        return `
            <h2><i>💰</i> Статистика экономии</h2>
            <div class="economy-stats">
                <div class="analytics-grid">
                    <div class="stat-card">
                        <div class="stat-value economy-total">${this.calculateTotalEconomy()} ₽</div>
                        <div class="stat-title">Общая экономия</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value economy-avg">${this.calculateAvgEconomy()} ₽</div>
                        <div class="stat-title">Средняя на товар</div>
                    </div>
                </div>
                
                <h3>Экономия по магазинам</h3>
                <div class="store-economy">
                    ${this.getStoreEconomy()}
                </div>
            </div>
        `;
    }

    calculateTotalEconomy() {
        if (!this.analytics || !this.priceHistory.length) return '0.00';
        
        let totalEconomy = 0;
        const priceChanges = this.priceHistory.filter(record => record.change < 0);
        priceChanges.forEach(record => {
            totalEconomy += Math.abs(record.change);
        });
        
        return totalEconomy.toFixed(2);
    }

    calculateAvgEconomy() {
        if (!this.analytics || !this.priceHistory.length) return '0.00';
        
        const totalEconomy = parseFloat(this.calculateTotalEconomy());
        const uniqueProducts = new Set(this.priceHistory.map(record => record.productId)).size;
        return uniqueProducts > 0 ? (totalEconomy / uniqueProducts).toFixed(2) : '0.00';
    }

    getStoreEconomy() {
        if (!this.priceHistory.length) {
            return '<div class="empty-state">Нет данных по экономии</div>';
        }
        
        const storeEconomy = {};
        this.priceHistory.forEach(record => {
            if (record.change < 0) {
                if (!storeEconomy[record.storeName]) {
                    storeEconomy[record.storeName] = 0;
                }
                storeEconomy[record.storeName] += Math.abs(record.change);
            }
        });
        
        const stores = Object.entries(storeEconomy)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (stores.length === 0) {
            return '<div class="empty-state">Нет данных по экономии</div>';
        }
        
        return stores.map(([storeName, economy]) => `
            <div class="store-economy-item">
                <span class="store-name">${storeName}</span>
                <span class="store-savings">${economy.toFixed(2)} ₽</span>
            </div>
        `).join('');
    }

    update(analytics, priceHistory) {
        this.analytics = analytics;
        this.priceHistory = priceHistory;
        
        const newElement = this.createElement(this.template);
        if (this._element && this._element.parentNode) {
            this._element.parentNode.replaceChild(newElement, this._element);
        }
        this._element = newElement;
    }
}