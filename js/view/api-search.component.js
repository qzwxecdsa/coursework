import { AbstractComponent } from "../../framework/abstract-component.js";

export default class ApiSearchComponent extends AbstractComponent {
    constructor(model, onImportProduct) {
        super();
        this.model = model;
        this.onImportProduct = onImportProduct;
        this.searchResults = [];
        this.isSearching = false;
        this.searchQuery = '';
    }

    get template() {
        return `
            <div class="api-search-container">
                <div class="api-search-header">
                    <h3><i class="fas fa-database"></i> Поиск товаров в базе данных</h3>
                    <p>Найдите товары из общей базы и добавьте их в свой список</p>
                </div>
                
                <div class="search-input-container">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" 
                               id="api-search-input" 
                               placeholder="Введите название товара..."
                               value="${this.searchQuery}">
                        ${this.isSearching ? `
                            <span class="search-spinner">
                                <i class="fas fa-spinner fa-spin"></i>
                            </span>
                        ` : ''}
                    </div>
                    <button id="clear-api-search" class="btn-small btn-secondary">
                        <i class="fas fa-times"></i> Очистить
                    </button>
                </div>
                
                ${this.searchResults.length > 0 ? this.renderSearchResults() : this.renderEmptyState()}
                
                ${this.model.apiError ? this.renderError() : ''}
            </div>
        `;
    }

    renderSearchResults() {
        return `
            <div class="search-results">
                <div class="results-header">
                    <h4>Найдено товаров: ${this.searchResults.length}</h4>
                </div>
                
                <div class="results-grid">
                    ${this.searchResults.slice(0, 6).map(product => `
                        <div class="api-product-card" data-id="${product.id}">
                            <div class="product-image">
                                ${product.image ? `
                                    <img src="${product.image}" alt="${product.name}">
                                ` : `
                                    <div class="image-placeholder">
                                        <i class="fas fa-box"></i>
                                    </div>
                                `}
                            </div>
                            
                            <div class="product-info">
                                <h5 class="product-name">${product.name}</h5>
                                
                                <div class="product-meta">
                                    ${product.category ? `
                                        <span class="product-category">
                                            <i class="fas fa-tag"></i> ${product.category}
                                        </span>
                                    ` : ''}
                                    
                                    ${product.typicalPrice ? `
                                        <span class="product-price">
                                            <i class="fas fa-tag"></i> ${product.typicalPrice} ₽
                                        </span>
                                    ` : ''}
                                </div>
                                
                                ${product.description ? `
                                    <p class="product-description">${product.description}</p>
                                ` : ''}
                                
                                <div class="product-details">
                                    ${product.unit ? `
                                        <span class="product-unit">
                                            <i class="fas fa-weight"></i> ${product.unit}
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <div class="product-actions">
                                <button class="btn-small btn-success import-api-product" data-id="${product.id}">
                                    <i class="fas fa-cart-plus"></i> Добавить
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${this.searchResults.length > 6 ? `
                    <div class="results-footer">
                        <p>Показано 6 из ${this.searchResults.length} товаров</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderEmptyState() {
        if (this.searchQuery) {
            return `
                <div class="empty-search">
                    <i class="fas fa-search"></i>
                    <p>По запросу "${this.searchQuery}" товары не найдены</p>
                </div>
            `;
        }
        
        return `
            <div class="empty-search">
                <i class="fas fa-database"></i>
                <p>Введите название товара для поиска в базе данных</p>
                <p class="hint">Например: "молоко", "хлеб", "яйца"</p>
            </div>
        `;
    }

    renderError() {
        return `
            <div class="api-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ошибка подключения к API</p>
                <p class="error-details">${this.model.apiError}</p>
                <button class="btn-small btn-secondary" id="retry-api">
                    <i class="fas fa-redo"></i> Попробовать снова
                </button>
            </div>
        `;
    }

    afterRender() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchInput = this.element.querySelector('#api-search-input');
        const clearButton = this.element.querySelector('#clear-api-search');
        const importButtons = this.element.querySelectorAll('.import-api-product');
        const retryButton = this.element.querySelector('#retry-api');

        let searchTimeout;

        if (searchInput) {
            searchInput.addEventListener('input', async (e) => {
                this.searchQuery = e.target.value.trim();
                clearTimeout(searchTimeout);
                
                if (this.searchQuery.length >= 2) {
                    searchTimeout = setTimeout(async () => {
                        await this.performSearch();
                    }, 500);
                } else if (this.searchQuery.length === 0) {
                    this.searchResults = [];
                    this.update();
                }
            });
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.searchQuery = '';
                this.searchResults = [];
                if (searchInput) searchInput.value = '';
                this.update();
            });
        }

        importButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('button').dataset.id;
                this.handleImportProduct(productId);
            });
        });

        if (retryButton) {
            retryButton.addEventListener('click', async () => {
                await this.model.refreshApiData();
                this.update();
            });
        }
    }

    async performSearch() {
        try {
            this.isSearching = true;
            this.update();
            
            const results = await this.model.searchApiProducts(this.searchQuery);
            this.searchResults = results;
            
            this.isSearching = false;
            this.update();
        } catch (error) {
            this.isSearching = false;
            this.update();
        }
    }

    async handleImportProduct(productId) {
        try {
            const product = this.model.importApiProduct(productId);
            if (product && this.onImportProduct) {
                this.onImportProduct(product);
                
                const card = this.element.querySelector(`[data-id="${productId}"]`);
                if (card) {
                    card.classList.add('imported');
                    setTimeout(() => {
                        card.classList.remove('imported');
                    }, 2000);
                }
                
                this.searchQuery = '';
                this.searchResults = [];
                const searchInput = this.element.querySelector('#api-search-input');
                if (searchInput) searchInput.value = '';
                this.update();
            }
        } catch (error) {
        }
    }

    update() {
        const newElement = this.createElement(this.template);
        if (this._element && this._element.parentNode) {
            this._element.parentNode.replaceChild(newElement, this._element);
        }
        this._element = newElement;
        this.afterRender();
    }
}