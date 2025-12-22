import { AbstractComponent } from "../../framework/abstract-component.js";

export default class ShoppingListView extends AbstractComponent {
    constructor() {
        super();
    }

    get template() {
        return `
            <div class="shopping-list-page">
                <div class="lists-header">
                    <h2>Мои списки покупок</h2>
                    <button id="create-new-list" class="btn-success"><i>➕</i> Новый список</button>
                </div>

                <div class="lists-container" id="lists-container"></div>
                
                <div class="main-content">
                    <div class="left-column">
                        <div class="card">
                            <h2><i>➕</i> Добавить товар</h2>
                            <div class="form-group">
                                <label for="product-name">Название товара</label>
                                <input type="text" id="product-name" placeholder="Например: Молоко">
                            </div>
                            <div class="form-group">
                                <label for="product-category">Категория</label>
                                <select id="product-category">
                                    <option value="Продукты">Продукты</option>
                                    <option value="Бытовая химия">Бытовая химия</option>
                                    <option value="Косметика">Косметика</option>
                                    <option value="Техника">Техника</option>
                                    <option value="Напитки">Напитки</option>
                                    <option value="Фрукты">Фрукты</option>
                                    <option value="Овощи">Овощи</option>
                                    <option value="Молочные продукты">Молочные продукты</option>
                                    <option value="Мясо и рыба">Мясо и рыба</option>
                                    <option value="Хлебобулочные изделия">Хлебобулочные изделия</option>
                                    <option value="Сладости">Сладости</option>
                                    <option value="Другое">Другое</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="product-quantity">Количество</label>
                                <input type="number" id="product-quantity" value="1" min="1" class="quantity-input">
                            </div>
                            <div class="form-group">
                                <label for="product-priority">Приоритет</label>
                                <select id="product-priority">
                                    <option value="low">Низкий</option>
                                    <option value="medium" selected>Средний</option>
                                    <option value="high">Высокий</option>
                                </select>
                            </div>
                            <button id="add-product" class="btn-success"><i>➕</i> Добавить товар</button>
                            
                            <div class="quick-actions">
                                <button class="btn-secondary btn-small" id="clear-list"><i>🗑️</i> Очистить список</button>
                                <button class="btn-warning btn-small" id="mark-all-completed"><i>✓</i> Отметить все</button>
                            </div>

                            <div class="stores-management">
                                <h3><i>🏪</i> Управление магазинами</h3>
                                <div class="form-group">
                                    <input type="text" id="new-store" placeholder="Название нового магазина">
                                    <button id="add-store" class="btn-small btn-success">Добавить магазин</button>
                                </div>
                                <div id="stores-list"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="right-column">
                        <div class="card">
                            <div class="search-sort">
                                <input type="text" id="search-products" placeholder="Поиск товаров...">
                                <button class="btn-small" id="sort-by-price"><i>↕️</i> По цене</button>
                                <button class="btn-small" id="sort-by-priority"><i>📊</i> По приоритету</button>
                            </div>

                            <div class="filter-buttons" id="store-filters"></div>
                            
                            <div class="list-header">
                                <h2><i>📋</i> Список покупок</h2>
                                <div class="list-stats" id="list-stats">
                                    <span class="stats-item">Всего: 0</span>
                                    <span class="stats-item">Куплено: 0</span>
                                    <span class="stats-item">Осталось: 0</span>
                                </div>
                            </div>
                            <div id="products-list"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    get createListButton() {
        return this.element.querySelector('#create-new-list');
    }

    get addProductButton() {
        return this.element.querySelector('#add-product');
    }

    get productNameInput() {
        return this.element.querySelector('#product-name');
    }

    get productCategorySelect() {
        return this.element.querySelector('#product-category');
    }

    get productQuantityInput() {
        return this.element.querySelector('#product-quantity');
    }

    get productPrioritySelect() {
        return this.element.querySelector('#product-priority');
    }

    get listsContainer() {
        return this.element.querySelector('#lists-container');
    }

    get productsContainer() {
        return this.element.querySelector('#products-list');
    }

    get searchInput() {
        return this.element.querySelector('#search-products');
    }

    get newStoreInput() {
        return this.element.querySelector('#new-store');
    }

    get addStoreButton() {
        return this.element.querySelector('#add-store');
    }

    get storesListContainer() {
        return this.element.querySelector('#stores-list');
    }

    get storeFiltersContainer() {
        return this.element.querySelector('#store-filters');
    }

    get sortByPriceButton() {
        return this.element.querySelector('#sort-by-price');
    }

    get sortByPriorityButton() {
        return this.element.querySelector('#sort-by-priority');
    }

    get clearListButton() {
        return this.element.querySelector('#clear-list');
    }

    get markAllCompletedButton() {
        return this.element.querySelector('#mark-all-completed');
    }

    get listStatsContainer() {
        return this.element.querySelector('#list-stats');
    }
}